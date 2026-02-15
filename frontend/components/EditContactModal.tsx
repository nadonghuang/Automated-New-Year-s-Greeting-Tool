"use client";

import { useState, useEffect } from "react";
import { X, Pencil, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
    id: string;
    name: string;
    nickname: string;
    remark: string;
    city: string;
    greeting?: string;
}

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Contact) => void;
    contact: Contact | null;
}

export default function EditContactModal({ isOpen, onClose, onSave, contact }: EditContactModalProps) {
    const [name, setName] = useState("");
    const [remark, setRemark] = useState("");

    useEffect(() => {
        if (contact) {
            setName(contact.name);
            setRemark(contact.remark || "");
        }
    }, [contact]);

    const handleSubmit = () => {
        if (!name.trim() || !contact) return;
        onSave({
            ...contact,
            name: name.trim(),
            nickname: name.trim(),
            remark: remark.trim() || ""
        });
        onClose();
    };

    const handleClose = () => {
        setName("");
        setRemark("");
        onClose();
    };

    if (!contact) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-tech rounded-[32px] p-8 max-w-md w-full shadow-premium relative overflow-hidden border border-white/5"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cny-red/10 rounded-full blur-[100px] pointer-events-none" />
                        
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white transition-all border border-white/5"
                        >
                            <X size={16} />
                        </button>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cny-red to-red-950 flex items-center justify-center text-cny-gold shadow-2xl border border-cny-gold/20">
                                    <Pencil size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight">编辑好友</h3>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Edit Contact</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-cny-gold uppercase tracking-[0.3em] pl-1">好友名称 *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        className="w-full p-4 rounded-xl bg-black/20 border border-white/5 focus:border-cny-red/20 focus:bg-black/40 outline-none transition-all font-bold text-white text-sm placeholder:text-gray-700"
                                        placeholder="输入好友姓名..."
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1">备注（可选）</label>
                                    <input
                                        type="text"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        className="w-full p-4 rounded-xl bg-black/20 border border-white/5 focus:border-cny-red/20 focus:bg-black/40 outline-none transition-all font-bold text-white text-sm placeholder:text-gray-700"
                                        placeholder="添加备注信息..."
                                    />
                                </div>

                                {contact.greeting && (
                                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                        <p className="text-[8px] font-black text-green-400/60 uppercase tracking-[0.2em] mb-2">已生成的祝福语</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">{contact.greeting}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 py-4 rounded-xl border border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/[0.08] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!name.trim()}
                                        className="flex-1 btn-hongbao text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-20 flex items-center justify-center gap-2 border border-cny-gold/20"
                                    >
                                        <Sparkles size={14} />
                                        保存修改
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
