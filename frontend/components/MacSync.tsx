"use client";

import { useState } from "react";
import axios from "axios";
import { Monitor, Loader2, Info } from "lucide-react";
import { API_BASE_URL } from "@/lib/utils";

export default function MacSync({ onContactsLoaded }: { onContactsLoaded: (contacts: any[]) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSync = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(`${API_BASE_URL}/wechat/mac_read`);
            if (res.data.friends.length === 0) {
                setError("未读取到联系人。请确保微信已打开并在前台，或者尝试滚动一下列表再试。");
            } else {
                onContactsLoaded(res.data.friends);
            }
        } catch (e: any) {
            setError(e.response?.data?.detail || "读取失败，请检查是否授予了辅助功能权限。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-xl mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-gray-600" />
                Mac 客户端直连 (Beta)
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center">无需扫码，直接读取电脑上运行的微信窗口。</p>

            <button
                onClick={handleSync}
                disabled={loading}
                className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : "读取当前可见联系人"}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 max-w-sm">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <p className="text-xs text-gray-400 mt-4 max-w-xs text-center">
                * 需要授予终端/Python 辅助功能权限。<br />
                * 如果列表很长，请手动滚动微信列表，然后再次点击读取，新名字会自动添加。
            </p>
        </div>
    );
}
