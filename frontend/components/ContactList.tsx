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
            'from-cny-red to-[#800]',
            'from-[#800] to-red-900',
            'from-cny-gold to-[#b45309]',
            'from-tech-cyan to-blue-900',
            'from-red-950 to-cny-red',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="flex flex-col h-full glass-tech rounded-[48px] border border-white/5 overflow-hidden relative group shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
            {/* Header / Search Section */}
            <div className="p-6 pb-5 bg-gradient-to-b from-red-950/20 to-transparent border-b border-white/10">
                <div className="flex justify-between items-end mb-5">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">好友名册</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            共计 {contacts.length} 位联系人
                        </p>
                    </div>
                    {onAddContact && (
                        <button
                            onClick={onAddContact}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cny-red to-red-950 flex items-center justify-center text-cny-gold hover:scale-105 transition-transform shadow-lg border border-cny-gold/20"
                            title="添加好友"
                        >
                            <UserPlus size={18} />
                        </button>
                    )}
                </div>

                <div className="relative group/search">
                    <div className="absolute -inset-0.5 bg-cny-red/20 rounded-2xl blur opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors z-10" />
                    <input
                        type="text"
                        placeholder="搜索姓名、备注..."
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-white/5 bg-black/40 focus:bg-black/60 focus:border-cny-red/40 outline-none text-sm font-bold text-white transition-all placeholder:text-gray-600 relative z-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
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
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.01 }}
                            onClick={() => onSelect(contact)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-3xl transition-all group text-left relative overflow-hidden active:scale-[0.98]",
                                contact.greeting
                                    ? "bg-cny-red/10 border border-cny-red/20 hover:bg-cny-red/15"
                                    : "bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06]"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xl group-hover:scale-105 transition-transform relative z-10 bg-gradient-to-br border border-white/10",
                                getAvatarColor(contact.name)
                            )}>
                                {contact.name[0]}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center gap-2">
                                    <p className="text-base font-black text-white truncate leading-none group-hover:text-cny-gold transition-colors">{contact.name}</p>
                                    {contact.city === "AutoScan" && (
                                        <div className="px-1.5 py-0.5 rounded-md bg-cny-red text-white text-[7px] font-black uppercase tracking-widest">AUTO</div>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 truncate mt-1 group-hover:text-gray-300 transition-colors">
                                    {contact.greeting ? "🧧 祝福语已就绪" : (contact.remark || contact.city || "等待配置...")}
                                </p>
                            </div>

                            {/* Status Indicator */}
                            <div className="shrink-0 relative z-10">
                                {contact.greeting ? (
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                                        <CheckCircle2 size={16} />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 group-hover:bg-cny-red group-hover:text-white transition-all border border-white/5">
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <Search className="w-12 h-12 text-gray-700 mb-4 opacity-50" />
                        <h4 className="text-lg font-black text-gray-500 mb-6 uppercase tracking-widest">未找到匹配联系人</h4>
                        <button
                            onClick={() => setSearch("")}
                            className="px-6 py-3 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-cny-gold border border-cny-gold/20 hover:bg-cny-gold hover:text-red-950 transition-all"
                        >
                            重置检索
                        </button>
                    </div>
                )}
            </div>

            {/* List Footer Metadata */}
            <div className="p-5 bg-black/40 text-center border-t border-white/5">
                <p className="text-[8px] text-gray-500 font-bold tracking-widest uppercase opacity-40">Secured Neural Database v2.0</p>
            </div>
        </div>
    );
}
