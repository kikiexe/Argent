"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteTransaction } from "./actions";
import { Transaction } from "@/types/database";

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
      <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-ink pb-4 gap-4">
        <h2 className="font-display text-2xl font-normal tracking-wide text-ink">
          Transactions Ledger
        </h2>
        
        {/* Month/Year Selector Form */}
        <div className="flex items-center gap-2">
          <select
            value={filterMonth}
            onChange={(e) => handleFilterChange(Number(e.target.value), filterYear)}
            className="bg-canvas text-ink border border-ink p-2 rounded-none font-sans text-xs uppercase font-bold focus:outline-none focus:ring-1 focus:ring-ink"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => handleFilterChange(filterMonth, Number(e.target.value))}
            className="bg-canvas text-ink border border-ink p-2 rounded-none font-sans text-xs uppercase font-bold focus:outline-none focus:ring-1 focus:ring-ink"
          >
            {currentYearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="border border-ink bg-canvas p-3 rounded-none text-xs font-sans tracking-wide text-ink font-bold uppercase">
          Error: {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="border border-hairline p-12 text-center bg-canvas-soft rounded-none">
          <p className="font-serif text-sm text-body italic">No transactions recorded for this period.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink">
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3">Date</th>
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3">Category</th>
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3">Note</th>
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3 text-right">Amount</th>
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-canvas-soft group">
                  <td className="py-4 font-sans text-xs text-body whitespace-nowrap">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-4">
                    <span className="font-serif text-sm font-bold text-ink block">
                      {transaction.categories?.name || "Uncategorized"}
                    </span>
                    <span className="font-sans text-[8px] tracking-wider text-body uppercase">
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 font-serif text-sm text-body">
                    {transaction.note || <span className="italic opacity-40">No note</span>}
                  </td>
                  <td className={`py-4 font-serif text-sm font-bold text-right whitespace-nowrap ${
                    transaction.type === "EXPENSE" ? "text-budget-red" : "text-budget-green"
                  }`}>
                    {transaction.type === "EXPENSE" ? "-" : "+"} {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      disabled={isPending}
                      className="font-sans font-bold text-[10px] tracking-widest text-budget-red hover:underline uppercase disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
