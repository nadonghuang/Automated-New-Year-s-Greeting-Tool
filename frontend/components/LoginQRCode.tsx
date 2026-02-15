"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, CheckCircle2, RefreshCcw, ShieldCheck, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, API_BASE_URL } from "@/lib/utils";

interface LoginStatus {
    status: "IDLE" | "WAITING_SCAN" | "LOGGED_IN" | "FAILED";
    qr_code: string | null;
    is_logged_in: boolean;
}

export default function LoginQRCode({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [status, setStatus] = useState<LoginStatus["status"]>("IDLE");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/wechat/status`);
                const data: LoginStatus = res.data;
                setStatus(data.status);
                setQrCode(data.qr_code);

                if (data.is_logged_in) {
                    onLoginSuccess();
                    clearInterval(interval);
                }
            } catch (e) {
                console.error("Failed to check status", e);
            }
        };

        interval = setInterval(checkStatus, 2000);
        checkStatus();

        return () => clearInterval(interval);
    }, [onLoginSuccess]);

    const startLogin = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/wechat/login`);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full flex items-center gap-3 mb-6 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div className="p-2 bg-red-600 rounded-lg text-white">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-red-900 text-sm">官方协议扫码</h3>
                    <p className="text-[10px] text-red-600/60 font-medium">不保存任何登录凭据，仅限本地执行</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {status === "IDLE" ? (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-[30px] flex items-center justify-center mb-6 text-gray-200">
                            <QrCode size={48} />
                        </div>
                        <button
                            onClick={startLogin}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-red-200 flex items-center gap-3 active:scale-95 group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw className="group-hover:rotate-180 transition-transform duration-500" />}
                            点击生成登录二维码
                        </button>
                    </motion.div>
                ) : status === "WAITING_SCAN" && qrCode ? (
                    <motion.div
                        key="qr"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center"
                    >
                        <div className="bg-white p-4 rounded-[32px] shadow-2xl border border-gray-100 mb-6 relative group">
                            <div className="absolute inset-0 bg-red-600/5 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img src={qrCode} alt="Scan QR Code" className="w-56 h-56 rounded-xl relative z-10" />
                        </div>
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            请使用手机微信扫码
                        </div>
                    </motion.div>
                ) : status === "LOGGED_IN" ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                    >
                        <div className="w-20 h-20 bg-green-500 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">验证通过</h4>
                        <p className="text-sm text-gray-400 font-medium">正在同步您的好友名册...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="failed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6"
                    >
                        <p className="text-red-600 font-black mb-4 flex items-center justify-center gap-2">
                            遭遇异常，请检查网络连接
                        </p>
                        <button
                            onClick={startLogin}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                            重新尝试生成
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
