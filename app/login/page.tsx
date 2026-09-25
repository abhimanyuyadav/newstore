"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loginUser, registerUser, getCurrentUser } from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "", address: "", city: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [busy, setBusy] = useState(false);
  useEffect(() => { if (getCurrentUser()) router.replace("/account"); }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); if (busy) return; setBusy(true); setError("");
    try { await loginUser(loginEmail, loginPassword); router.push("/account"); }
    catch(e) { setError(e instanceof Error ? e.message : "Sign-in failed"); }
    finally { setBusy(false); }
  }
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); if (busy) return; setBusy(true); setError("");
    try { await registerUser(registerForm); router.push("/account"); }
    catch(e) { setError(e instanceof Error ? e.message : "Registration failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Account</h1>
            <p className="text-gray-700">Sign in to manage your profile and orders.</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-black hover:underline">Back to home</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleLogin} className="rounded-sm border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Existing user</p>
                <h2 className="text-2xl font-bold mt-2">Login</h2>
              </div>
              <button type="button" onClick={() => setMode("register")} className="text-sm text-black font-semibold">Create account</button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-gray-600">
                Email
                <input type="email" autoComplete="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <label className="block text-sm text-gray-600">
                Password
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <button disabled={busy} type="submit" className="w-full rounded-sm bg-black px-4 py-3 text-sm font-semibold text-white">Login</button>
            </div>
          </form>

          <form onSubmit={handleRegister} className="rounded-sm border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-gray-400">New customer</p>
                <h2 className="text-2xl font-bold mt-2">Register</h2>
              </div>
              <button type="button" onClick={() => setMode("login")} className="text-sm text-black font-semibold">Login instead</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-gray-600 md:col-span-2">
                Full name
                <input value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <label className="block text-sm text-gray-600">
                Email
                <input type="email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <label className="block text-sm text-gray-600">
                Phone
                <input value={registerForm.phone} onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <label className="block text-sm text-gray-600">
                Password
                <input type="password" minLength={8} maxLength={128} autoComplete="new-password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <label className="block text-sm text-gray-600">
                City
                <input value={registerForm.city} onChange={e => setRegisterForm({ ...registerForm, city: e.target.value })} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <label className="block text-sm text-gray-600 md:col-span-2">
                Address
                <textarea rows={3} value={registerForm.address} onChange={e => setRegisterForm({ ...registerForm, address: e.target.value })} className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-3 py-3" required />
              </label>
              <button disabled={busy} type="submit" className="md:col-span-2 w-full rounded-sm bg-black px-4 py-3 text-sm font-semibold text-white">Create Account</button>
            </div>
          </form>
        </div>

        {error && <p className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {success && <p className="mt-4 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}
      </div>
    </div>
  );
}
