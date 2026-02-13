"use client";

import { QrCode, PenTool, Sparkles, Zap, BrainCircuit, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ContactSourceSelector({ mode, setMode }: { mode: 'scan' | 'manual' | 'db', setMode: (m: 'scan' | 'manual' | 'db') => void }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
            <button
                onClick={() => setMode('scan')}
                className={cn(
                    "relative flex flex-col items-center gap-4 p-8 rounded-[40px] border transition-all duration-500 group overflow-hidden active:scale-95",
                    mode === 'scan'
                        ? "glass-tech border-cny-red/50 shadow-[0_0_40px_rgba(204,0,0,0.2)]"
                        : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10"
                )}
            >
                {/* Visual Flair */}
                <div className={cn(
                    "absolute -right-6 -bottom-6 transition-all duration-700 pointer-events-none opacity-10",
                    mode === 'scan' ? "rotate-12 scale-150 text-cny-gold" : "rotate-0 scale-100 text-white"
                )}>
                    <BrainCircuit size={120} />
                </div>

                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative z-10",
                    mode === 'scan'
                        ? "bg-gradient-to-br from-cny-red to-red-950 text-white shadow-2xl border border-cny-gold/20"
                        : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
                )}>
                    <QrCode size={32} />
                    {mode === 'scan' && (
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-cny-gold rounded-full animate-pulse shadow-[0_0_8px_#ffcc33]" />
                    )}
                </div>

                <div className="text-center relative z-10">
                    <h3 className={cn("font-black text-xl tracking-tight transition-colors", mode === 'scan' ? "text-white" : "text-gray-500")}>
                        扫码登录
                    </h3>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">itchat Protocol</p>
                </div>

                {mode === 'scan' && (
                    <motion.div layoutId="selector-glow" className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cny-red to-tech-cyan" />
                )}
            </button>

            <button
                onClick={() => setMode('manual')}
                className={cn(
                    "relative flex flex-col items-center gap-4 p-8 rounded-[40px] border transition-all duration-500 group overflow-hidden active:scale-95",
                    mode === 'manual'
                        ? "glass-tech border-cny-red/50 shadow-[0_0_40px_rgba(204,0,0,0.2)]"
                        : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10"
                )}
            >
                {/* Visual Flair */}
                <div className={cn(
                    "absolute -right-6 -bottom-6 transition-all duration-700 pointer-events-none opacity-10",
                    mode === 'manual' ? "rotate-12 scale-150 text-cny-gold" : "rotate-0 scale-100 text-white"
                )}>
                    <Zap size={120} />
                </div>

                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative z-10",
                    mode === 'manual'
                        ? "bg-gradient-to-br from-cny-red to-red-950 text-white shadow-2xl border border-cny-gold/20"
                        : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
                )}>
                    <PenTool size={32} />
                    {mode === 'manual' && (
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-cny-gold rounded-full animate-pulse shadow-[0_0_8px_#ffcc33]" />
                    )}
                </div>

                <div className="text-center relative z-10">
                    <h3 className={cn("font-black text-xl tracking-tight transition-colors", mode === 'manual' ? "text-white" : "text-gray-500")}>
                        智能录入
                    </h3>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Vision / Manual Scan</p>
                </div>

                {mode === 'manual' && (
                    <motion.div layoutId="selector-glow" className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cny-red to-tech-cyan" />
                )}
            </button>

            <button
                onClick={() => setMode('db')}
                className={cn(
                    "relative flex flex-col items-center gap-4 p-8 rounded-[40px] border transition-all duration-500 group overflow-hidden active:scale-95",
                    mode === 'db'
                        ? "glass-tech border-cny-red/50 shadow-[0_0_40px_rgba(204,0,0,0.2)]"
                        : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10"
                )}
            >
                {/* Visual Flair */}
                <div className={cn(
                    "absolute -right-6 -bottom-6 transition-all duration-700 pointer-events-none opacity-10",
                    mode === 'db' ? "rotate-12 scale-150 text-cny-gold" : "rotate-0 scale-100 text-white"
                )}>
                    <Database size={120} />
                </div>

                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative z-10",
                    mode === 'db'
                        ? "bg-gradient-to-br from-cny-red to-red-950 text-white shadow-2xl border border-cny-gold/20"
                        : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
                )}>
                    <Database size={32} />
                    {mode === 'db' && (
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-cny-gold rounded-full animate-pulse shadow-[0_0_8px_#ffcc33]" />
                    )}
                </div>

                <div className="text-center relative z-10">
                    <h3 className={cn("font-black text-xl tracking-tight transition-colors", mode === 'db' ? "text-white" : "text-gray-500")}>
                        本地数据库
                    </h3>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Neural Archive Sync</p>
                </div>

                {mode === 'db' && (
                    <motion.div layoutId="selector-glow" className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cny-red to-tech-cyan" />
                )}
            </button>
        </div>
    );
}
