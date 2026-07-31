"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowDownLeft01Icon, 
  ArrowUpRight01Icon, 
  Logout01Icon,
  Home01Icon,
  Folder01Icon,
  Receipt,
  UserIcon,
  Analytics01Icon,
  EyeIcon
} from "@hugeicons/core-free-icons";

interface BalanceCardSkeletonProps {
  userName: string;
  userEmail: string;
}

export function BalanceCardSkeleton({ userName, userEmail }: BalanceCardSkeletonProps) {
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
        
        {/* Desktop Header Row */}
        <div className="hidden sm:flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex flex-col items-start">
            <span className="font-sans text-2xl font-black tracking-tight text-white uppercase">
              Pecune
            </span>
            <span className="font-sans text-[8px] font-bold tracking-[0.25em] text-indigo-200 uppercase">
              Ledger
            </span>
          </div>

          <nav className="flex items-center gap-6 font-sans text-xs font-bold tracking-widest uppercase">
            {navLinks.map((link) => (
              <span
                key={link.href}
                className="flex items-center gap-1.5 pb-1 border-b-2 border-transparent text-indigo-200"
              >
                <HugeiconsIcon icon={link.icon} size={14} strokeWidth={1.8} />
                <span>{link.label}</span>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-indigo-100 font-sans text-xs">
              <HugeiconsIcon icon={UserIcon} size={13} strokeWidth={1.8} />
              <span className="font-semibold">{userEmail}</span>
            </div>
            
            <span className="bg-white/10 text-white border border-white/10 px-3.5 py-1.5 rounded-full font-sans font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 opacity-80">
              <HugeiconsIcon icon={Analytics01Icon} size={12} strokeWidth={2} className="text-indigo-200" />
              <span>Statistics</span>
            </span>

            <span className="bg-white/10 text-white border border-white/10 px-3.5 py-1.5 rounded-full font-sans font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 opacity-80">
              <HugeiconsIcon icon={Logout01Icon} size={12} strokeWidth={2} className="text-indigo-200" />
              <span>Sign Out</span>
            </span>
          </div>
        </div>

        {/* Mobile Header Row */}
        <div className="flex sm:hidden items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 text-white border border-white/20 font-bold flex items-center justify-center font-sans text-sm shadow-md uppercase">
              {userName.slice(0, 2)}
            </div>
            <div className="space-y-0.5">
              <span className="block font-sans text-[10px] text-indigo-100 font-semibold uppercase tracking-wider">
                Hi!
              </span>
              <h2 className="font-sans text-base font-bold text-white capitalize leading-none">
                {userName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white opacity-80">
              <HugeiconsIcon icon={Analytics01Icon} size={18} strokeWidth={1.8} />
            </span>
            <span className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white opacity-80">
              <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={2} />
            </span>
          </div>
        </div>

        {/* Balance Area Skeleton */}
        <div className="space-y-1 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] font-bold tracking-widest text-white/90 uppercase">
              Account Balance
            </span>
            <HugeiconsIcon icon={EyeIcon} size={15} strokeWidth={2} className="text-white/60" />
          </div>

          <div className="space-y-1.5">
            <div className="h-9 w-48 bg-white/20 rounded-2xl animate-pulse" />
            <p className="font-sans text-[8px] tracking-[0.25em] text-indigo-100 font-semibold uppercase">
              Personal Ledger Active
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <span className="bg-white/10 border border-white/10 p-3 rounded-full font-sans font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-sm opacity-80">
            <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} strokeWidth={2.2} />
            <span>Add Income</span>
          </span>
          <span className="bg-white/10 border border-white/10 p-3 rounded-full font-sans font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-sm opacity-80">
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2.2} />
            <span>Add Expense</span>
          </span>
        </div>

      </div>
    </header>
  );
}

export function BudgetSectionSkeleton() {
  return (
    <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-36 bg-canvas-soft rounded-lg animate-pulse" />
          <span className="block font-sans text-[10px] text-body font-semibold mt-1">
            Monthly spending target limit
          </span>
        </div>
        <div className="w-8 h-8 bg-canvas-soft rounded-full animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="font-sans text-[10px] text-body font-bold uppercase tracking-wider">Limit</span>
            <div className="h-4 w-28 bg-canvas-soft rounded-lg animate-pulse" />
          </div>
          <div className="flex justify-between items-center py-1 border-t border-hairline">
            <span className="font-sans text-[10px] text-body font-bold uppercase tracking-wider">Spent</span>
            <div className="h-4 w-24 bg-canvas-soft rounded-lg animate-pulse" />
          </div>
          <div className="flex justify-between items-center py-1 border-t border-hairline">
            <span className="font-sans text-[10px] text-body font-bold uppercase tracking-wider">Remaining</span>
            <div className="h-4 w-24 bg-canvas-soft rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full bg-canvas-soft rounded-full h-3 overflow-hidden shadow-inner relative animate-pulse" />
          <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase">
            <div className="h-3 w-16 bg-canvas-soft rounded-lg animate-pulse" />
            <div className="h-3 w-28 bg-canvas-soft rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryBudgetSkeleton() {
  return (
    <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <h3 className="font-sans text-sm font-black text-ink">
            Anggaran Kategori
          </h3>
          <span className="block font-sans text-[10px] text-body font-semibold">
            Batas pengeluaran per kategori bulan ini
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {[1, 2].map((idx) => (
          <div key={idx} className="space-y-2.5 pb-4 border-b border-hairline last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3.5 w-24 bg-canvas-soft rounded-lg animate-pulse" />
                <div className="h-3 w-40 bg-canvas-soft rounded-lg animate-pulse mt-1.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-canvas-soft rounded-full animate-pulse" />
                <div className="w-7 h-7 bg-canvas-soft rounded-full animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-canvas-soft rounded-full h-2.5 overflow-hidden shadow-inner relative animate-pulse" />
              <div className="flex justify-between items-center text-[9px] font-sans font-bold uppercase">
                <div className="h-2.5 w-16 bg-canvas-soft rounded-lg animate-pulse" />
                <div className="h-2.5 w-28 bg-canvas-soft rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-sans text-xs font-bold tracking-widest text-body uppercase">
          Recent Transactions
        </h4>
        <span className="font-sans text-[10px] font-bold tracking-wider text-link uppercase">
          View All
        </span>
      </div>

      <div className="bg-card border border-hairline rounded-3xl p-3 shadow-sm divide-y divide-hairline">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="flex items-center justify-between py-3 px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-canvas-soft animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-canvas-soft rounded-lg animate-pulse" />
                <div className="h-2.5 w-36 bg-canvas-soft rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-3.5 w-16 bg-canvas-soft rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
