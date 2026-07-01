"use client";
export { CartProvider, useCart } from "./cart.provider";
export { ThemeProvider } from "./theme.provider";
export { AuthProvider, AuthContext } from "./auth.provider";
export { QueryProvider } from "./query.provider";

import * as React from "react";
import { CartProvider } from "./cart.provider";
import { ThemeProvider } from "./theme.provider";
import { AuthProvider } from "./auth.provider";
import { QueryProvider } from "./query.provider";
import Chatbot from "@/features/chat/components/Chatbot";

export function AppProviders({children}:{children:React.ReactNode}){
 return (
 <ThemeProvider>
 <QueryProvider>
 <AuthProvider>
 <CartProvider>
 {children}
 <Chatbot />
 </CartProvider>
 </AuthProvider>
 </QueryProvider>
 </ThemeProvider>
 );
}
