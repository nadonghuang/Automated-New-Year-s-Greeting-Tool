"use client";

import { X, CheckCircle2, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type TaskStep = "model" | "basic" | "ai_deep" | "generating" | "review" | "done";

export interface Task {
    contactId: string;
    contactName: string;
    step: TaskStep;
    history: { question: string; answer: string }[];
    basicIndex: number;
    aiQuestionCount: number;
    selectedModel: string;
    greeting?: string;
    currentAIQuestion?: { question: string; options: string[] } | null;
}

interface TaskTabsProps {
    tasks: Task[];
    activeTaskId: string | null;
    onSelectTask: (taskId: string) => void;
    onRemoveTask: (taskId: string) => void;
}

export default function TaskTabs({ tasks, activeTaskId, onSelectTask, onRemoveTask }: TaskTabsProps) {
    if (tasks.length === 0) return null;

    const getStepIcon = (step: TaskStep) => {
        switch (step) {
            case "model":
                return <Sparkles size={10} />;
            case "basic":
            case "ai_deep":
                return <MessageCircle size={10} />;
            case "generating":
                return <Loader2 size={10} className="animate-spin" />;
            case "review":
            case "done":
                return <CheckCircle2 size={10} />;
            default:
                return null;
        }
    };

    const getStepColor = (step: TaskStep) => {
        switch (step) {
            case "model":
                return "text-gray-400";
            case "basic":
            case "ai_deep":
                return "text-cny-gold";
            case "generating":
                return "text-cny-gold animate-pulse";
            case "review":
            case "done":
                return "text-green-400";
            default:
                return "text-gray-400";
        }
    };

    return (
        <div className="shrink-0 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-1 p-2 overflow-x-auto scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                        <motion.div
                            key={task.contactId}
                            initial={{ opacity: 0, scale: 0.9, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 10 }}
                            layout
                            className={cn(
                                "group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border",
                                activeTaskId === task.contactId
                                    ? "bg-cny-red/10 border-cny-red/30 text-white"
                                    : "bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                            onClick={() => onSelectTask(task.contactId)}
                        >
                            <span className={cn("flex items-center", getStepColor(task.step))}>
                                {getStepIcon(task.step)}
                            </span>
                            <span className="text-[11px] font-bold truncate max-w-[80px]">
                                {task.contactName}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveTask(task.contactId);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-red-400"
                            >
                                <X size={12} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
