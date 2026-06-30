"use client";

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "motion/react";
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from "react";

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  active?: boolean;
};

export type DockOrientation = "horizontal" | "vertical";

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelSize?: number;
  baseItemSize?: number;
  dockSize?: number;
  magnification?: number;
  spring?: SpringOptions;
  orientation?: DockOrientation;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mousePos: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  label?: React.ReactNode;
  orientation: DockOrientation;
  active?: boolean;
};

function DockItem({
  children,
  className = "",
  onClick,
  mousePos,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
  orientation,
  active,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mousePos, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: baseItemSize, height: baseItemSize };
    return orientation === "vertical"
      ? val - rect.y - baseItemSize / 2
      : val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center justify-center rounded-full border-2 shadow-[var(--tb-dock-shadow)] ${
        active ? "border-[var(--tb-brand)]" : "border-[var(--tb-dock-border)]"
      } bg-[var(--tb-dock-bg)] ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={typeof label === "string" ? label : undefined}
    >
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number>; orientation?: DockOrientation }>, {
              isHovered,
              orientation,
            })
          : child
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
  orientation?: DockOrientation;
};

function DockLabel({ children, className = "", isHovered, orientation = "horizontal" }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  const positionClasses =
    orientation === "vertical"
      ? "top-1/2 right-full mr-3 -translate-y-1/2"
      : "-top-6 left-1/2 -translate-x-1/2";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: orientation === "vertical" ? 8 : 0, y: orientation === "vertical" ? 0 : 0 }}
          animate={{ opacity: 1, x: 0, y: orientation === "vertical" ? 0 : -10 }}
          exit={{ opacity: 0, x: orientation === "vertical" ? 8 : 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} ${positionClasses} absolute z-50 w-fit whitespace-pre rounded-md border border-[var(--tb-dock-label-border)] bg-[var(--tb-dock-label-bg)] px-2 py-0.5 text-xs text-[var(--tb-dock-label-fg)] shadow-[var(--tb-dock-shadow)]`}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = "" }: DockIconProps) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelSize = 64,
  dockSize = 256,
  baseItemSize = 50,
  orientation = "vertical",
}: DockProps) {
  const mousePos = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const isVertical = orientation === "vertical";
  const maxExtent = useMemo(
    () => Math.max(dockSize, magnification + magnification / 2 + 4),
    [dockSize, magnification]
  );
  const extentRow = useTransform(isHovered, [0, 1], [panelSize, maxExtent]);
  const extent = useSpring(extentRow, spring);

  return (
    <motion.div
      style={isVertical ? { width: extent, scrollbarWidth: "none" } : { height: extent, scrollbarWidth: "none" }}
      className={isVertical ? "my-2 flex max-h-full justify-center" : "mx-2 flex max-w-full items-center"}
    >
      <motion.div
        onMouseMove={({ pageX, pageY }) => {
          isHovered.set(1);
          mousePos.set(isVertical ? pageY : pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mousePos.set(Infinity);
        }}
        className={`${className} flex w-fit gap-4 rounded-2xl border-2 border-[var(--tb-dock-border)] bg-[var(--tb-dock-bg)]/70 backdrop-blur-[var(--tb-blur-sm)] ${
          isVertical ? "flex-col items-center py-4 px-2" : "items-end pb-2 px-4"
        }`}
        style={isVertical ? { width: panelSize } : { height: panelSize }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mousePos={mousePos}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            orientation={orientation}
            active={item.active}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
