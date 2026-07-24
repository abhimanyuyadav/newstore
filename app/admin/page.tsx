"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, getSiteSettings, isAdminLoggedIn } from "@/lib/data";
import { Lock, Eye, EyeOff } from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Check if already logged in
    if (isAdminLoggedIn()) {
      router.replace("/admin/dashboard");
      return;
    }

    // Check for account lockout
    const lockoutData = localStorage.getItem("admin_lockout");
    if (lockoutData) {
      try {
        const { timestamp, attempts } = JSON.parse(lockoutData);
        const now = Date.now();
        const elapsed = now - timestamp;

        if (elapsed < LOCKOUT_TIME) {
          setRemainingTime(Math.ceil((LOCKOUT_TIME - elapsed) / 1000));
          setErr(`Too many failed attempts. Try again in ${Math.ceil((LOCKOUT_TIME - elapsed) / 1000)} seconds.`);
        } else {
          localStorage.removeItem("admin_lockout");
          localStorage.removeItem("admin_attempts");
        }
      } catch {
        localStorage.removeItem("admin_lockout");
      }
    }
  }, [router]);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const timer = setInterval(() => {
      setRemainingTime(t => {
        if (t <= 1) {
          clearInterval(timer);
          setErr("");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    
    if (!username || !pw) {
      setErr("Username and password required");
      return;
    }

    if (remainingTime > 0) {
      setErr("Account temporarily locked");
      return;
    }

    const settings = getSiteSettings();
    
    // Validate credentials are configured
    if (!settings.adminUsername || !settings.adminPassword) {
      setErr("Admin credentials not configured");
      return;
    }

    setLoading(true);

    // Check attempts
    const attemptsData = localStorage.getItem("admin_attempts");
    let attempts = attemptsData ? parseInt(attemptsData) : 0;

    if (adminLogin(username, pw)) {
      // Clear lockout on success
      localStorage.removeItem("admin_lockout");
      localStorage.removeItem("admin_attempts");
      
      // Set secure admin session cookie
      document.cookie = "admin_session=1; path=/; max-age=86400; secure; samesite=strict";
      
      setErr("");
      router.push("/admin/dashboard");
    } else {
      attempts++;
      localStorage.setItem("admin_attempts", String(attempts));

      if (attempts >= MAX_ATTEMPTS) {
        const lockout = {
          timestamp: Date.now(),
          attempts,
        };
        localStorage.setItem("admin_lockout", JSON.stringify(lockout));
        setRemainingTime(Math.ceil(LOCKOUT_TIME / 1000));
        setErr("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        setErr(`Incorrect credentials. ${MAX_ATTEMPTS - attempts} attempts remaining.`);
      }
    }

    setLoading(false);
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
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Username</label>
              <input 
                value={username} 
                onChange={e => { setUsername(e.target.value); setErr(""); }} 
                required 
                placeholder="Admin username"
                autoComplete="off"
                disabled={remainingTime > 0 || loading}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] placeholder:text-white/30 disabled:opacity-50" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={show ? "text" : "password"} 
                  value={pw} 
                  onChange={e => { setPw(e.target.value); setErr(""); }} 
                  required 
                  placeholder="Admin password"
                  autoComplete="off"
                  disabled={remainingTime > 0 || loading}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#f97316] placeholder:text-white/30 disabled:opacity-50" 
                />
                <button 
                  type="button" 
                  onClick={() => setShow(!show)} 
                  disabled={remainingTime > 0 || loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 disabled:opacity-50"
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
