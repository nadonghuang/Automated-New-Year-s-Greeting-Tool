"use client";

import { useState } from "react";
import axios from "axios";
import { ArrowRight, Type, ListPlus, Wand2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

export default function ManualInput({ onParsed }: { onParsed: (contacts: any[]) => void }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/contacts/parse_manual`, { text });
            onParsed(res.data.friends);
            toast.success(`成功导入 ${res.data.friends.length} 位好友`);
        } catch (e) {
            toast.error("解析失败，请检查格式");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col w-full max-w-lg mx-auto glass-tech rounded-[40px] shadow-[0_0_80px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10 relative group"
        >
            <div className="absolute inset-0 bg-cny-red/5 pointer-events-none" />

            <div className="p-8 pb-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cny-red to-red-950 flex items-center justify-center text-cny-gold shadow-2xl border border-cny-gold/20">
                        <ListPlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tighter">手动注入矩阵</h3>
                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Manual Data Stream Entry</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-6 relative z-10">
                <div className="relative group/input">
                    <textarea
                        className="w-full h-48 p-6 rounded-2xl bg-black/20 border border-white/5 focus:border-cny-red/20 focus:bg-black/40 outline-none resize-none transition-all font-bold text-white text-sm leading-relaxed placeholder:text-gray-700 scrollbar-hide"
                        placeholder="每行一个名字，支持备注...
例如：
陆游 诗人
文天祥：民族英雄
李清照, 词人"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-6 text-[7px] font-black text-cny-gold/40 uppercase tracking-[0.4em] pointer-events-none group-focus-within/input:opacity-100 opacity-40 transition-opacity flex items-center gap-2">
                        <Sparkles size={8} />
                        Holographic Buffer Active
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !text.trim()}
                    className="w-full btn-hongbao text-white px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all disabled:opacity-20 active:scale-95 border border-cny-gold/20 relative overflow-hidden group/btn"
                >
                    {loading ? (
                        <>
                            <Wand2 className="w-5 h-5 animate-spin text-cny-gold" />
                            <span className="neo-text-gold text-sm">正在解析维度信息...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-sm uppercase tracking-widest">开启灵感采集</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                        </>
                    )}
                </button>

                <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] opacity-50">
                    支持从 Excel 或 文本文件直接粘贴数据流
                </p>
            </div>
        </motion.div>
    );
}
