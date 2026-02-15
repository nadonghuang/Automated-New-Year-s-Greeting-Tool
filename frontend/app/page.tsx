"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Sparkles, MessageSquareHeart, Send, ShieldAlert, Zap, Github, Heart, BrainCircuit, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginQRCode from "@/components/LoginQRCode";
import ManualInput from "@/components/ManualInput";
import ContactSourceSelector from "@/components/ContactSourceSelector";
import ContactList from "@/components/ContactList";
import Questionnaire from "@/components/Questionnaire";
import GreetingReview from "@/components/GreetingReview";
import AddContactModal from "@/components/AddContactModal";
import EditContactModal from "@/components/EditContactModal";
import FileUpload from "@/components/FileUpload";
import TaskTabs, { Task, TaskStep } from "@/components/TaskTabs";
import { cn, API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  nickname: string;
  remark: string;
  city: string;
  greeting?: string;
  signature?: string;
}

interface LastAnswers {
  basic: Array<{ question: string; answer: string }>;
  deep: Array<{ question: string; answer: string }>;
  timestamp: number;
}

export default function Home() {
  const [mode, setMode] = useState<'scan' | 'manual' | 'file'>('manual');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // UI States
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [generatedGreeting, setGeneratedGreeting] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showConfig, setShowConfig] = useState(true);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletedContacts, setDeletedContacts] = useState<Contact[]>([]);
  const [defaultModel, setDefaultModel] = useState("deepseek/deepseek-v3.2");
  const [configLoading, setConfigLoading] = useState(false);

  // Multi-task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Temporary answers storage for regeneration
  const [lastAnswers, setLastAnswers] = useState<LastAnswers | null>(null);

  // Generate stable random particles on client side only
  const [goldParticles, setGoldParticles] = useState<Array<{id: number, left: number, duration: number, delay: number, opacity: number}>>([]);

  // Load initial state
  useEffect(() => {
    const loadInitialState = () => {
      try {
        const savedContacts = localStorage.getItem("wechat_contacts");
        if (savedContacts) {
          try {
            const parsed = JSON.parse(savedContacts);
            if (Array.isArray(parsed)) {
              setContacts(parsed);
            }
          } catch (e) {
            console.error('Failed to parse saved contacts:', e);
            toast.error('无法加载已保存的联系人数据');
          }
        }

        const savedKey = localStorage.getItem("wechat_api_key");
        if (savedKey) {
          setApiKey(savedKey);
          setShowConfig(false);
          // Auto config backend
          axios.post(`${API_BASE_URL}/config`, { api_key: savedKey }).catch(() => {
            setShowConfig(true);
          });
        }

        const savedModel = localStorage.getItem("wechat_default_model");
        if (savedModel) {
          setDefaultModel(savedModel);
        }
      } catch (e) {
        console.error('localStorage not available:', e);
      }
    };

    loadInitialState();

    // Generate stable gold particles on client side
    const particles = [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.5
    }));
    setGoldParticles(particles);
  }, []);

  // Save contacts on change
  useEffect(() => {
    try {
      const data = JSON.stringify(contacts);
      const sizeInMB = new Blob([data]).size / (1024 * 1024);
      if (sizeInMB > 4) {
        toast.warning(`联系人数据较大 (${sizeInMB.toFixed(1)}MB)，可能接近存储限制`);
      }
      localStorage.setItem("wechat_contacts", data);
    } catch (e: any) {
      console.error('Failed to save contacts to localStorage:', e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        toast.error('本地存储空间不足，请导出后清理部分数据');
      } else {
        toast.error('无法保存联系人数据到本地存储');
      }
    }
  }, [contacts]);

  const handleContactsLoaded = (newContacts: Contact[]) => {
    // Unique merge
    setContacts(prev => {
      const combined = [...prev, ...newContacts];
      const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
      return unique;
    });
  };

  const handleAddContact = (name: string, remark?: string) => {
    setContacts(prev => {
      const exists = prev.some(c => c.name === name);
      if (exists) {
        toast.error(`好友 "${name}" 已存在`);
        return prev;
      }
      const newContact: Contact = {
        id: `manual_${Date.now()}`,
        name,
        nickname: name,
        remark: remark || "",
        city: ""
      };
      toast.success(`已添加好友 "${name}"`);
      return [...prev, newContact];
    });
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowEditContactModal(true);
  };

  const handleSaveEditContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    toast.success(`已更新好友 "${updatedContact.name}"`);
  };

  const handleDeleteContact = (contact: Contact) => {
    setContacts(prev => prev.filter(c => c.id !== contact.id));
    setDeletedContacts(prev => [...prev, contact]);
    toast(
      `已删除好友 "${contact.name}"`,
      {
        action: {
          label: "撤销",
          onClick: () => handleUndoDelete(contact)
        },
        duration: 5000
      }
    );
  };

  const handleUndoDelete = (contact: Contact) => {
    setContacts(prev => {
      const exists = prev.some(c => c.id === contact.id);
      if (exists) return prev;
      return [...prev, contact];
    });
    setDeletedContacts(prev => prev.filter(c => c.id !== contact.id));
    toast.success(`已恢复好友 "${contact.name}"`);
  };

  const handleConfigSubmit = async () => {
    setConfigLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/config`, { api_key: apiKey });
      localStorage.setItem("wechat_api_key", apiKey);
      setShowConfig(false);
      toast.success("系统已激活");
    } catch (e) {
      toast.error("API Key 无效或配置失败，请检查网络或 Key 是否正确。");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleGenerateComplete = (greeting: string, contactId: string) => {
    setGeneratedGreeting(greeting);
    
    handleUpdateTask(contactId, { step: "review", greeting });
    
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, greeting } : c
    ));
    
    if (activeTaskId === contactId) {
      setShowQuestionnaire(false);
      setShowReview(true);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contacts/export`, {
        contacts: contacts
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '拜年名单导出.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("导出成功");
    } catch (e) {
      toast.error("导出失败");
    }
  };

  const handleSaveGreeting = (text: string) => {
    if (!selectedContact) return;
    setContacts(contacts.map(c => c.id === selectedContact.id ? { ...c, greeting: text } : c));
    handleUpdateTask(selectedContact.id, { step: "done", greeting: text });
    setShowReview(false);
    handleRemoveTask(selectedContact.id);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    
    const existingTask = tasks.find(t => t.contactId === contact.id);
    if (existingTask) {
      setActiveTaskId(contact.id);
      if (existingTask.greeting) {
        setGeneratedGreeting(existingTask.greeting);
        setShowReview(true);
        setShowQuestionnaire(false);
      } else {
        setShowQuestionnaire(true);
        setShowReview(false);
      }
      return;
    }

    const newTask: Task = {
      contactId: contact.id,
      contactName: contact.name,
      step: contact.greeting ? "review" : (defaultModel ? "basic" : "model"),
      history: [],
      basicIndex: 0,
      aiQuestionCount: 0,
      selectedModel: defaultModel || "",
      greeting: contact.greeting
    };
    
    setTasks(prev => [...prev, newTask]);
    setActiveTaskId(contact.id);

    if (contact.greeting) {
      setGeneratedGreeting(contact.greeting);
      setShowReview(true);
      setShowQuestionnaire(false);
    } else {
      setShowQuestionnaire(true);
      setShowReview(false);
    }
  };

  const handleSelectTask = (taskId: string) => {
    const task = tasks.find(t => t.contactId === taskId);
    if (!task) return;

    const contact = contacts.find(c => c.id === taskId);
    if (contact) {
      setSelectedContact(contact);
    }
    
    setActiveTaskId(taskId);
    
    if (task.greeting) {
      setGeneratedGreeting(task.greeting);
      setShowReview(true);
      setShowQuestionnaire(false);
    } else {
      setShowQuestionnaire(true);
      setShowReview(false);
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.contactId !== taskId));
    if (activeTaskId === taskId) {
      const remaining = tasks.filter(t => t.contactId !== taskId);
      if (remaining.length > 0) {
        handleSelectTask(remaining[0].contactId);
      } else {
        setActiveTaskId(null);
        setSelectedContact(null);
        setShowQuestionnaire(false);
        setShowReview(false);
      }
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.contactId === taskId ? { ...t, ...updates } : t));
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-cny-red/30 selection:text-cny-gold overflow-hidden relative h-screen">
      {/* Festive Tech Layered Background */}
      <div className="festive-tech-bg" />
      <div className="festive-tech-grid" />

      {/* Tech Spirits & Gold Dust */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`spirit-${i}`}
            className="absolute w-1 h-20 bg-gradient-to-t from-transparent via-cny-red to-cny-gold rounded-full opacity-20 blur-sm"
            initial={{ top: '110%', left: `${20 * i}%` }}
            animate={{ top: '-10%' }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "linear", delay: i * 0.7 }}
          />
        ))}
        {/* Falling Gold Particles */}
        {goldParticles.map((particle) => (
          <div
            key={`gold-${particle.id}`}
            className="gold-particle"
            style={{
              left: `${particle.left}%`,
              "--fall-duration": `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              opacity: particle.opacity
            } as any}
          />
        ))}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cny-gold rounded-full animate-tech-spark shadow-[0_0_15px_#ffcc33]" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cny-red rounded-full animate-tech-spark shadow-[0_0_15px_#ff0000] delay-700" />
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-3xl bg-black/40 border-b border-white/5 sticky top-0 shadow-premium">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-cny-gold blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="w-14 h-14 bg-gradient-to-br from-cny-red to-red-800 rounded-2xl flex items-center justify-center text-cny-gold shadow-2xl group-hover:rotate-[360deg] transition-transform duration-1000 relative z-10 border border-cny-gold/20">
                <span className="text-2xl font-black neo-text-gold">福</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-3">
                <span className="neo-text-gold">AI 贺岁</span> 助手
                <div className="px-2 py-0.5 rounded-lg bg-red-950/50 text-cny-gold text-[8px] font-black uppercase tracking-wider border border-cny-gold/20">2026 丙午马年</div>
              </h1>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Techno-Festive Personalized Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-3 bg-white/[0.02] px-4 py-2 rounded-full border border-white/5 shadow-inner">
              <div className="w-1.5 h-1.5 bg-cny-gold rounded-full shadow-[0_0_8px_var(--cny-gold)] animate-pulse" />
              <span className="text-[8px] font-black text-cny-gold/80 uppercase tracking-[0.3em]">量子吉语引擎运行中</span>
            </div>
            <button
              onClick={() => setShowConfig(true)}
              className="w-10 h-10 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-cny-gold rounded-xl transition-all border border-white/5 active:scale-95"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-8 flex flex-col gap-8 overflow-hidden h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          {contacts.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="flex-1 flex flex-row items-center gap-12 min-h-0"
            >
              {/* Left Side: Hero Section */}
              <div className="flex-1 flex flex-col justify-center max-w-xl">
                <div className="relative">
                  <div className="absolute -top-20 left-0 w-64 h-64 bg-cny-red/10 blur-[100px] -z-10" />
                  <div className="inline-flex items-center gap-2 bg-red-950/40 text-cny-gold px-5 py-2.5 rounded-full text-xs font-black mb-8 border border-cny-red/30 shadow-2xl backdrop-blur-md">
                    <Zap className="w-4 h-4 fill-current animate-pulse" />
                    2026 丙午马年特别版 · AI 引擎已启动
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                    龙腾盛世 <br /> <span className="neo-text-gold italic">马到成功</span>
                  </h2>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed opacity-80 mb-12">
                    融合前沿 AI 技术与千年贺岁文化。不仅仅是祝福，更是一场沉浸式数字庆典。
                  </p>
                  
                  <div className="glass-tech p-2 rounded-[40px] inline-block">
                    <ContactSourceSelector mode={mode} setMode={setMode} />
                  </div>
                </div>
              </div>

              {/* Right Side: Input Section */}
              <motion.div layout className="flex-1 max-w-2xl h-full flex flex-col justify-center">
                {mode === 'scan' ? (
                  <div className="p-10 glass-tech rounded-[48px] shadow-2xl relative overflow-hidden corner-motif">
                    <LoginQRCode onLoginSuccess={async () => {
                      const res = await axios.get(`${API_BASE_URL}/wechat/friends`);
                      handleContactsLoaded(res.data.friends);
                    }} />
                    <div className="mt-10 p-6 bg-red-950/40 rounded-3xl flex items-start gap-4 border border-cny-red/20 backdrop-blur-md">
                      <ShieldAlert className="w-6 h-6 text-cny-gold mt-1" />
                      <div className="text-sm text-gray-300">扫码登录受微信安全策略限制。若无法接入，请尝试“智能录入”。</div>
                    </div>
                  </div>
                ) : mode === 'manual' ? (
                  <div className="space-y-6">
                    <div className="glass-tech p-1 rounded-[40px] corner-motif">
                      <ManualInput onParsed={handleContactsLoaded} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="glass-tech p-1 rounded-[40px] corner-motif">
                      <FileUpload onParsed={handleContactsLoaded} />
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col md:flex-row gap-8 min-h-0 h-full overflow-hidden"
            >
              {/* Left Side: Contact List */}
              <div className="w-full md:w-80 lg:w-[400px] flex flex-col h-full overflow-hidden">
                <ContactList
                  contacts={contacts}
                  onSelect={handleSelectContact}
                  onAddContact={() => setShowAddContactModal(true)}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                />
              </div>

              {/* Right Side: The Unified Workflow Container */}
              <div className="flex-1 flex flex-col glass-tech rounded-[40px] border border-white/10 shadow-3xl overflow-hidden relative corner-motif">
                {/* Task Tabs for Multi-tasking */}
                <TaskTabs
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  onSelectTask={handleSelectTask}
                  onRemoveTask={handleRemoveTask}
                />
                
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
                  <span className="text-[40rem] font-black text-white leading-none">马</span>
                </div>

                <div className="flex-1 relative z-10 overflow-y-auto scrollbar-hide">
                  <AnimatePresence mode="wait">
                    {!selectedContact ? (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="h-full flex flex-col items-center justify-center p-12 text-center"
                      >
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cny-red to-red-950 flex items-center justify-center mb-8 relative group">
                          <BrainCircuit className="text-cny-gold group-hover:scale-110 transition-transform duration-500" size={64} />
                          <div className="absolute -inset-4 bg-cny-red/20 blur-2xl rounded-full opacity-50 animate-pulse" />
                        </div>
                        <h3 className="text-4xl font-black text-white mb-4 tracking-tight">神经网络已就绪</h3>
                        <p className="text-gray-400 max-w-sm text-lg leading-relaxed mb-10">
                          请在左侧列表中选择一位好友，<br />
                          AI 将根据其社交角色深度定制专属贺词。
                        </p>
                        <div className="flex gap-4 opacity-40">
                          {["逻辑严密", "情感丰盈", "愿景宏图"].map(tag => (
                            <span key={tag} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{tag}</span>
                          ))}
                        </div>
                      </motion.div>
                    ) : showReview ? (
                      <GreetingReview
                        key="review"
                        initialGreeting={generatedGreeting}
                        contactName={selectedContact.name}
                        onSave={handleSaveGreeting}
                        onCancel={() => {
                          setShowReview(false);
                          setSelectedContact(null);
                        }}
                        onRegenerate={() => {
                          setShowReview(false);
                          setShowQuestionnaire(true);
                        }}
                      />
                    ) : (
                      <Questionnaire
                        key={`questionnaire-${selectedContact.id}`}
                        contactName={selectedContact.name}
                        contactId={selectedContact.id}
                        defaultModel={defaultModel}
                        initialState={(() => {
                          const task = tasks.find(t => t.contactId === selectedContact.id);
                          if (!task) return undefined;
                          if (task.step === "review" || task.step === "done") return undefined;
                          return {
                            step: task.step as "model" | "basic" | "ai_deep" | "generating",
                            selectedModel: task.selectedModel,
                            history: task.history,
                            basicIndex: task.basicIndex,
                            aiQuestionCount: task.aiQuestionCount,
                            currentAIQuestion: task.currentAIQuestion
                          };
                        })()}
                        onSubmit={handleGenerateComplete}
                        onCancel={() => {
                          handleRemoveTask(selectedContact.id);
                        }}
                        onStepChange={(step, data) => {
                          handleUpdateTask(selectedContact.id, { 
                            step,
                            ...data 
                          });
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Integrated Workflow Footer */}
                <div className="shrink-0 p-8 pt-4 bg-black/60 border-t border-white/5 backdrop-blur-3xl relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="glass-tech px-5 py-3 rounded-2xl border border-white/5 flex items-baseline gap-3 group hover:border-cny-gold/30 transition-colors">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">名册总数</span>
                        <span className="text-2xl font-black text-white neo-text-gold">{contacts.length}</span>
                      </div>
                      <div className="glass-tech px-5 py-3 rounded-2xl border border-white/5 flex items-baseline gap-3 group hover:border-cny-red/30 transition-colors">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">已智造</span>
                        <span className="text-2xl font-black text-cny-red">{contacts.filter(c => c.greeting).length}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleExport}
                        className="px-10 py-5 rounded-2xl btn-hongbao text-white hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 border border-white/10 group"
                      >
                        <Heart size={18} className="group-hover:fill-current" /> 导出量子名册
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("是否重置系统环境？这将清空当前所有导入的联系人数据。")) {
                            setContacts([]);
                            setSelectedContact(null);
                            setShowQuestionnaire(false);
                            setShowReview(false);
                            localStorage.removeItem("wechat_contacts");
                          }
                        }}
                        className="px-8 py-5 rounded-2xl border border-white/10 bg-white/5 text-gray-500 hover:bg-white/10 hover:border-cny-gold/30 hover:text-cny-gold transition-all text-xs font-black uppercase tracking-widest active:scale-95"
                      >
                        清空环境枢纽
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence>
    </div>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="glass-tech rounded-[56px] p-12 max-w-md w-full shadow-[0_0_100px_rgba(230,0,0,0.2)] relative overflow-hidden border border-white/10 corner-motif"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cny-red/20 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-cny-red to-red-950 rounded-3xl flex items-center justify-center mb-10 shadow-3xl border border-cny-gold/20 mx-auto">
                  <Settings className="w-12 h-12 text-cny-gold" />
                </div>
                <h2 className="text-4xl font-black mb-3 text-white tracking-tighter">系统设置</h2>
                <p className="text-sm text-gray-400 mb-10 leading-relaxed opacity-70">
                  配置 API 密钥和默认模型。<br />设置将安全存储于本地。
                </p>
                <div className="space-y-6">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black text-cny-gold uppercase tracking-[0.4em] pl-1">Neural Access Token</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full p-6 rounded-3xl bg-black/60 border-2 border-white/10 focus:border-cny-gold focus:bg-white/5 outline-none transition-all font-mono text-sm text-white placeholder:text-gray-700"
                      placeholder="sk-or-v1-..."
                    />
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black text-cny-gold uppercase tracking-[0.4em] pl-1">默认模型</label>
                    <select
                      value={defaultModel}
                      onChange={(e) => {
                        setDefaultModel(e.target.value);
                        localStorage.setItem("wechat_default_model", e.target.value);
                      }}
                      className="w-full p-6 rounded-3xl bg-black/60 border-2 border-white/10 focus:border-cny-gold focus:bg-white/5 outline-none transition-all text-sm text-white appearance-none cursor-pointer"
                    >
                      <option value="deepseek/deepseek-v3.2">DeepSeek V3.2 (推荐)</option>
                      <option value="deepseek/deepseek-r1">DeepSeek R1 (推理)</option>
                      <option value="openai/gpt-5.2">GPT-5.2 (全能)</option>
                      <option value="openai/gpt-5-nano">GPT-5 Nano (疾速)</option>
                      <option value="anthropic/claude-opus-4.6">Claude Opus 4.6</option>
                      <option value="google/gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                      <option value="google/gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                      <option value="qwen/qwen3-max">Qwen3 Max</option>
                    </select>
                    <p className="text-[10px] text-gray-500 pl-1">生成祝福时将跳过模型选择，直接使用此模型</p>
                  </div>
                  <button
                    onClick={handleConfigSubmit}
                    disabled={!apiKey || configLoading}
                    className="w-full btn-hongbao text-white py-7 rounded-[32px] font-black text-xl hover:shadow-[0_0_60px_rgba(230,0,0,0.4)] transition-all disabled:opacity-20 flex items-center justify-center gap-4 active:scale-95 border border-white/10"
                  >
                    {configLoading ? (
                      <>
                        <Loader2 size={28} className="animate-spin" />
                        配置中...
                      </>
                    ) : (
                      <>
                        <Zap size={28} className="fill-current" />
                        保存设置
                      </>
                    )}
                  </button>
                  <p><a href="https://openrouter.ai" target="_blank" className="text-[10px] text-gray-500 hover:text-cny-gold underline uppercase font-black tracking-widest transition-colors">获取 Access Token</a></p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onAdd={handleAddContact}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={showEditContactModal}
        onClose={() => {
          setShowEditContactModal(false);
          setEditingContact(null);
        }}
        onSave={handleSaveEditContact}
        contact={editingContact}
      />

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center opacity-30">
        <p className="text-[10px] font-black text-gray-700 tracking-[0.8em] uppercase mb-4">Neural Privacy · Edge Computing · 2026 Engine</p>
        <div className="flex justify-center items-center gap-4 mb-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-cny-gold/40" />
          <p className="text-[10px] text-cny-gold uppercase font-black tracking-widest">马到成功 · 万事如意</p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-cny-gold/40" />
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed font-bold">DeepMind Techno-Festive Division © 2026</p>
      </footer>
    </main>
  );
}
