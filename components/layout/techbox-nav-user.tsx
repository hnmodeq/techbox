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
import { Button } from "@/components/ui/button"
import {
  ChevronsUpDownIcon,
  UserIcon,
  ShieldIcon,
  LogOutIcon,
  LogInIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

export function TechboxNavUser() {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name || "کاربر"} />
                <AvatarFallback>{user?.name?.charAt(0) || "کاربر"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user?.name || "کاربر مهمان"}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email || "ورود به حساب"}</span>
              </div>
              <ChevronsUpDownIcon className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "left"}
            align="end"
            sideOffset={4}
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
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <UserIcon className="size-4" />
                      حساب کاربری
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "super_admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldIcon className="size-4" />
                        پنل مدیریت
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                    {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                    {isDark ? "حالت روشن" : "حالت تاریک"}
                  </DropdownMenuItem>
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
                  <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                    {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                    {isDark ? "حالت روشن" : "حالت تاریک"}
                  </DropdownMenuItem>
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
