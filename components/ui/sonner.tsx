"use client"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps, toast } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { useEffect } from "react"

/** Adds a click-to-dismiss handler for all toasts rendered by Sonner */
function ToastDismissOnClick() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const toastEl = (e.target as Element).closest("[data-sonner-toast]")
      if (!toastEl) return
      // Don't dismiss if the user clicked the close button itself
      if ((e.target as Element).closest("[data-close-button]")) return
      const id = toastEl.getAttribute("data-id")
      if (id) toast.dismiss(id)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])
  return null
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <>
      <ToastDismissOnClick />
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        closeButton={true}
        duration={4000}
        expand={true}
        visibleToasts={5}
        gap={8}
        position="bottom-center"
        dir="rtl"
        icons={{
          success: (
            <CircleCheckIcon className="size-4" />
          ),
          info: (
            <InfoIcon className="size-4" />
          ),
          warning: (
            <TriangleAlertIcon className="size-4" />
          ),
          error: (
            <OctagonXIcon className="size-4" />
          ),
          loading: (
            <Loader2Icon className="size-4 animate-spin" />
          ),
        }}
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
          } as React.CSSProperties
        }
        toastOptions={{
          classNames: {
            toast: "cn-toast cursor-pointer",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
