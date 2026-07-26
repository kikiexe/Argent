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
    <header className="border-b border-hairline py-4 px-6 bg-white shadow-sm flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col items-start">
        <Link href="/" className="font-sans text-2xl font-black tracking-tight text-indigo-600 uppercase hover:opacity-80 transition-opacity">
          Argent
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
            className="bg-gray-100 text-ink hover:bg-gray-200 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-sans font-bold text-[10px] sm:text-xs tracking-wider uppercase transition-colors duration-150 flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={Logout01Icon} size={12} strokeWidth={2} className="text-gray-500" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
