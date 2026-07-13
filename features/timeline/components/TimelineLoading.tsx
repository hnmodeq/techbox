'use client';

import React from 'react';

export function TimelineLoading() {
  return (
    <div className="w-full h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
          <div className="w-12 h-12 rounded-full border border-muted border-t-primary" />
        </div>
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
