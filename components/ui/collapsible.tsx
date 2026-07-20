"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ className, ...props }: CollapsiblePrimitive.Panel.Props & { className?: string }) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={[
        // Animate open AND close: height 0 ↔ auto with overflow clipping
        "overflow-hidden",
        "transition-[height] duration-300 ease-out",
        "data-[open]:animate-none",
        className,
      ].filter(Boolean).join(" ")}
      style={{ "--collapsible-duration": "300ms" } as React.CSSProperties}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
