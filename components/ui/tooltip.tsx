"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

type TooltipTheme = {
  background: string
  foreground: string
}

const TooltipThemeContext = React.createContext<TooltipTheme | null>(null)

/**
 * Gives every tooltip rendered below it the current module colour.
 *
 * Base UI portals tooltip popups to document.body, so ordinary CSS variables
 * on a section do not inherit into them. React context does cross a portal;
 * TooltipContent applies the resolved values directly to the popup and arrow.
 */
export function TooltipColorScope({
  color,
  children,
}: {
  color?: string
  children: React.ReactNode
}) {
  const parent = React.useContext(TooltipThemeContext)
  const value = React.useMemo<TooltipTheme | null>(() => {
    if (!color) return parent
    return {
      background: color,
      // The admin defaults are intentionally dark enough for white text. A
      // custom CSS variable cannot be measured in JS, so white is the safe
      // neutral fallback for module-coloured tooltips.
      foreground: "#fff",
    }
  }, [color, parent])

  return <TooltipThemeContext.Provider value={value}>{children}</TooltipThemeContext.Provider>
}

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  style,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  const theme = React.useContext(TooltipThemeContext)
  const themedStyle = {
    ...(theme
      ? {
          "--tooltip-background": theme.background,
          "--tooltip-foreground": theme.foreground,
        }
      : {}),
    ...style,
  } as React.CSSProperties

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-[1200]"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          style={themedStyle}
          className={cn(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-[color:var(--tooltip-background,var(--foreground))] px-3 py-1.5 text-xs text-[color:var(--tooltip-foreground,var(--background))] has-data-[slot=kbd]:pe-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-start-2 data-[side=inline-start]:slide-in-from-end-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-[color:var(--tooltip-background,var(--foreground))] fill-[color:var(--tooltip-background,var(--foreground))] data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-start-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-end-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
