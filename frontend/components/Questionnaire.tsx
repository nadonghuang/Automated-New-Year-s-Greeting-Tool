"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, PenTool, MessageCircle, Wand2, X, BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { cn, API_BASE_URL } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

interface HistoryEntry {
    question: string;
    answer: string;
}

const MODELS = [
    { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2 (推荐)", desc: "高性价比，中文及理解力极强" },
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (推理)", desc: "深度思考，适合复杂祝福逻辑" },
    { id: "openai/gpt-5.2", name: "GPT-5.2 (全能)", desc: "OpenAI 旗舰模型，极具创意" },
    { id: "openai/gpt-5-nano", name: "GPT-5 Nano (疾速)", desc: "响应极快，适合简短祝福" },
    { id: "anthropic/claude-opus-4.6", name: "Claude Opus 4.6", desc: "文体极佳，风格自然优雅" },
    { id: "google/gemini-3-pro-preview", name: "Gemini 3 Pro Preview", desc: "谷歌旗舰，超强上下文理解" },
    { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash Preview", desc: "谷歌最新，速度与质量兼备" },
    { id: "qwen/qwen3-max", name: "Qwen3 Max", desc: "中文语境专家，成语运用自如" },
];

// ========== 5 个基础问题 (纯前端，不走 API) ==========
const BASIC_QUESTIONS = [
    {
        question: "这份祝福是送给谁的？对方是什么身份？",
        options: ["父母长辈", "领导老板", "暗恋对象", "多年老友", "重要客户", "同事伙伴", "老师/恩师", "兄弟姐妹"]
    },
    {
        question: "您平时怎么称呼对方？（祝福语开头会用到）",
        options: ["直呼其名", "哥/姐/叔/阿姨等亲属称呼", "老师/领导等职业称呼", "昵称/外号", "宝贝/亲爱的等亲密称呼", "我想自己输入称呼"]
    },
    {
        question: "你和对方的关系亲密程度如何？",
        options: ["非常亲密，无话不说", "关系不错，经常联系", "普通朋友，偶尔寒暄", "比较正式，保持距离", "很久没联系，想借新年重新问候"]
    },
    {
        question: "您希望祝福语呈现什么样的文风和语气？",
        options: ["正式稳重", "幽默调皮", "文艺煽情", "简单大方", "古风辞藻", "热情洋溢", "温馨暖心"]
    },
    {
        question: "您期望祝福语大概多长？",
        options: ["简短有力（50字以内）", "适中精炼（50-100字）", "走心长文（100-200字）", "超长深情（200字以上）", "随AI发挥，不限字数"]
    },
    {
        question: "祝福语使用什么语言？",
        options: ["纯中文", "中英双语对照", "纯英文", "中文为主，穿插几句英文点缀"]
    },
    {
        question: "过去一年，你们之间有什么共同回忆或对方有哪些值得庆贺的成就？",
        options: ["一起旅行过", "对方刚升职/事业有成", "低谷时互相支持过", "生活中的小确幸", "对方刚结婚/有了宝宝", "暂无特别回忆"]
    },
    {
        question: "新的一年，您最希望对方获得什么？",
        options: ["身体健康/岁岁平安", "财源广进/事业腾飞", "脱单成功/良缘降临", "心态轻松/自由自在", "学业进步/金榜题名", "家庭和睦/阖家欢乐"]
    },
    {
        question: "有没有不想在祝福里提到的敏感话题？",
        options: ["不要提感情/婚姻", "不要提工作/收入", "不要提年龄/健康", "不要提孩子/生育", "没有禁忌，随便写"]
    },
    {
        question: "需要在祝福语中加入表情符号（emoji）吗？",
        options: ["要！多来几个🎉🧧🐴", "适当点缀几个就好", "不要emoji，纯文字更真诚", "随AI判断"]
    },
    {
        question: "关于马年元素和特殊要求🐴",
        options: ["必须包含'马'字成语（如马到成功）", "融入马年意象但不要刻意", "加入对方名字的谐音梗", "引用一句诗词或名言", "不需要特殊花样", "我想自己补充要求"]
    }
];

export default function Questionnaire({ contactName, onSubmit, onCancel }: { contactName: string, onSubmit: (greeting: string) => void, onCancel: () => void }) {
    const [step, setStep] = useState<"model" | "basic" | "ai_deep" | "generating">("model");
    const [selectedModel, setSelectedModel] = useState("deepseek/deepseek-chat");

    // All answers collected
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // Basic question index (0-4)
    const [basicIndex, setBasicIndex] = useState(0);

    // AI deep question
    const [currentAIQuestion, setCurrentAIQuestion] = useState<{ question: string, options: string[] } | null>(null);
    const [loadingQuestion, setLoadingQuestion] = useState(false);
    const [aiQuestionCount, setAiQuestionCount] = useState(0);

    // Custom input
    const [customAnswer, setCustomAnswer] = useState("");
    const [showCustom, setShowCustom] = useState(false);

    // ========== Step 1: Choose model, then go to basic ==========
    const startInterview = (modelId: string) => {
        setSelectedModel(modelId);
        setStep("basic");
        setBasicIndex(0);
    };

    // ========== Step 2: Handle basic question answers (local, no API) ==========
    const handleBasicAnswer = (answer: string) => {
        const q = BASIC_QUESTIONS[basicIndex];
        const newHistory = [...history, { question: q.question, answer }];
        setHistory(newHistory);
        setShowCustom(false);
        setCustomAnswer("");

        if (basicIndex + 1 < BASIC_QUESTIONS.length) {
            // Next basic question
            setBasicIndex(basicIndex + 1);
        } else {
            // All 10 basic done -> enter AI deep phase
            setStep("ai_deep");
            fetchAIQuestion(selectedModel, newHistory);
        }
    };

    // ========== Step 3: AI deep interview ==========
    const fetchAIQuestion = async (modelId: string, currentHistory: HistoryEntry[]) => {
        setLoadingQuestion(true);
        setCurrentAIQuestion(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/generate/question`, {
                contact_name: contactName,
                history: currentHistory,
                model: modelId
            });

            if (res.data.is_final || !res.data.question) {
                // AI says enough info, generate!
                generateGreeting(modelId, currentHistory);
            } else {
                setCurrentAIQuestion({
                    question: res.data.question,
                    options: res.data.options || []
                });
                setAiQuestionCount(prev => prev + 1);
                setShowCustom(false);
                setCustomAnswer("");
            }
        } catch (e: any) {
            console.error("AI question error:", e);
            // On error, just go generate with what we have
            if (currentHistory.length >= 5) {
                generateGreeting(modelId, currentHistory);
            } else {
                toast.error("模型响应异常，请检查 API Key 或网络连接");
                onCancel();
            }
        } finally {
            setLoadingQuestion(false);
        }
    };

    const handleAIAnswer = (answer: string) => {
        if (!currentAIQuestion) return;
        const newHistory = [...history, { question: currentAIQuestion.question, answer }];
        setHistory(newHistory);
        setShowCustom(false);
        setCustomAnswer("");
        fetchAIQuestion(selectedModel, newHistory);
    };

    // ========== Step 4: Generate final greeting ==========
    const generateGreeting = async (modelId: string, finalHistory: HistoryEntry[]) => {
        setStep("generating");
        try {
            const res = await axios.post(`${API_BASE_URL}/generate/final`, {
                contact_name: contactName,
                history: finalHistory,
                model: modelId
            });
            onSubmit(res.data.greeting);
        } catch (e) {
            toast.error("生成最终祝福时出错，请检查网络");
            setStep("ai_deep");
        }
    };

    // ========== Render helpers ==========
    const totalSteps = BASIC_QUESTIONS.length + aiQuestionCount + (loadingQuestion ? 1 : 0);
    const currentStep = history.length;

    const renderQuestionUI = (question: string, options: string[], onAnswer: (ans: string) => void) => (
        <div className="flex-1 flex flex-col justify-center gap-10 animate-in slide-in-from-right-8 duration-700 ease-out relative">
            <div className="relative">
                <div className="absolute -left-6 top-1 bottom-1 w-1 bg-cny-red rounded-full shadow-[0_0_15px_rgba(230,0,18,0.5)]" />
                <h4 className="text-3xl font-black text-white leading-tight tracking-tight max-w-2xl">
                    {question}
                </h4>
                <p className="text-xs font-black text-cny-gold uppercase tracking-widest mt-3 opacity-80">AI 正在根据您的回答 调优后续生成逻辑...</p>
            </div>

            {!showCustom ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {options.map((opt, idx) => (
                        <motion.button
                            key={opt}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => onAnswer(opt)}
                            className="group relative w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cny-gold/40 hover:bg-white/10 transition-all text-left active:scale-[0.98] shadow-lg"
                        >
                            <p className="relative z-10 font-bold text-gray-200 group-hover:text-cny-gold text-lg transition-colors leading-snug">
                                {opt}
                            </p>
                        </motion.button>
                    ))}
                    <button
                        onClick={() => setShowCustom(true)}
                        className="sm:col-span-2 w-full p-6 rounded-2xl border border-dashed border-white/20 text-gray-400 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 hover:border-cny-gold/30 hover:text-cny-gold transition-all group"
                    >
                        <PenTool size={16} />
                        <span>手动补充个性化细节</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in zoom-in-98 duration-300">
                    <textarea
                        className="w-full h-56 p-8 rounded-3xl bg-black/60 border border-white/10 focus:border-cny-gold focus:bg-black/80 outline-none transition-all font-bold text-white text-xl leading-relaxed placeholder:text-gray-700 shadow-inner"
                        placeholder="请输入具体的要求或背景信息，帮助 AI 更有温度地创作..."
                        value={customAnswer}
                        onChange={(e) => setCustomAnswer(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-4">
                        <button onClick={() => setShowCustom(false)} className="flex-1 py-5 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all border border-white/10 text-[11px] uppercase tracking-widest">返回选项</button>
                        <button
                            onClick={() => onAnswer(customAnswer)}
                            disabled={!customAnswer.trim()}
                            className="flex-[2] py-5 rounded-2xl btn-hongbao text-white font-black text-xl shadow-2xl transition-all disabled:opacity-20 border border-white/10"
                        >确认为 TA 注入灵感</button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col relative group"
        >
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">取消操作</span>
                <button
                    onClick={onCancel}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-950/40 hover:text-cny-red text-gray-500 flex items-center justify-center transition-all border border-white/10"
                >
                    <X size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {/* ===== Model Selection ===== */}
                {step === "model" && (
                    <motion.div key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 flex flex-col h-full">
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 bg-cny-red rounded-full shadow-[0_0_8px_var(--cny-red)]" />
                                <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Step 01: Engine Selection</span>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight">选择创作模型</h3>
                            <p className="text-gray-400 text-sm mt-1 opacity-60">不同的模型在语气和创意上有微小差异。</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {MODELS.map((m, idx) => (
                                <motion.button
                                    key={m.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    onClick={() => startInterview(m.id)}
                                    className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-cny-gold/30 hover:bg-white/[0.08] transition-all text-left flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-gray-500 group-hover:text-cny-gold transition-colors border border-white/5">
                                        <Wand2 size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-black text-white group-hover:text-cny-gold transition-colors">{m.name}</p>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">{m.desc}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ===== Basic Questions ===== */}
                {step === "basic" && (
                    <motion.div key="basic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 glass-tech rounded-xl flex items-center justify-center text-cny-gold border border-white/10 shadow-xl">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">基础偏好设定</h3>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                    目标: {contactName} <span className="text-cny-red mx-1">/</span> 进度 {basicIndex + 1} of {BASIC_QUESTIONS.length}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            {renderQuestionUI(
                                BASIC_QUESTIONS[basicIndex].question,
                                BASIC_QUESTIONS[basicIndex].options,
                                handleBasicAnswer
                            )}
                        </div>

                        {/* Progress Track */}
                        <div className="mt-10">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">基础信息同步中</span>
                                    <span className="text-[9px] text-cny-red font-bold mt-0.5">Step {basicIndex + 1} / {BASIC_QUESTIONS.length}</span>
                                </div>
                                <span className="text-xl font-black text-white neo-text-gold">{Math.round(((basicIndex + 1) / BASIC_QUESTIONS.length) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cny-red to-orange-500 rounded-full shadow-[0_0_15px_rgba(230,0,18,0.5)]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${((basicIndex + 1) / BASIC_QUESTIONS.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== AI Deep Interview ===== */}
                {step === "ai_deep" && (
                    <motion.div key="ai_deep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-red-950/40 rounded-xl flex items-center justify-center text-cny-gold border border-cny-gold/20 shadow-xl">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">AI 细节捕捉</h3>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                    状态: 深度访谈中 <span className="mx-1 text-cny-red">/</span> 目标: {contactName}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            {loadingQuestion ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 py-10">
                                    <Loader2 className="w-12 h-12 text-cny-gold animate-spin opacity-50" />
                                    <div className="text-center">
                                        <p className="text-xl font-black text-white mb-1">正在构思追问...</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">解析前序上下文以生成更精准的提问</p>
                                    </div>
                                </motion.div>
                            ) : currentAIQuestion ? (
                                renderQuestionUI(
                                    currentAIQuestion.question,
                                    currentAIQuestion.options,
                                    handleAIAnswer
                                )
                            ) : null}
                        </div>

                        {/* Progress Track */}
                        <div className="mt-10">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {aiQuestionCount < 2 ? "🔍 挖掘背景细节" : "✨ 润色情感风格"}
                                    </span>
                                    <span className="text-[9px] text-cny-gold font-bold mt-0.5">算法深度迭代: Phase {aiQuestionCount} / 4</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-cny-gold rounded-full animate-pulse shadow-[0_0_10px_var(--cny-gold)]" />
                                    <span className="text-sm font-bold text-white uppercase tracking-tighter">AI 神经元活跃中</span>
                                </div>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cny-gold to-orange-400 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${Math.min(100, (aiQuestionCount / 4) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== Generating ===== */}
                {step === "generating" && (
                    <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-black/60 z-50">
                        <Wand2 className="w-20 h-20 text-cny-gold mb-8 animate-pulse shadow-3xl" />
                        <h3 className="text-4xl font-black text-white mb-3 neo-text-gold">🧧 正在生成祝福</h3>
                        <p className="text-gray-400 max-w-xs text-sm leading-relaxed opacity-70 mb-10">
                            正在为您调遣 AI 算力，为 {contactName} 打造独一无二的新春贺词。
                        </p>
                        <div className="flex gap-3">
                            {["字斟句酌", "辞旧迎新", "马到成功"].map(w => (
                                <span key={w} className="px-5 py-2 bg-red-950/40 text-cny-gold border border-cny-gold/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {w}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Tech Detail */}
            <div className="absolute bottom-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <BrainCircuit size={160} className="text-white" />
            </div>
        </motion.div>
    );
}
