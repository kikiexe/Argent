"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Editorial Masthead Header */}
      <header className="border-b border-hairline py-8 px-6 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-normal tracking-[0.2em] text-ink uppercase">
          Argent
        </h1>
        <p className="font-sans text-[10px] md:text-xs font-bold tracking-[0.3em] text-body uppercase mt-2">
          Personal Finance Tracker
        </p>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-canvas-soft border border-hairline p-8 md:p-12 rounded-none">
          <h2 className="font-sans font-bold text-lg tracking-widest text-ink uppercase mb-2">
            Sign In
          </h2>
          <p className="font-serif text-sm text-body leading-relaxed mb-8">
            Access your isolated personal ledger. Accounts are managed exclusively by system administrators.
          </p>

          <form action={formAction} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block font-sans font-bold text-xs tracking-widest text-ink uppercase mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                className="w-full bg-canvas text-ink border border-ink p-3 rounded-none font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block font-sans font-bold text-xs tracking-widest text-ink uppercase mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                className="w-full bg-canvas text-ink border border-ink p-3 rounded-none font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
              />
            </div>

            {state?.error && (
              <div className="border border-ink bg-canvas p-3 rounded-none text-xs font-sans tracking-wide text-ink font-bold uppercase">
                Error: {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-ink text-canvas p-3 rounded-none font-sans font-bold text-sm tracking-widest uppercase hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50"
            >
              {isPending ? "Authenticating..." : "Enter Ledger"}
            </button>
          </form>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-hairline py-6 px-6 text-center bg-canvas">
        <p className="font-sans text-[10px] tracking-widest text-body uppercase">
          Argent &copy; 2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
