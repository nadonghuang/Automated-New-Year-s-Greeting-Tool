'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full glass-tech rounded-[40px] p-10 border border-white/10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cny-red/5 pointer-events-none" />
        
        <div className="w-20 h-20 bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
          <AlertTriangle className="w-10 h-10 text-cny-red" />
        </div>

        <h2 className="text-2xl font-black mb-4">系统遇到了一些阻碍</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          量子纠缠发生异常。可能是网络波动或数据流冲突导致。<br/>
          <span className="text-xs opacity-50 font-mono mt-2 block">{error.message || "Unknown Error"}</span>
        </p>

        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="bg-white text-black hover:bg-cny-gold hover:text-black px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
        >
          <RefreshCcw size={16} />
          重置系统状态
        </button>
      </div>
    </div>
  );
}
