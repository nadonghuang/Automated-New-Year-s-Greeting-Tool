"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Upload, FileSpreadsheet, CheckCircle2, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadProps {
    onParsed: (contacts: any[]) => void;
}

export default function FileUpload({ onParsed }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (selectedFile: File) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
            "text/plain"
        ];
        
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv|txt)$/i)) {
            toast.error("请上传 Excel (.xlsx/.xls) 或 CSV/TXT 文件");
            return;
        }
        
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        if (!file) return;
        
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${API_BASE_URL}/contacts/parse_file`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            onParsed(res.data.friends);
            toast.success(`成功导入 ${res.data.friends.length} 位好友`);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (e: any) {
            toast.error(e.response?.data?.detail || "解析失败，请检查文件格式");
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col w-full max-w-lg mx-auto glass-tech rounded-[32px] shadow-premium overflow-hidden border border-white/5 relative group"
        >
            <div className="p-8 pb-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cny-red to-red-950 flex items-center justify-center text-cny-gold shadow-2xl border border-cny-gold/20">
                        <FileSpreadsheet size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">表格数据导入</h3>
                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Spreadsheet Import System</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-6 relative z-10">
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                        ${dragActive 
                            ? "border-cny-gold/50 bg-cny-gold/5" 
                            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                        }
                        ${file ? "border-green-500/30 bg-green-500/5" : ""}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv,.txt"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="hidden"
                    />
                    
                    <AnimatePresence mode="wait">
                        {file ? (
                            <motion.div
                                key="file-selected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="space-y-4"
                            >
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white truncate max-w-[200px] mx-auto">{file.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="no-file"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="space-y-4"
                            >
                                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-colors
                                    ${dragActive ? "bg-cny-gold/10 text-cny-gold" : "bg-white/[0.02] text-gray-600"}
                                `}>
                                    <Upload size={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-400">
                                        {dragActive ? "松开即可上传" : "拖拽文件至此处"}
                                    </p>
                                    <p className="text-[10px] text-gray-600 mt-1">或点击选择文件</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {file && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <button
                            onClick={() => setFile(null)}
                            className="flex-1 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/[0.08] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <X size={14} />
                            取消
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[2] btn-hongbao text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2 border border-cny-gold/20"
                        >
                            {loading ? (
                                <>
                                    <Sparkles size={14} className="animate-spin" />
                                    解析中...
                                </>
                            ) : (
                                <>
                                    <Upload size={14} />
                                    开始导入
                                </>
                            )}
                        </button>
                    </motion.div>
                )}

                <div className="space-y-2 pt-2">
                    <p className="text-center text-[8px] text-gray-600 font-black uppercase tracking-[0.2em]">
                        支持格式
                    </p>
                    <div className="flex justify-center gap-2">
                        {["Excel (.xlsx)", "CSV", "TXT"].map((fmt) => (
                            <span key={fmt} className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[8px] font-bold text-gray-500 uppercase tracking-wider">
                                {fmt}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
