"use client";
// Loaded only when a Clerk feature is rendered.
import { ClerkProvider, SignIn, useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { clerkEnabled } from "@/lib/clerk-policy";

function SessionReady({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const pathname = usePathname();
  const publicPage = ["/", "/products", "/about", "/lookbook"].includes(pathname) || /^\/product\/[^/]+$/.test(pathname);
  if (!isLoaded && !publicPage) return <div className="min-h-screen grid place-items-center" role="status">Loading secure sign-in…</div>;
  return <div key={userId || "guest"}>{children}</div>;
}
export function AuthenticationProvider({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled()) return <>{children}</>;
  return <ClerkProvider appearance={{ variables: { colorPrimary: "#171717", colorBackground: "#ffffff", borderRadius: "0.75rem" } }}><SessionReady>{children}</SessionReady></ClerkProvider>;
}

export function ClerkLogin({ admin = false }: { admin?: boolean }) {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [error, setError] = useState("");
  const destination = admin ? "/admin/dashboard" : "/account";
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    fetch(admin ? "/api/auth/admin" : "/api/auth/customer", { cache: "no-store" }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to confirm access");
      if (admin ? data.authenticated : data?.id) window.location.assign(destination);
      else if (active) setError(admin ? "This Google account does not have permission to manage the store. Sign in with your administrator account." : "Verify your email address to finish signing in.");
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [isLoaded, isSignedIn, admin, destination]);
  return <main className="min-h-screen bg-[#faf9f6] text-neutral-900 grid place-items-center p-6"><section className="w-full max-w-md text-center"><h1 className="text-3xl font-bold mb-2">{admin ? "9TEEN Admin" : "Welcome to 9TEEN"}</h1><p className="text-sm text-neutral-600 mb-8">{admin ? "Secure access for your store team." : "Sign in to view your profile and orders."}</p>{!isLoaded ? <p role="status">Loading sign-in…</p> : isSignedIn ? <div className="rounded-xl bg-white p-6 border"><p role={error ? "alert" : "status"}>{error || "Checking your account…"}</p>{error && <button onClick={() => void signOut({ redirectUrl: admin ? "/admin" : "/login" })} className="mt-4 underline">Use another account</button>}</div> : <div className="flex justify-center"><SignIn routing="hash" withSignUp forceRedirectUrl={admin ? "/admin" : "/login"} signUpForceRedirectUrl={admin ? "/admin" : "/login"} /></div>}</section></main>;
}

export function ClerkLogout({ children, className, redirectUrl }: { children: React.ReactNode; className?: string; redirectUrl: string }) {
  const { signOut } = useClerk();
  const [error, setError] = useState("");
  return <><button className={className} onClick={() => void signOut({ redirectUrl }).catch(() => setError("Unable to sign out. Please retry."))}>{children}</button>{error && <span role="alert">{error}</span>}</>;
}
