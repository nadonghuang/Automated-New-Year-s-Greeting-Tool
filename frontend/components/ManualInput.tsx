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

            <div className="p-10 pb-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cny-red to-red-950 flex items-center justify-center text-cny-gold shadow-2xl border border-cny-gold/20">
                        <ListPlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter">手动注入矩阵</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Manual Data Stream Entry</p>
                    </div>
                </div>
            </div>

            <div className="p-10 space-y-8 relative z-10">
                <div className="relative group/input">
                    <textarea
                        className="w-full h-56 p-8 rounded-[32px] bg-black/40 border-2 border-white/5 focus:border-cny-red/50 focus:bg-black/60 outline-none resize-none transition-all font-bold text-white text-lg leading-relaxed placeholder:text-gray-700 scrollbar-hide"
                        placeholder="每行一个名字，支持换行或逗号隔离...
例如：
陆游
文天祥
李清照，辛弃疾"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="absolute bottom-6 right-8 text-[9px] font-black text-cny-gold/40 uppercase tracking-[0.4em] pointer-events-none group-focus-within/input:opacity-100 opacity-40 transition-opacity flex items-center gap-2">
                        <Sparkles size={10} />
                        Holographic Buffer Active
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !text.trim()}
                    className="w-full bg-gradient-to-r from-cny-red to-[#800] text-white px-8 py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-red-950/40 hover:shadow-cny-red/30 disabled:opacity-20 hover:-translate-y-1 active:scale-95 border border-cny-gold/20 relative overflow-hidden group/btn"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    {loading ? (
                        <>
                            <Wand2 className="w-6 h-6 animate-spin text-cny-gold" />
                            <span className="neo-text-gold">正在解析维度信息...</span>
                        </>
                    ) : (
                        <>
                            <span>开启灵感采集</span>
                            <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-2" />
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
