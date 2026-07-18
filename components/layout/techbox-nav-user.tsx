"use client"

import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/providers/auth.provider"
import { cn } from "@/lib/utils"
import {
  BadgeCheckIcon,
  ChevronsUpDownIcon,
  LogInIcon,
  LogOutIcon,
  ShieldIcon,
} from "lucide-react"

function MenuButton({
  children,
  destructive = false,
  onClick,
}: {
  children: React.ReactNode
  destructive?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-xs outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
      )}
    >
      {children}
    </button>
  )
}

/**
 * Skeleton that matches the exact layout of the user profile row:
 *   [avatar 32x32]  [name line]    [chevron]
 *                    [email line]
 */
function NavUserSkeleton({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return <Skeleton className="size-8 rounded-full" />
  }
  return (
    <>
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="grid flex-1 gap-1.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-2.5 w-36" />
      </div>
      <ChevronsUpDownIcon className="ms-auto size-4 opacity-30" />
    </>
  )
}

export function TechboxNavUser() {
  const { state } = useSidebar()
  const { user, loading, logout } = useAuth()
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLLIElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const openAuth = () => {
    setOpen(false)
    window.dispatchEvent(new CustomEvent("tb_open_auth"))
  }
  const go = (href: string) => {
    setOpen(false)
    window.location.href = href
  }
  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  const collapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setOpen((current) => !current)
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-[calc(var(--radius-sm)+2px)] p-2 text-start text-xs ring-sidebar-ring outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 aria-expanded:bg-muted aria-expanded:text-foreground",
            collapsed && "size-8 justify-center p-0"
          )}
        >
          {loading ? (
            <NavUserSkeleton collapsed={collapsed} />
          ) : user ? (
            <>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ms-auto size-4 group-data-[collapsible=icon]:hidden" />
            </>
          ) : (
            <>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">م</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">کاربر مهمان</span>
                <span className="truncate text-xs text-muted-foreground">ورود به حساب</span>
              </div>
              <ChevronsUpDownIcon className="ms-auto size-4 group-data-[collapsible=icon]:hidden" />
            </>
          )}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute bottom-[calc(100%+0.5rem)] start-0 z-[70] w-64 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95"
          >
            {user ? (
              <>
                <div className="flex items-center gap-2 px-2 py-2 text-start text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <div className="-mx-1 my-1 h-px bg-border/50" />
                <MenuButton onClick={() => go("/account")}>
                  <BadgeCheckIcon className="size-4" />
                  حساب کاربری
                </MenuButton>
                {user.role === "super_admin" && (
                  <MenuButton onClick={() => go("/admin")}>
                    <ShieldIcon className="size-4" />
                    پنل مدیریت
                  </MenuButton>
                )}
                <div className="-mx-1 my-1 h-px bg-border/50" />
                <MenuButton destructive onClick={handleLogout}>
                  <LogOutIcon className="size-4" />
                  Log Out
                </MenuButton>
              </>
            ) : (
              <MenuButton onClick={openAuth}>
                <LogInIcon className="size-4" />
                ورود / ثبت‌نام
              </MenuButton>
            )}
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
