"use client"

import * as React from "react"
import Link from "next/link"

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
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/providers/auth.provider"
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"
import {
  ChevronsUpDownIcon,
  UserIcon,
  ShieldIcon,
  LogOutIcon,
  LogInIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

export function TechboxNavUser() {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const { theme } = useTheme()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted aria-expanded:text-foreground"
              />
            }
          >
            <Avatar>
              <AvatarImage src={user?.avatar} alt={user?.name || "کاربر"} />
              <AvatarFallback>{user?.name?.charAt(0) || "کاربر"}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-medium">{user?.name || "کاربر مهمان"}</span>
              <span className="truncate text-xs">{user?.email || "ورود به حساب"}</span>
            </div>
            <ChevronsUpDownIcon className="ms-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {user ? (
              <>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/account" />}>
                    <UserIcon className="size-4" />
                    حساب کاربری
                  </DropdownMenuItem>
                  {user.role === "super_admin" && (
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      <ShieldIcon className="size-4" />
                      پنل مدیریت
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs text-muted-foreground">تم</span>
                    <ThemeToggleButton theme={theme === "dark" ? "dark" : "light"} expanded={false} />
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOutIcon className="size-4" />
                  خروج از حساب
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuGroup>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs text-muted-foreground">تم</span>
                    <ThemeToggleButton theme={theme === "dark" ? "dark" : "light"} expanded={false} />
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent("tb_open_auth"))}>
                  <LogInIcon className="size-4" />
                  ورود / ثبت‌نام
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
