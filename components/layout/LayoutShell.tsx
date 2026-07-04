"use client";

import * as React from "react";
import SidebarMain from "@/components/layout/Sidebar";
import NewsSidebar from "@/features/home/components/NewsSidebar";
import FooterSection from "@/components/layout/Footer";
import { CartProvider } from "@/providers/cart.provider";
import Chatbot from "@/features/chat/components/Chatbot";
import { AuthModal } from "@/components/ui/AuthModal";

export function LayoutShell({ children }: { children: React.ReactNode }) {
 return (
 <CartProvider>
 <div className="relative min-h-screen text-foreground overflow-x-hidden w-full max-w-full">
 <div className="relative z-10 flex min-h-screen w-full max-w-full">
 <SidebarMain />
 <NewsSidebar />
 <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden max-w-full">
 <div className="flex-1 w-full">
 {children}
 </div>
 <FooterSection />
 </main>
 </div>
 <Chatbot />
 <AuthModal />
 </div>
 </CartProvider>
 );
}
