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
    <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-50">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-sm text-blue-400 font-mono text-center min-w-max">
        {(zoom * 100).toFixed(0)}%
      </div>

      <button
        onClick={onZoomIn}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-all hover:shadow-blue-500/50 active:scale-95"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn size={20} />
      </button>

      <button
        onClick={onZoomOut}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-all hover:shadow-blue-500/50 active:scale-95"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>

      <button
        onClick={onReset}
        className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg shadow-lg transition-all hover:shadow-slate-500/50 active:scale-95"
        title="Reset View"
        aria-label="Reset View"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
