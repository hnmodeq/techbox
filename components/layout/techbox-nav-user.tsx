"use client"

import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/providers/auth.provider"
import { cn } from "@/lib/utils"
import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogInIcon,
  LogOutIcon,
  ShieldIcon,
  SparklesIcon,
} from "lucide-react"

export function TechboxNavUser() {
  const { isMobile, state } = useSidebar()
  const { user, logout } = useAuth()

  const openAuth = () => window.dispatchEvent(new CustomEvent("tb_open_auth"))
  const openNotifications = () => window.dispatchEvent(new CustomEvent("tb_open_notifications"))

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-[calc(var(--radius-sm)+2px)] p-2 text-start text-xs ring-sidebar-ring outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 aria-expanded:bg-muted aria-expanded:text-foreground",
                  state === "collapsed" && "size-8 justify-center p-0"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user?.avatar} alt={user?.name || "کاربر"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "کاربر"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{user?.name || "کاربر مهمان"}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email || "ورود به حساب"}</span>
                </div>
                <ChevronsUpDownIcon className="ms-auto size-4 group-data-[collapsible=icon]:hidden" />
              </button>
            }
          />
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={8}
          >
            {user ? (
              <>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = "/account"}>
                    <SparklesIcon className="size-4" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = "/account"}>
                    <BadgeCheckIcon className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/shop/checkout"}>
                    <CreditCardIcon className="size-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openNotifications}>
                    <BellIcon className="size-4" />
                    Notifications
                  </DropdownMenuItem>
                  {user.role === "super_admin" && (
                    <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                      <ShieldIcon className="size-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOutIcon className="size-4" />
                  Log Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={openAuth}>
                <LogInIcon className="size-4" />
                ورود / ثبت‌نام
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
