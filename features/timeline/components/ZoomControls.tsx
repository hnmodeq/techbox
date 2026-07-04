'use client';

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div
      className="absolute bottom-8 right-8 flex flex-col gap-3 z-50"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="bg-[var(--tb-bg-secondary)]/90 backdrop-blur border border-[var(--tb-border)] rounded-[var(--tb-radius-md)] px-3 py-2 tb-text-sm text-[var(--tb-timeline)] font-mono text-center font-bold shadow-[var(--tb-shadow-md)]">
        {(zoom * 100).toFixed(0)}%
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onZoomIn();
        }}
        className="bg-[var(--tb-bg-secondary)] hover:bg-[var(--tb-bg-muted)] text-[var(--tb-timeline)] border border-[var(--tb-border)] p-3 rounded-[var(--tb-radius-md)] shadow-[var(--tb-shadow-md)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="بزرگ‌نمایی"
        aria-label="بزرگ‌نمایی"
      >
        <ZoomIn size={20} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onZoomOut();
        }}
        className="bg-[var(--tb-bg-secondary)] hover:bg-[var(--tb-bg-muted)] text-[var(--tb-timeline)] border border-[var(--tb-border)] p-3 rounded-[var(--tb-radius-md)] shadow-[var(--tb-shadow-md)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="کوچک‌نمایی"
        aria-label="کوچک‌نمایی"
      >
        <ZoomOut size={20} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        className="bg-[var(--tb-bg-secondary)] hover:bg-[var(--tb-bg-muted)] text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)] border border-[var(--tb-border)] p-3 rounded-[var(--tb-radius-md)] shadow-[var(--tb-shadow-md)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="بازنشانی دید"
        aria-label="بازنشانی دید"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
