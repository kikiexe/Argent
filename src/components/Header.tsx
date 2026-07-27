import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/actions";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Logout01Icon } from "@hugeicons/core-free-icons";
import Navigation from "./Navigation";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-hairline pt-[calc(1rem+env(safe-area-inset-top))] pb-4 px-6 bg-card shadow-sm flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col items-start">
        <Link href="/" className="font-sans text-2xl font-black tracking-tight text-indigo-600 uppercase hover:opacity-80 transition-opacity">
          Pecune
        </Link>
        <span className="font-sans text-[8px] font-bold tracking-[0.25em] text-body uppercase">
          Ledger
        </span>
      </div>
      
      <Navigation />

      <div className="flex items-center gap-4">
        <div className="items-center gap-1.5 text-body font-sans text-xs hidden md:flex">
          <HugeiconsIcon icon={UserIcon} size={13} strokeWidth={1.8} />
          <span className="font-semibold text-ink-soft">{user?.email}</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-canvas-soft hover:bg-canvas-soft/80 rounded-full flex items-center justify-center text-ink transition-all shadow-sm"
            title="Sign Out"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={2} className="text-body" />
          </button>
        </form>
      </div>
    </header>
  );
}
