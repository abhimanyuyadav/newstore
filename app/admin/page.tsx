"use client";
import { clerkEnabled } from "@/lib/clerk-policy";
import { ClerkLogin } from "@/components/ClerkAuthentication";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, isAdminLoggedIn } from "@/lib/data";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  return clerkEnabled() ? <ClerkLogin admin /> : <LegacyAdminLogin />;
}
function LegacyAdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const remainingTime = 0;

  useEffect(() => { if (isAdminLoggedIn()) router.replace("/admin/dashboard"); }, [router]);
  async function login(e: React.FormEvent) {
    e.preventDefault(); if (loading) return;
    setLoading(true); setErr("");
    try { await adminLogin(username, pw); router.push("/admin/dashboard"); }
    catch (error) { setErr(error instanceof Error ? error.message : "Unable to sign in"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-playfair)" }}>9<span className="text-[#f97316]">TEEN</span></h1>
          <p className="text-white/40 text-sm mt-2">Website Editor</p>
        </div>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-[#f97316]/10 rounded-xl mx-auto mb-5"><Lock className="w-5 h-5 text-[#f97316]" /></div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Username</label>
              <input 
                id="admin-username"
                value={username} 
                onChange={e => { setUsername(e.target.value); setErr(""); }} 
                required 
                placeholder="Admin username"
                autoComplete="username"
                disabled={remainingTime > 0 || loading}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] placeholder:text-white/30 disabled:opacity-50" 
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input 
                  id="admin-password"
                  type={show ? "text" : "password"} 
                  value={pw} 
                  onChange={e => { setPw(e.target.value); setErr(""); }} 
                  required 
                  placeholder="Admin password"
                  autoComplete="current-password"
                  disabled={remainingTime > 0 || loading}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#f97316] placeholder:text-white/30 disabled:opacity-50" 
                />
                <button 
                  type="button" 
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  onClick={() => setShow(!show)} 
                  disabled={remainingTime > 0 || loading}
                  className="admin-password-toggle absolute right-1 top-1/2 -translate-y-1/2 text-white/40 disabled:opacity-50"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button 
              type="submit" 
              disabled={remainingTime > 0 || loading}
              className="w-full bg-[#f97316] hover:bg-[#ea6c00] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
