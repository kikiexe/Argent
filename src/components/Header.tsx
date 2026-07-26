import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/actions";
import Link from "next/link";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-hairline py-4 px-6 bg-canvas flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-col items-center sm:items-start">
        <Link href="/" className="font-display text-2xl font-normal tracking-[0.1em] text-ink uppercase hover:opacity-80 transition-opacity">
          Argent
        </Link>
        <span className="font-sans text-[8px] font-bold tracking-[0.2em] text-body uppercase">
          Ledger
        </span>
      </div>
      
      <nav className="flex items-center gap-6 font-sans text-xs font-bold tracking-widest uppercase">
        <Link href="/" className="hover:text-body transition-colors">Dashboard</Link>
        <Link href="/categories" className="hover:text-body transition-colors">Categories</Link>
        <Link href="/transactions" className="hover:text-body transition-colors">Transactions</Link>
      </nav>

      <div className="flex items-center gap-4">
        <span className="font-sans text-xs text-body font-medium hidden md:inline">{user?.email}</span>
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
  );
}
