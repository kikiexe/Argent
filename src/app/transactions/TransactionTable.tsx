"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteTransaction } from "./actions";
import { Transaction } from "@/types/database";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Receipt,
  Trash, 
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  FilterIcon,
  ChevronDownIcon
} from "@hugeicons/core-free-icons";

interface ExtendedTransaction extends Transaction {
  categories: {
    id: string;
    name: string;
    type: "EXPENSE" | "INCOME";
  } | null;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

export default function TransactionTable({
  transactions,
  currentMonth,
  currentYear
}: {
  transactions: ExtendedTransaction[];
  currentMonth: number;
  currentYear: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);

  const handleFilterChange = (m: number, y: number) => {
    setFilterMonth(m);
    setFilterYear(y);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(m));
    params.set("year", String(y));
    router.push(`/transactions?${params.toString()}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteTransaction(id);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const currentYearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      {/* Header and Filter Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-4 gap-4">
        <h2 className="font-sans text-lg font-black text-ink flex items-center gap-2">
          <HugeiconsIcon icon={Receipt} size={18} strokeWidth={2.2} className="text-indigo-600" />
          <span>Transactions Ledger</span>
        </h2>
        
        {/* Month/Year Selector Form */}
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FilterIcon} size={14} className="text-gray-400" />
          
          <div className="relative">
            <select
              value={filterMonth}
              onChange={(e) => handleFilterChange(Number(e.target.value), filterYear)}
              aria-label="Filter Month"
              className="appearance-none bg-card text-ink border border-hairline p-2 pl-3 pr-8 rounded-2xl font-sans text-xs uppercase font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <HugeiconsIcon icon={ChevronDownIcon} size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterYear}
              onChange={(e) => handleFilterChange(filterMonth, Number(e.target.value))}
              aria-label="Filter Year"
              className="appearance-none bg-card text-ink border border-hairline p-2 pl-3 pr-8 rounded-2xl font-sans text-xs uppercase font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
            >
              {currentYearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <HugeiconsIcon icon={ChevronDownIcon} size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="bg-card border border-hairline p-12 text-center rounded-3xl shadow-sm">
          <p className="font-sans text-xs text-body font-semibold italic">No transactions recorded for this period.</p>
        </div>
      ) : (
        <div className="bg-card border border-hairline rounded-3xl p-3 shadow-sm divide-y divide-hairline">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "INCOME";
            return (
              <div key={transaction.id} className="flex items-center justify-between py-3.5 px-2 hover:bg-canvas-soft transition-colors duration-150">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                    isIncome 
                      ? "bg-emerald-100 dark:bg-emerald-950 text-budget-green" 
                      : "bg-rose-100 dark:bg-rose-950 text-budget-red"
                  }`}>
                    <HugeiconsIcon 
                      icon={isIncome ? ArrowDownLeft01Icon : ArrowUpRight01Icon} 
                      size={14} 
                      strokeWidth={2.5} 
                    />
                  </div>
                  <div>
                    <span className="block font-sans text-xs font-black text-ink">
                      {transaction.categories?.name || "Uncategorized"}
                    </span>
                    <span className="block font-sans text-[10px] text-body font-semibold">
                      {formatDate(transaction.date)} {transaction.note && `• ${transaction.note}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`font-sans text-sm font-black whitespace-nowrap ${
                    isIncome ? "text-budget-green" : "text-budget-red"
                  }`}>
                    {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                  </div>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    disabled={isPending}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-budget-red hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <HugeiconsIcon icon={Trash} size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
