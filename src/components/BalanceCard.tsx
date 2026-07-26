"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDownLeft01Icon, ArrowUpRight01Icon, EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";

interface BalanceCardProps {
  balance: number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 text-white p-6 rounded-3xl shadow-xl border border-indigo-400/20 relative overflow-hidden">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-bold tracking-widest text-indigo-100 uppercase">
            Account Balance
          </span>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-indigo-100 hover:text-white transition-colors"
          >
            <HugeiconsIcon icon={isVisible ? EyeIcon : EyeOffIcon} size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-sans text-3xl font-black tracking-tight transition-all duration-300">
            {isVisible ? formatCurrency(balance) : "••••••••••••"}
          </h3>
          <p className="font-sans text-[10px] tracking-wider text-indigo-100/70 font-semibold uppercase">
            Personal Ledger Active
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/transactions?type=INCOME"
            className="bg-white/10 hover:bg-white/15 border border-white/10 p-3 rounded-2xl font-sans font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} strokeWidth={2.2} />
            <span>Add Income</span>
          </Link>
          <Link
            href="/transactions?type=EXPENSE"
            className="bg-white/10 hover:bg-white/15 border border-white/10 p-3 rounded-2xl font-sans font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2.2} />
            <span>Send Money</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
