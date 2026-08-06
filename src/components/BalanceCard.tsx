"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { Transaction, Wallet } from "@/types/database";
import BalanceChart from "./BalanceChart";
import { FluentEmoji } from "@lobehub/fluent-emoji";
import { 
  ArrowDownLeft01Icon, 
  ArrowUpRight01Icon, 
  EyeIcon, 
  EyeOffIcon,
  Logout01Icon,
  Home01Icon,
  Folder01Icon,
  Receipt,
  UserIcon,
  Analytics01Icon,
  Wallet01Icon
} from "@hugeicons/core-free-icons";

interface BalanceCardProps {
  balance: number;
  userName: string;
  userEmail: string;
  transactions: (Transaction & { categories: { name: string; type: "EXPENSE" | "INCOME" } | null })[];
  avatarEmoji?: string;
  wallets?: (Wallet & { balance: number })[];
}

export default function BalanceCard({ balance, userName, userEmail, transactions, avatarEmoji, wallets = [] }: BalanceCardProps) {
  const [view, setView] = useState<"balance" | "statistics" | "wallets">("balance");
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
    return formatted.replace("Rp", "Rp ");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home01Icon },
    { href: "/categories", label: "Categories", icon: Folder01Icon },
    { href: "/transactions", label: "Transactions", icon: Receipt }
  ];

  return (
    <header className="w-full bg-gradient-to-b from-[#4f46e5] to-[#3b82f6] text-white rounded-b-[32px] shadow-lg relative overflow-hidden pt-14 sm:pt-6 pb-8 px-6">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10">
        
        {/* Desktop Header Row (Hidden on Mobile) */}
        <div className="hidden sm:flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex flex-col items-start">
            <Link href="/dashboard" className="font-sans text-2xl font-black tracking-tight text-white uppercase hover:opacity-80 transition-opacity">
              Pecune
            </Link>
            <span className="font-sans text-[8px] font-bold tracking-[0.25em] text-indigo-200 uppercase">
              Ledger
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 font-sans text-xs font-bold tracking-widest uppercase">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all duration-150 ${
                    isActive
                      ? "text-white border-white font-bold"
                      : "text-indigo-200 border-transparent hover:text-white hover:border-indigo-100"
                  }`}
                >
                  <HugeiconsIcon icon={link.icon} size={14} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile, Switch & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-indigo-100 font-sans text-xs">
              <HugeiconsIcon icon={UserIcon} size={13} strokeWidth={1.8} />
              <span className="font-semibold">{userEmail}</span>
            </div>
            
            {/* Desktop View Switcher Group */}
            <div className="flex bg-white/10 p-0.5 rounded-full border border-white/10">
              <button
                onClick={() => setView("balance")}
                className={`px-3 py-1 rounded-full font-sans font-bold text-[9px] tracking-wider uppercase transition-all duration-150 flex items-center gap-1 ${
                  view === "balance" ? "bg-white text-indigo-600 shadow-sm" : "text-white hover:bg-white/10"
                }`}
              >
                <span>Balance</span>
              </button>
              <button
                onClick={() => setView("statistics")}
                className={`px-3 py-1 rounded-full font-sans font-bold text-[9px] tracking-wider uppercase transition-all duration-150 flex items-center gap-1 ${
                  view === "statistics" ? "bg-white text-indigo-600 shadow-sm" : "text-white hover:bg-white/10"
                }`}
              >
                <span>Stats</span>
              </button>
              <button
                onClick={() => setView("wallets")}
                className={`px-3 py-1 rounded-full font-sans font-bold text-[9px] tracking-wider uppercase transition-all duration-150 flex items-center gap-1 ${
                  view === "wallets" ? "bg-white text-indigo-600 shadow-sm" : "text-white hover:bg-white/10"
                }`}
              >
                <span>Wallets</span>
              </button>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="bg-white/10 text-white hover:bg-white/20 border border-white/10 px-3.5 py-1.5 rounded-full font-sans font-bold text-[10px] tracking-wider uppercase transition-colors duration-150 flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={Logout01Icon} size={12} strokeWidth={2} className="text-indigo-200" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Header Row (Hidden on Desktop) */}
        <div className="flex sm:hidden items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Initials or 3D Emoji Avatar */}
            {avatarEmoji ? (
              <div className="w-12 h-12 rounded-full bg-white/20 border border-white/20 flex items-center justify-center shadow-md">
                <FluentEmoji emoji={avatarEmoji} type="3d" size={32} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 text-white border border-white/20 font-bold flex items-center justify-center font-sans text-sm shadow-md uppercase">
                {userName.slice(0, 2)}
              </div>
            )}
            
            <div className="space-y-0.5">
              {view === "balance" ? (
                <>
                  <span className="block font-sans text-[10px] text-indigo-100 font-semibold uppercase tracking-wider">
                    Hi!
                  </span>
                  <h2 className="font-sans text-base font-bold text-white capitalize leading-none">
                    {userName}
                  </h2>
                </>
              ) : view === "statistics" ? (
                <>
                  <span className="block font-sans text-[10px] text-indigo-100 font-semibold uppercase tracking-wider">
                    Overview
                  </span>
                  <h2 className="font-sans text-base font-bold text-white capitalize leading-none">
                    Statistics
                  </h2>
                </>
              ) : (
                <>
                  <span className="block font-sans text-[10px] text-indigo-100 font-semibold uppercase tracking-wider">
                    Aset &amp; Rekening
                  </span>
                  <h2 className="font-sans text-base font-bold text-white capitalize leading-none">
                    Multi Wallet
                  </h2>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show different navigation buttons based on current view */}
            {view === "balance" ? (
              <>
                {/* Go to Statistics */}
                <button 
                  onClick={() => setView("statistics")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                  title="Statistik"
                  aria-label="Statistik"
                >
                  <HugeiconsIcon icon={Analytics01Icon} size={18} strokeWidth={1.8} />
                </button>
                {/* Go to Wallets */}
                <button 
                  onClick={() => setView("wallets")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                  title="Dompet"
                  aria-label="Dompet"
                >
                  <HugeiconsIcon icon={Wallet01Icon} size={18} strokeWidth={1.8} />
                </button>
              </>
            ) : view === "statistics" ? (
              <>
                {/* Go to Balance */}
                <button 
                  onClick={() => setView("balance")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                  title="Dashboard"
                  aria-label="Dashboard"
                >
                  <HugeiconsIcon icon={Home01Icon} size={18} strokeWidth={1.8} />
                </button>
                {/* Go to Wallets */}
                <button 
                  onClick={() => setView("wallets")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                  title="Dompet"
                  aria-label="Dompet"
                >
                  <HugeiconsIcon icon={Wallet01Icon} size={18} strokeWidth={1.8} />
                </button>
              </>
            ) : (
              <>
                {/* Go to Balance */}
                <button 
                  onClick={() => setView("balance")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                  title="Dashboard"
                  aria-label="Dashboard"
                >
                  <HugeiconsIcon icon={Home01Icon} size={18} strokeWidth={1.8} />
                </button>
                {/* Go to Statistics */}
                <button 
                  onClick={() => setView("statistics")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                  title="Statistik"
                  aria-label="Statistik"
                >
                  <HugeiconsIcon icon={Analytics01Icon} size={18} strokeWidth={1.8} />
                </button>
              </>
            )}
            
            {/* Sign Out Shortcut */}
            <form action={logout}>
              <button 
                type="submit" 
                className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-sm" 
                title="Sign Out"
                aria-label="Sign Out"
              >
                <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic Card Content Area */}
        {view === "balance" ? (
          <>
            {/* Balance details */}
            <div className="space-y-1 mb-5">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-bold tracking-widest text-white/90 uppercase">
                  Account Balance
                </span>
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label={isVisible ? "Hide balance" : "Show balance"}
                >
                  <HugeiconsIcon icon={isVisible ? EyeIcon : EyeOffIcon} size={15} strokeWidth={2} />
                </button>

              </div>

              <div className="space-y-0.5">
                <h3 className="font-sans text-3xl font-extrabold tracking-tight transition-all duration-300">
                  {isVisible ? formatCurrency(balance) : "••••••••••••"}
                </h3>
                <p className="font-sans text-[8px] tracking-[0.25em] text-indigo-100 font-semibold uppercase">
                  Personal Ledger Active
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href="/transactions?type=INCOME"
                prefetch={false}
                className="bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-full font-sans font-bold text-xs tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} strokeWidth={2.2} />
                <span>Add Income</span>
              </Link>
              <Link
                href="/transactions?type=EXPENSE"
                prefetch={false}
                className="bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-full font-sans font-bold text-xs tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2.2} />
                <span>Add Expense</span>
              </Link>
            </div>
          </>
        ) : view === "statistics" ? (
          /* Statistics Card Body */
          <BalanceChart transactions={transactions} />
        ) : (
          /* Wallets Card Body */
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
            {wallets && wallets.length > 0 ? (
              wallets.map((w) => (
                <div key={w.id} className="flex items-center justify-between bg-white/10 hover:bg-white/15 border border-white/10 p-3 rounded-2xl transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                      <HugeiconsIcon icon={Wallet01Icon} size={14} strokeWidth={2} />
                    </div>
                    <div className="text-left">
                      <span className="block font-sans text-xs font-bold text-white capitalize leading-snug">
                        {w.name}
                      </span>
                      <span className="block font-sans text-[8px] font-bold text-indigo-200 uppercase tracking-widest leading-none mt-0.5">
                        {w.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {w.is_default && (
                      <span className="text-[7px] font-sans font-black tracking-widest uppercase bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                    <span className="font-sans text-sm font-extrabold text-white">
                      {formatCurrency(w.balance || 0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center font-sans text-xs text-indigo-200 py-6">
                Tidak ada dompet ditemukan.
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
