"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, LockIcon, Logout01Icon, EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Modern Centered Header */}
      <header className="py-12 px-6 text-center">
        <h1 className="font-sans text-4xl md:text-5xl font-black tracking-tight text-indigo-600 uppercase">
          Pecune
        </h1>
        <p className="font-sans text-[10px] md:text-xs font-bold tracking-[0.25em] text-body uppercase mt-2">
          Personal Finance Tracker
        </p>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-grow flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-card border border-hairline p-8 md:p-10 rounded-3xl shadow-lg">
          <h2 className="font-sans font-black text-lg text-ink uppercase mb-2">
            Sign In
          </h2>
          <p className="font-sans text-xs text-body leading-relaxed mb-6 font-semibold">
            Access your isolated personal ledger. Accounts are managed exclusively by system administrators.
          </p>

          <form action={formAction} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.8} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isPending}
                  className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <HugeiconsIcon icon={LockIcon} size={16} strokeWidth={1.8} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isPending}
                  className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 pr-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-ink transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <HugeiconsIcon icon={showPassword ? EyeIcon : EyeOffIcon} size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
                Error: {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 text-white p-3.5 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={2} />
              <span>{isPending ? "Authenticating..." : "Enter Ledger"}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
