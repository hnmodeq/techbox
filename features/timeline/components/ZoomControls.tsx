'use client';

import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onReset: () => void;
  onZoomChange?: (nextZoom: number) => void;
}

export function ZoomControls({ zoom, onReset, onZoomChange }: ZoomControlsProps) {
  return (
    <div
      className="absolute bottom-8 right-8 flex items-center gap-3 z-50 bg-[var(--tb-bg-secondary)]/95 backdrop-blur-md border border-[var(--tb-border)] rounded-[var(--tb-radius-lg)] px-4 py-2.5 shadow-[var(--tb-shadow-lg)] select-none"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      dir="ltr"
    >
      <button
        type="button"
        onClick={() => onZoomChange?.(Math.max(0.1, zoom - 0.2))}
        className="p-1.5 text-[var(--tb-fg-muted)] hover:text-[var(--tb-timeline)] transition-colors cursor-pointer"
        title="کوچک‌نمایی (-)"
        aria-label="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>

      {/* Horizontal Range Slider for smooth, deep Zoom-In / Zoom-Out (0.1x to 6.0x) */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0.1"
          max="6.0"
          step="0.05"
          value={zoom}
          onChange={(e) => onZoomChange?.(parseFloat(e.target.value))}
          className="w-32 sm:w-44 h-2 cursor-pointer appearance-none rounded-full bg-[var(--tb-bg-muted)] accent-[var(--tb-timeline)]"
          title="تنظیم بزرگ‌نمایی"
          aria-label="تنظیم بزرگ‌نمایی"
        />
      </div>

      <button
        type="button"
        onClick={() => onZoomChange?.(Math.min(6.0, zoom + 0.2))}
        className="p-1.5 text-[var(--tb-fg-muted)] hover:text-[var(--tb-timeline)] transition-colors cursor-pointer"
        title="بزرگ‌نمایی (+)"
        aria-label="Zoom In"
      >
        <ZoomIn size={18} />
      </button>

      <div className="min-w-[48px] font-mono text-xs font-bold text-[var(--tb-timeline)] text-center border-l border-[var(--tb-border)] pl-2">
        {(zoom * 100).toFixed(0)}%
      </div>

      <button
        type="button"
        onClick={onReset}
        className="p-1.5 text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)] transition-colors cursor-pointer"
        title="بازنشانی دید (100%)"
        aria-label="Reset View"
      >
        <RotateCcw size={17} />
      </button>
    </div>
  );
}
