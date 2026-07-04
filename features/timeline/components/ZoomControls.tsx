'use client';

import React from 'react';
import { RotateCcw, Search } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset: () => void;
  onZoomChange?: (nextZoom: number) => void;
}

export function ZoomControls({ zoom, onReset, onZoomChange }: ZoomControlsProps) {
  return (
    <div
      className="absolute bottom-8 right-8 flex flex-col items-center gap-3 z-50 bg-[var(--tb-bg-secondary)]/90 backdrop-blur border border-[var(--tb-border)] rounded-[var(--tb-radius-lg)] p-3 shadow-[var(--tb-shadow-lg)]"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="tb-text-sm text-[var(--tb-timeline)] font-mono text-center font-bold">
        {(zoom * 100).toFixed(0)}%
      </div>

      {/* Vertical Range Slider for smooth, deep Zoom-In / Zoom-Out */}
      <div className="h-40 flex items-center justify-center py-2">
        <input
          type="range"
          min="0.1"
          max="6.0"
          step="0.05"
          value={zoom}
          onChange={(e) => onZoomChange?.(parseFloat(e.target.value))}
          className="h-32 w-2 cursor-pointer appearance-none rounded-full bg-[var(--tb-bg-muted)] accent-[var(--tb-timeline)] [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
          style={{
            writingMode: 'vertical-lr',
            direction: 'rtl',
          }}
          title="تنظیم بزرگ‌نمایی"
          aria-label="تنظیم بزرگ‌نمایی"
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        className="bg-[var(--tb-bg-muted)] hover:bg-[var(--tb-bg-primary)] text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)] border border-[var(--tb-border)] p-2.5 rounded-[var(--tb-radius-md)] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer mt-1"
        title="بازنشانی دید (100%)"
        aria-label="بازنشانی دید"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
}
