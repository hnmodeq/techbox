'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TimelineErrorProps {
  error: string;
  onRetry?: () => void;
}

export function TimelineError({ error, onRetry }: TimelineErrorProps) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold text-white">خطا در بارگذاری</h2>
        <p className="text-slate-400">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            تلاش مجدد
          </button>
        )}
      </div>
    </div>
  );
}
