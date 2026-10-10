"use client";
import dynamic from "next/dynamic";
import { clerkEnabled } from "@/lib/clerk-policy";

const ClerkAuthenticationProvider = dynamic(() => import("./ClerkClient").then(module => module.AuthenticationProvider));
export const ClerkLogin = dynamic(() => import("./ClerkClient").then(module => module.ClerkLogin));
export const ClerkLogout = dynamic(() => import("./ClerkClient").then(module => module.ClerkLogout));

export function AuthenticationProvider({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled()) return <>{children}</>;
  return <ClerkAuthenticationProvider>{children}</ClerkAuthenticationProvider>;
}
