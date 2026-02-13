"use client";

import { useState } from "react";
import { Copy, RefreshCw, Check, Save, Share2, MessageCircleHeart, Wand2, X, Heart, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";

interface GreetingReviewProps {
    initialGreeting: string;
    contactName: string;
    onSave: (finalGreeting: string) => void;
    onCancel: () => void;
    onRegenerate: () => void;
}

export default function GreetingReview({ initialGreeting, contactName, onSave, onCancel, onRegenerate }: GreetingReviewProps) {
    const [editedGreeting, setEditedGreeting] = useState(initialGreeting);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(editedGreeting);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col h-full gap-8 relative p-10"
        >
            {/* Holographic Header */}
            <div className="relative shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-cny-gold rounded-full shadow-[0_0_10px_var(--cny-gold)] animate-pulse" />
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">祝福解析完成 · 核心引擎已就绪</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tight neo-text-gold">新春礼成</h2>
                        <p className="text-gray-400 text-lg mt-2 font-medium italic">
                            即将向 <span className="text-cny-gold font-black not-italic">{contactName}</span> 传递这份数字祝福
                        </p>
                    </div>
                    <button onClick={onCancel} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-red-950/40 hover:text-cny-red text-gray-500 flex items-center justify-center transition-all border border-white/10 shadow-lg">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* The Main Digital Card */}
            <div className="relative group/card flex-1 min-h-0">
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none z-0">
                    <span className="text-[30rem] font-black text-white leading-none">福</span>
                </div>

                <div className="relative h-full overflow-hidden flex flex-col pt-4 z-10">
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {isEditing ? (
                            <div className="relative h-full px-1">
                                <textarea
                                    className="w-full h-full bg-black/60 rounded-[32px] p-10 text-2xl font-bold text-gray-100 border border-cny-gold/30 focus:border-cny-gold focus:bg-black/80 outline-none transition-all leading-relaxed scrollbar-hide resize-none shadow-inner"
                                    value={editedGreeting}
                                    onChange={(e) => setEditedGreeting(e.target.value)}
                                    autoFocus
                                />
                                <div className="absolute bottom-8 right-10 text-[10px] font-black text-cny-gold uppercase tracking-widest bg-red-950/90 px-4 py-2 rounded-full border border-cny-gold/20 backdrop-blur-md">编辑模式已开启</div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative py-4"
                            >
                                <div className="absolute -left-6 top-1 bottom-1 w-1 bg-gradient-to-b from-cny-red via-cny-gold to-transparent rounded-full" />
                                <pre className="whitespace-pre-wrap font-sans text-3xl md:text-5xl font-black text-white leading-[1.6] tracking-tight drop-shadow-2xl">
                                    {editedGreeting}
                                </pre>
                            </motion.div>
                        )}
                    </div>

                    <div className="pt-8 mt-auto shrink-0">
                        <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-red-950/40 flex items-center justify-center text-cny-gold border border-cny-gold/20 shadow-xl">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">算法验证通过</p>
                                    <p className="text-xs font-black text-cny-gold uppercase tracking-wider">千人千面个性化定制 · 2026 丙午马年</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={cn(
                                        "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border shadow-2xl active:scale-95",
                                        isEditing
                                            ? "bg-cny-gold text-red-950 border-cny-gold"
                                            : "bg-white/5 text-gray-500 border-white/10 hover:border-cny-gold hover:text-cny-gold"
                                    )}
                                >
                                    {isEditing ? "💾 确认修改" : "✍️ 手工润色"}
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="px-8 py-4 rounded-2xl bg-white/5 text-gray-500 border border-white/10 hover:border-cny-red hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-2xl active:scale-95"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    {copied ? "已复制" : "复制原文"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions Integrated */}
            <div className="flex gap-5 shrink-0 mt-4 relative z-20">
                <button
                    onClick={onRegenerate}
                    className="flex-1 py-7 rounded-[32px] bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10 hover:text-cny-gold hover:border-cny-gold/30 transition-all font-black text-base uppercase tracking-widest group flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-black/50"
                >
                    <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                    重塑灵感
                </button>

                <button
                    onClick={() => onSave(editedGreeting)}
                    className="flex-[2] py-7 rounded-[32px] btn-hongbao text-white font-black text-2xl shadow-3xl hover:scale-[1.02] transition-all border border-white/10 flex items-center justify-center gap-4 group active:scale-95"
                >
                    <Send size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    确认并投递祝福
                </button>
            </div>
        </motion.div>
    );
}
