'use client';

import React from 'react';

export function TimelineLoading() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
          <div className="w-12 h-12 border-[length:var(--border-size)] border-slate-700 border-t-blue-500 rounded-full" />
        </div>
        <p className="text-slate-400">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
