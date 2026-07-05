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
      className="absolute bottom-8 right-8 flex items-center gap-3 z-50 bg-[var(--card-background)]/95 backdrop-blur-md border border-[var(--border-color)] rounded-[var(--corner-radius)] px-4 py-2.5 shadow-[var(--shadow-size)] select-none"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onZoomChange?.(Math.max(0.1, zoom - 0.2));
        }}
        className="p-1.5 paragraph-color hover:text-[var(--tb-timeline)] transition-colors cursor-pointer"
        title="کوچک‌نمایی (-)"
        aria-label="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>

      {/* Horizontal Range Slider with direct pointer ownership */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0.1"
          max="6.0"
          step="0.05"
          value={zoom}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onChange={(e) => onZoomChange?.(parseFloat(e.target.value))}
          onInput={(e) => onZoomChange?.(parseFloat(e.currentTarget.value))}
          className="w-32 sm:w-44 h-2.5 cursor-pointer appearance-none rounded-full bg-[var(--muted-background)] accent-[var(--tb-timeline)]"
          title="تنظیم بزرگ‌نمایی"
          aria-label="تنظیم بزرگ‌نمایی"
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onZoomChange?.(Math.min(6.0, zoom + 0.2));
        }}
        className="p-1.5 paragraph-color hover:text-[var(--tb-timeline)] transition-colors cursor-pointer"
        title="بزرگ‌نمایی (+)"
        aria-label="Zoom In"
      >
        <ZoomIn size={18} />
      </button>

      <div className="min-w-[48px] font-mono text-xs font-bold text-[var(--tb-timeline)] text-center border-l border-[var(--border-color)] pl-2">
        {(zoom * 100).toFixed(0)}%
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        className="p-1.5 paragraph-color hover:text-[var(--primary-text)] transition-colors cursor-pointer"
        title="بازنشانی دید (100%)"
        aria-label="Reset View"
      >
        <RotateCcw size={17} />
      </button>
    </div>
  );
}
