"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Database, Key, Search, Loader2, AlertTriangle, CheckCircle2, HelpCircle, ChevronRight, FileCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, API_BASE_URL } from "@/lib/utils";

export default function LocalDBSync({ onContactsLoaded }: { onContactsLoaded: (contacts: any[]) => void }) {
    const [dbPaths, setDbPaths] = useState<string[]>([]);
    const [selectedPath, setSelectedPath] = useState("");
    const [keyHex, setKeyHex] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("IDLE"); // IDLE, SYNCING, DONE, ERROR
    const [error, setError] = useState("");
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const detectDBs = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/wechat/local_db/detect`);
                setDbPaths(res.data.paths);
                if (res.data.paths.length > 0) {
                    setSelectedPath(res.data.paths[0]);
                }
            } catch (e) {
                console.error("Failed to detect DBs", e);
            }
        };
        detectDBs();
    }, []);

    const handleSync = async () => {
        if (!selectedPath || !keyHex) return;
        setLoading(true);
        setStatus("SYNCING");
        setError("");
        try {
            const res = await axios.post(`${API_BASE_URL}/wechat/local_db/sync`, {
                db_path: selectedPath,
                key_hex: keyHex.trim()
            });
            setStatus("DONE");
            onContactsLoaded(res.data.friends);
        } catch (e: any) {
            setStatus("ERROR");
            setError(e.response?.data?.detail || "同步失败，请检查数据库路径与密钥是否正确。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto flex flex-col gap-6"
        >
            <div className="glass-tech rounded-[40px] p-10 border border-white/5 relative overflow-hidden shadow-3xl">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-cny-red/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-cny-red to-red-950 rounded-2xl flex items-center justify-center text-cny-gold shadow-2xl border border-cny-gold/20">
                                <Database size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter">数据库本地直连</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Neural Database Decryption</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-cny-red/20 hover:text-cny-red transition-all border border-white/5"
                        >
                            <HelpCircle size={20} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* DB Path Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] pl-1">Path Calibration</label>
                            <div className="grid gap-3">
                                {dbPaths.length > 0 ? (
                                    dbPaths.map((path) => (
                                        <button
                                            key={path}
                                            onClick={() => setSelectedPath(path)}
                                            className={cn(
                                                "w-full p-5 rounded-2xl border transition-all text-left flex items-center gap-4 group",
                                                selectedPath === path
                                                    ? "bg-cny-red/10 border-cny-red/40 text-white"
                                                    : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                                            )}
                                        >
                                            <div className={cn("w-2 h-2 rounded-full", selectedPath === path ? "bg-cny-red animate-pulse shadow-[0_0_8px_#cc0000]" : "bg-gray-800")} />
                                            <span className="text-xs font-mono truncate flex-1">{path}</span>
                                            <ChevronRight size={14} className={cn("transition-transform", selectedPath === path ? "rotate-90 text-cny-red" : "text-gray-700")} />
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-3">
                                        <AlertTriangle size={16} />
                                        未探测到自动安装路径，请手动确认微信是否已安装。
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Key Input */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-cny-gold uppercase tracking-[0.4em] pl-1">Encryption Key (64-bit Hex)</label>
                            <div className="relative group">
                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cny-gold transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="输入 64 位十六进制密钥..."
                                    className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-black/40 border border-white/5 focus:border-cny-red/50 focus:bg-black/60 outline-none text-md font-mono text-white transition-all placeholder:text-gray-700"
                                    value={keyHex}
                                    onChange={(e) => setKeyHex(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Messages */}
                        <AnimatePresence>
                            {status === "SYNCING" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-cny-red/10 border border-cny-red/20 rounded-[24px] flex items-center gap-4">
                                    <Loader2 className="w-6 h-6 text-cny-red animate-spin" />
                                    <span className="text-sm font-black text-white uppercase tracking-widest neo-text-red">正在解码全域神经名单...</span>
                                </motion.div>
                            )}
                            {status === "ERROR" && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-red-950/40 border border-red-500/30 rounded-[24px] flex items-start gap-4 text-red-400">
                                    <AlertTriangle className="w-6 h-6 shrink-0" />
                                    <p className="text-xs font-bold leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                            {status === "DONE" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-green-950/40 border border-green-500/30 rounded-[24px] flex items-center gap-4 text-green-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="text-sm font-black uppercase tracking-widest">神经中枢数据同步完成！</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Button */}
                        <button
                            onClick={handleSync}
                            disabled={loading || !selectedPath || !keyHex}
                            className="w-full bg-gradient-to-r from-cny-red to-red-800 text-white py-6 rounded-[32px] font-black text-xl hover:shadow-[0_0_40px_rgba(204,0,0,0.4)] transition-all disabled:opacity-20 flex items-center justify-center gap-4 active:scale-95 border border-white/10"
                        >
                            <FileCode size={24} className="group-hover:rotate-12 transition-transform" />
                            <span>执行全量解密同步</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-black/60 rounded-[32px] border border-white/5 p-8 overflow-hidden"
                    >
                        <h4 className="text-cny-gold font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                            <HelpCircle size={14} /> macOS 密钥获取引导
                        </h4>
                        <div className="space-y-4 text-gray-400 text-xs leading-relaxed">
                            <p>由于 macOS 系统安全限制，获取加密密钥需要以下步骤：</p>
                            <ol className="list-decimal pl-4 space-y-2">
                                <li>保持微信处于登录状态。</li>
                                <li>打开 <span className="text-white font-mono bg-white/5 px-1 rounded">终端.app</span>。</li>
                                <li>使用开源工具（如 <span className="text-white underline">PyWxDump</span>）或运行特定的 <span className="text-white">lldb</span> 脚本来提取。</li>
                                <li>密钥通常是一个 64 位的十六进制字符串（由 0-9 和 a-f 组成）。</li>
                            </ol>
                            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">典型示例：</p>
                                <code className="text-cny-red font-mono break-all">4a93c9d2f0... (此处省略) ...6b8c2e91</code>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
