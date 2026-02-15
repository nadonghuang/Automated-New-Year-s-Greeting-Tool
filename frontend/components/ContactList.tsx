"use client";

import { useState } from "react";
import { Search, User, Sparkles, CheckCircle2, ChevronRight, X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Contact {
    id: string;
    name: string;
    nickname: string;
    remark: string;
    city: string;
    greeting?: string;
    signature?: string;
}

export default function ContactList({ contacts, onSelect, onAddContact }: { 
    contacts: Contact[], 
    onSelect: (contact: Contact) => void,
    onAddContact?: () => void
}) {
    const [search, setSearch] = useState("");

    const filtered = contacts.filter(c =>
        c.name.includes(search) || (c.nickname && c.nickname.includes(search)) || (c.remark && c.remark.includes(search))
    );

    // Festive avatar gradient logic
    const getAvatarColor = (name: string) => {
        const colors = [
            'from-cny-red/80 to-red-950',
            'from-red-900/80 to-black',
            'from-cny-gold/80 to-orange-950',
            'from-tech-cyan/80 to-blue-950',
            'from-red-950/80 to-cny-red/40',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="flex flex-col h-full glass-tech rounded-[32px] overflow-hidden relative group shadow-premium">
            {/* Header / Search Section */}
            <div className="p-8 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/5">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">好友名册</h3>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1.5">
                            共计 {contacts.length} 位联系人
                        </p>
                    </div>
                    {onAddContact && (
                        <button
                            onClick={onAddContact}
                            className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-cny-gold transition-all border border-white/5 active:scale-95"
                            title="添加好友"
                        >
                            <UserPlus size={18} />
                        </button>
                    )}
                </div>

                <div className="relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors z-10" />
                    <input
                        type="text"
                        placeholder="搜索姓名、备注..."
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/5 bg-black/20 focus:bg-black/40 focus:border-cny-red/20 outline-none text-xs font-bold text-white transition-all placeholder:text-gray-700 relative z-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {filtered.map((contact, idx) => (
                        <motion.button
                            key={contact.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: idx * 0.01 }}
                            onClick={() => onSelect(contact)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group text-left relative overflow-hidden active:scale-[0.99]",
                                contact.greeting
                                    ? "bg-cny-red/[0.04] border border-cny-red/10 hover:bg-cny-red/[0.08]"
                                    : "bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-base shadow-lg group-hover:scale-105 transition-transform relative z-10 bg-gradient-to-br border border-white/10",
                                getAvatarColor(contact.name)
                            )}>
                                {contact.name[0]}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-black text-white truncate leading-none group-hover:text-cny-gold transition-colors">{contact.name}</p>
                                    {contact.city === "AutoScan" && (
                                        <div className="px-1 py-0.5 rounded bg-cny-red/20 text-cny-red text-[6px] font-black uppercase tracking-widest border border-cny-red/20">AUTO</div>
                                    )}
                                </div>
                                <p className="text-[9px] font-bold text-gray-500 truncate mt-1.5 group-hover:text-gray-400 transition-colors leading-relaxed">
                                    {contact.greeting ? "🧧 祝福语已就绪" : (contact.remark || contact.city || "等待配置...")}
                                </p>
                            </div>

                            {/* Status Indicator */}
                            <div className="shrink-0 relative z-10">
                                {contact.greeting ? (
                                    <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400/60 border border-green-500/20">
                                        <CheckCircle2 size={14} />
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] flex items-center justify-center text-gray-700 group-hover:bg-cny-red group-hover:text-white transition-all border border-white/5">
                                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <Search className="w-10 h-10 text-gray-800 mb-4 opacity-50" />
                        <h4 className="text-sm font-black text-gray-600 mb-6 uppercase tracking-[0.2em]">未找到匹配联系人</h4>
                        <button
                            onClick={() => setSearch("")}
                            className="px-6 py-3 rounded-xl bg-white/[0.02] text-[8px] font-black uppercase tracking-[0.2em] text-cny-gold/60 border border-white/5 hover:bg-cny-gold hover:text-red-950 transition-all"
                        >
                            重置检索
                        </button>
                    </div>
                )}
            </div>

            {/* List Footer Metadata */}
            <div className="p-4 bg-black/20 text-center border-t border-white/5">
                <p className="text-[7px] text-gray-600 font-bold tracking-[0.4em] uppercase opacity-40">Secured Neural Database v2.0</p>
            </div>
        </div>
    );
}
