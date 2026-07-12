'use client';

import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ZoomControlsProps {
  zoom: number;
  onReset: () => void;
  onZoomChange?: (nextZoom: number) => void;
}

export function ZoomControls({ zoom, onReset, onZoomChange }: ZoomControlsProps) {
  return (
    <Card
      className="absolute bottom-8 right-8 flex items-center gap-2 z-50 p-2.5 backdrop-blur-md select-none"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          onZoomChange?.(Math.max(0.1, zoom - 0.2));
        }}
        title="کوچک‌نمایی (-)"
        aria-label="Zoom Out"
      >
        <ZoomOut className="size-4" />
      </Button>

      <div className="flex items-center gap-2 w-32 sm:w-44">
        <Slider
          min={0.1}
          max={6.0}
          step={0.05}
          value={[zoom]}
          onValueChange={(val: any) => {
            const v = Array.isArray(val) ? val[0] : val;
            onZoomChange?.(parseFloat(String(v)));
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          onZoomChange?.(Math.min(6.0, zoom + 0.2));
        }}
        title="بزرگ‌نمایی (+)"
        aria-label="Zoom In"
      >
        <ZoomIn className="size-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Badge variant="secondary" className="min-w-[48px] font-mono text-xs justify-center">
        {(zoom * 100).toFixed(0)}%
      </Badge>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        title="بازنشانی دید (100%)"
        aria-label="Reset View"
      >
        <RotateCcw className="size-4" />
      </Button>
    </Card>
  );
}
