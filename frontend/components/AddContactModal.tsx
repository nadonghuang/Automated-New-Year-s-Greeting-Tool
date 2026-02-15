"use client";

import { useState } from "react";
import { X, UserPlus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, remark?: string) => void;
}

export default function AddContactModal({ isOpen, onClose, onAdd }: AddContactModalProps) {
    const [name, setName] = useState("");
    const [remark, setRemark] = useState("");

    const handleSubmit = () => {
        if (!name.trim()) return;
        onAdd(name.trim(), remark.trim() || undefined);
        setName("");
        setRemark("");
        onClose();
    };

    const handleClose = () => {
        setName("");
        setRemark("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-tech rounded-[40px] p-10 max-w-md w-full shadow-[0_0_80px_rgba(230,0,0,0.15)] relative overflow-hidden border border-white/10"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cny-red/20 rounded-full blur-[100px] pointer-events-none" />
                        
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/10"
                        >
                            <X size={18} />
                        </button>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cny-red to-red-950 flex items-center justify-center text-cny-gold shadow-2xl border border-cny-gold/20">
                                    <UserPlus size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">添加好友</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Add New Contact</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-cny-gold uppercase tracking-[0.3em] pl-1">好友名称 *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        className="w-full p-5 rounded-2xl bg-black/40 border-2 border-white/5 focus:border-cny-red/50 focus:bg-black/60 outline-none transition-all font-bold text-white placeholder:text-gray-700"
                                        placeholder="输入好友姓名..."
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-1">备注（可选）</label>
                                    <input
                                        type="text"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        className="w-full p-5 rounded-2xl bg-black/40 border-2 border-white/5 focus:border-cny-red/50 focus:bg-black/60 outline-none transition-all font-bold text-white placeholder:text-gray-700"
                                        placeholder="添加备注信息..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 py-5 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm font-black uppercase tracking-widest"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!name.trim()}
                                        className="flex-1 bg-gradient-to-r from-cny-red to-[#800] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-950/40 hover:shadow-cny-red/30 disabled:opacity-30 flex items-center justify-center gap-2 border border-cny-gold/20"
                                    >
                                        <Sparkles size={16} />
                                        确认添加
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
