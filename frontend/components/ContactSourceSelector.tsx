"use client";

import { QrCode, PenTool, FileSpreadsheet, Sparkles, Zap, BrainCircuit, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ContactSourceSelector({ mode, setMode }: { mode: 'scan' | 'manual' | 'file', setMode: (m: 'scan' | 'manual' | 'file') => void }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-12">
            <button
                onClick={() => setMode('scan')}
                className={cn(
                    "relative flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all duration-500 group overflow-hidden active:scale-95",
                    mode === 'scan'
                        ? "glass-tech border-cny-red/50 shadow-[0_0_40px_rgba(204,0,0,0.2)]"
                        : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10"
                )}
            >
                <div className={cn(
                    "absolute -right-6 -bottom-6 transition-all duration-700 pointer-events-none opacity-10",
                    mode === 'scan' ? "rotate-12 scale-150 text-cny-gold" : "rotate-0 scale-100 text-white"
                )}>
                    <BrainCircuit size={100} />
                </div>

                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative z-10",
                    mode === 'scan'
                        ? "bg-gradient-to-br from-cny-red to-red-950 text-white shadow-2xl border border-cny-gold/20"
                        : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
                )}>
                    <QrCode size={24} />
                    {mode === 'scan' && (
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-2.5 h-2.5 bg-cny-gold rounded-full animate-pulse shadow-[0_0_8px_#ffcc33]" />
                    )}
                </div>

                <div className="text-center relative z-10">
                    <h3 className={cn("font-black text-lg tracking-tight transition-colors", mode === 'scan' ? "text-white" : "text-gray-500")}>
                        扫码登录
                    </h3>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1">itchat</p>
                </div>

                {mode === 'scan' && (
                    <motion.div layoutId="selector-glow" className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cny-red to-tech-cyan" />
                )}
            </button>

            <button
                onClick={() => setMode('manual')}
                className={cn(
                    "relative flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all duration-500 group overflow-hidden active:scale-95",
                    mode === 'manual'
                        ? "glass-tech border-cny-red/50 shadow-[0_0_40px_rgba(204,0,0,0.2)]"
                        : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10"
                )}
            >
                <div className={cn(
                    "absolute -right-6 -bottom-6 transition-all duration-700 pointer-events-none opacity-10",
                    mode === 'manual' ? "rotate-12 scale-150 text-cny-gold" : "rotate-0 scale-100 text-white"
                )}>
                    <Zap size={100} />
                </div>

                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative z-10",
                    mode === 'manual'
                        ? "bg-gradient-to-br from-cny-red to-red-950 text-white shadow-2xl border border-cny-gold/20"
                        : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
                )}>
                    <PenTool size={24} />
                    {mode === 'manual' && (
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-2.5 h-2.5 bg-cny-gold rounded-full animate-pulse shadow-[0_0_8px_#ffcc33]" />
                    )}
                </div>

                <div className="text-center relative z-10">
                    <h3 className={cn("font-black text-lg tracking-tight transition-colors", mode === 'manual' ? "text-white" : "text-gray-500")}>
                        智能录入
                    </h3>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1">Manual</p>
                </div>

                {mode === 'manual' && (
                    <motion.div layoutId="selector-glow" className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cny-red to-tech-cyan" />
                )}
            </button>

            <button
                onClick={() => setMode('file')}
                className={cn(
                    "relative flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all duration-500 group overflow-hidden active:scale-95",
                    mode === 'file'
                        ? "glass-tech border-cny-red/50 shadow-[0_0_40px_rgba(204,0,0,0.2)]"
                        : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10"
                )}
            >
                <div className={cn(
                    "absolute -right-6 -bottom-6 transition-all duration-700 pointer-events-none opacity-10",
                    mode === 'file' ? "rotate-12 scale-150 text-cny-gold" : "rotate-0 scale-100 text-white"
                )}>
                    <Database size={100} />
                </div>

                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative z-10",
                    mode === 'file'
                        ? "bg-gradient-to-br from-cny-red to-red-950 text-white shadow-2xl border border-cny-gold/20"
                        : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
                )}>
                    <FileSpreadsheet size={24} />
                    {mode === 'file' && (
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-2.5 h-2.5 bg-cny-gold rounded-full animate-pulse shadow-[0_0_8px_#ffcc33]" />
                    )}
                </div>

                <div className="text-center relative z-10">
                    <h3 className={cn("font-black text-lg tracking-tight transition-colors", mode === 'file' ? "text-white" : "text-gray-500")}>
                        表格导入
                    </h3>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1">Import</p>
                </div>

                {mode === 'file' && (
                    <motion.div layoutId="selector-glow" className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cny-red to-tech-cyan" />
                )}
            </button>
        </div>
    );
}
