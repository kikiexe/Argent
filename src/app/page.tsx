import { createClient } from "@/utils/supabase/server";
import { logout } from "./actions";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Editorial Masthead */}
      <header className="border-b border-hairline py-4 px-6 bg-canvas flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-normal tracking-[0.1em] text-ink uppercase">
            Argent
          </h1>
          <span className="font-sans text-[8px] font-bold tracking-[0.2em] text-body uppercase">
            Ledger
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs text-body font-medium">{user?.email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="bg-ink text-canvas border border-ink px-4 py-2 rounded-none font-sans font-bold text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors duration-200"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="border border-hairline p-8 md:p-12 rounded-none bg-canvas">
          <span className="font-sans font-bold text-xs tracking-widest text-ink uppercase block mb-2">
            System Diagnostics
          </span>
          <h2 className="font-display text-3xl font-normal tracking-wide text-ink mb-6">
            Authentication Verified
          </h2>
          <div className="font-serif text-sm text-body leading-relaxed space-y-4">
            <p>
              The Next.js App Router successfully resolved your session via `@supabase/ssr` cookies. 
              The transaction and category ledger is currently locked under development.
            </p>
            <div className="bg-canvas-soft p-6 border border-hairline rounded-none font-mono text-xs text-ink space-y-2 mt-6">
              <div>USER_ID: {user?.id}</div>
              <div>EMAIL: {user?.email}</div>
              <div>ROLE: {user?.role || "authenticated"}</div>
              <div>SESSION_REFRESH: VALID</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-6 px-6 text-center bg-canvas">
        <p className="font-sans text-[10px] tracking-widest text-body uppercase">
          Argent &copy; 2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
