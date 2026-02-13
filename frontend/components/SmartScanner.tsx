"use client";

import { useState } from "react";
import axios from "axios";
import { Bot, Loader2, AlertTriangle, CheckCircle2, Play, Sparkles, Cpu, Settings, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/utils";

interface PermissionStatus {
    accessibility: boolean;
    screen_recording: boolean;
}

export default function SmartScanner({ onContactsLoaded }: { onContactsLoaded: (contacts: any[]) => void }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("IDLE"); // IDLE, SCANNING, DONE, ERROR
    const [error, setError] = useState("");
    const [showPermissionGuide, setShowPermissionGuide] = useState(false);
    const [permStatus, setPermStatus] = useState<PermissionStatus>({ accessibility: true, screen_recording: true });

    const checkAndStart = async () => {
        setLoading(true);
        setError("");
        
        try {
            // 1. Pre-check permissions
            const permRes = await axios.get(`${API_BASE_URL}/wechat/check_permissions`);
            const perms = permRes.data;
            setPermStatus(perms);

            if (!perms.accessibility) {
                setShowPermissionGuide(true);
                setLoading(false);
                return;
            }

            // 2. Start Scan
            await startScan();

        } catch (e) {
            console.error(e);
            // If check fails, try to proceed anyway
            await startScan();
        }
    };

    const startScan = async () => {
        setStatus("SCANNING");
        try {
            // Give user 1 second to prep
            await new Promise(r => setTimeout(r, 1000));

            const res = await axios.get(`${API_BASE_URL}/wechat/auto_scan`);

            if (res.data.friends.length === 0) {
                setStatus("ERROR");
                setError("量子传感器未捕捉到有效标记。请确保微信窗口处于全局置顶且好友列表完全可见。");
            } else {
                setStatus("DONE");
                onContactsLoaded(res.data.friends);
            }
        } catch (e: any) {
            setStatus("ERROR");
            setError(e.response?.data?.detail || "链路中断。请授予终端【辅助功能】与【屏幕录制】权限以校准扫描仪。");
            // If error implies permission, show guide
            if (e.response?.data?.detail?.includes("权限") || !permStatus.accessibility) {
                 setShowPermissionGuide(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col glass-tech rounded-[40px] border border-white/5 overflow-hidden relative group shadow-[0_20px_100px_rgba(0,0,0,0.5)]">
            {/* Permission Guide Modal */}
            <AnimatePresence>
                {showPermissionGuide && (
                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-md w-full"
                        >
                            <div className="w-16 h-16 bg-red-950/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cny-red/30">
                                <Settings className="w-8 h-8 text-cny-red animate-spin-slow" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">系统权限受限</h3>
                            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                                为了自动操控微信，macOS 需要您手动授予终端权限。<br/>请前往 <span className="text-white font-bold">系统设置 &gt; 隐私与安全性</span> 开启以下权限：
                            </p>
                            
                            <div className="space-y-3 mb-8 text-left">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${permStatus.accessibility ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-sm font-bold text-gray-200">辅助功能 (Accessibility)</span>
                                    </div>
                                    {!permStatus.accessibility && <span className="text-[10px] text-cny-red font-black uppercase tracking-wider">未授权</span>}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <span className="text-sm font-bold text-gray-200">屏幕录制 (Screen Recording)</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">需手动检查</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowPermissionGuide(false)}
                                    className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors"
                                >
                                    稍后处理
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowPermissionGuide(false);
                                        checkAndStart();
                                    }}
                                    className="flex-1 py-4 rounded-xl bg-cny-red hover:bg-red-600 text-xs font-black uppercase tracking-widest text-white transition-colors shadow-lg shadow-red-900/20"
                                >
                                    已开启，重试
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pulsing Energy Background */}
            <div className="absolute -right-40 -top-40 w-80 h-80 bg-cny-red/10 blur-[100px] rounded-full animate-pulse" />

            <div className="p-10 relative z-10">
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-cny-red to-red-950 rounded-2xl flex items-center justify-center text-cny-gold shadow-2xl border border-cny-gold/20 group-hover:rotate-12 transition-transform duration-500">
                        <Cpu size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter">视觉 AI 自动扫描仪</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Autonomous Perception Engine</p>
                    </div>
                </div>

                <div className="bg-black/40 p-8 rounded-[32px] border border-white/5 mb-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">扫描模式：全域数据追踪</span>
                            <span className="font-mono text-tech-cyan text-xs font-black uppercase tracking-[0.3em] animate-pulse">AUTO-SYNC ON</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 py-4 px-5 bg-cny-red/5 rounded-2xl border border-cny-red/20">
                        <Sparkles size={16} className="text-cny-gold" />
                        <p className="text-xs text-gray-400 font-bold leading-relaxed">
                            系统将自动识别列表底边。无需手动校准，机器人会全速穿透数据流直到完成全量扫描。
                        </p>
                    </div>
                </div>

                <AnimatePresence>
                    {status === "SCANNING" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-8 p-6 bg-cny-red/10 border border-cny-red/30 rounded-[32px] overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-scan-fast" />
                            <div className="flex items-center gap-4 relative z-10">
                                <Loader2 className="w-6 h-6 text-cny-red animate-spin" />
                                <span className="text-sm font-black text-white uppercase tracking-widest neo-text-red">矩阵同步中，请停止操作外部终端...</span>
                            </div>
                        </motion.div>
                    )}

                    {status === "ERROR" && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-8 p-6 bg-red-950/40 border border-red-500/30 rounded-[32px]"
                        >
                            <div className="flex items-start gap-4 text-red-400">
                                <AlertTriangle className="w-6 h-6 shrink-0" />
                                <p className="text-xs leading-relaxed font-bold">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === "DONE" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-6 bg-green-950/40 border border-green-500/30 rounded-[32px]"
                        >
                            <div className="flex items-center gap-4 text-green-400">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="text-sm font-black uppercase tracking-widest">全息映射完成！</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={checkAndStart}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cny-red to-red-800 hover:shadow-[0_0_50px_rgba(204,0,0,0.4)] disabled:opacity-20 py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 transition-all group overflow-hidden relative border border-white/5 active:scale-95"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {loading ? (
                        <>正在引导量子链路...</>
                    ) : (
                        <>
                            <Play className="w-6 h-6 fill-current text-white group-hover:scale-125 transition-transform" />
                            <span className="uppercase tracking-widest">启动全景扫描仪</span>
                        </>
                    )}
                </button>

                <div className="mt-8 space-y-3">
                    {[
                        "将微信好友列表置于感知流顶层",
                        "激活后机器人将尝试夺取临时总线控制权",
                        "首次部署：正在下载 127MB 神经网络权重"
                    ].map((tip, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-30">
                            <div className="w-1 h-1 bg-gray-500 rounded-full" />
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
