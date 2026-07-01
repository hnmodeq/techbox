"use client";

import * as React from "react";
import SidebarMain from "@/components/layout/Sidebar";
import FooterSection from "@/components/layout/Footer";
import { CartProvider } from "@/providers/cart.provider";
import Chatbot from "@/features/chat/components/Chatbot";

export function LayoutShell({ children }: { children: React.ReactNode }) {
 return (
 <CartProvider>
 <div className="relative min-h-screen text-foreground">
 <div className="relative z-10 flex min-h-screen w-full">
 <SidebarMain />
 <main className="min-w-0 flex-1 flex flex-col">
 <div className="flex-1 w-full">
 {children}
 </div>
 <FooterSection />
 </main>
 </div>
 <Chatbot />
 </div>
 </CartProvider>
 );
}
