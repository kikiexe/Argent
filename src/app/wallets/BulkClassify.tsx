"use client";

import { useState, useTransition } from "react";
import { bulkClassifyTransactions } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDownLeft01Icon, ArrowUpRight01Icon, CheckmarkCircle02Icon, Coins01Icon } from "@hugeicons/core-free-icons";
import { Transaction, Wallet } from "@/types/database";

interface ExtendedTransaction extends Transaction {
  categories: {
    name: string;
    type: "EXPENSE" | "INCOME";
  } | null;
}

export default function BulkClassify({
  unclassifiedTxs,
  wallets
}: {
  unclassifiedTxs: ExtendedTransaction[];
  wallets: Wallet[];
}) {
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [targetWalletId, setTargetWalletId] = useState<string>(() => {
    return wallets.length > 0 ? wallets[0].id : "";
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

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

  const handleToggleSelect = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedTxIds.length === unclassifiedTxs.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(unclassifiedTxs.map((t) => t.id));
    }
  };

  const handleClassify = () => {
    if (selectedTxIds.length === 0) {
      setError("Pilih minimal satu transaksi.");
      return;
    }
    if (!targetWalletId) {
      setError("Pilih wallet tujuan.");
      return;
    }

    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await bulkClassifyTransactions(selectedTxIds, targetWalletId);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setSelectedTxIds([]);
      }
    });
  };

  const totalSumUnclassified = unclassifiedTxs.reduce((sum, tx) => {
    return sum + Number(tx.amount);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-lg font-black text-ink flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} strokeWidth={2.2} className="text-indigo-600" />
            <span>Klasifikasi Transaksi Lama</span>
          </h2>
          <p className="font-serif text-xs text-body mt-1">
            Data transaksi historis sebelum peluncuran Multi-Wallet belum dihubungkan ke rekening/dompet tertentu.
          </p>
        </div>

        {unclassifiedTxs.length > 0 && (
          <div className="bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/10 px-3.5 py-2 rounded-2xl flex flex-col text-right shrink-0">
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Belum Diklasifikasi</span>
            <span className="font-sans text-sm font-black mt-0.5">
              {unclassifiedTxs.length} Transaksi ({formatCurrency(totalSumUnclassified)})
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 text-budget-green border border-emerald-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Transaksi berhasil diklasifikasikan ke wallet pilihan Anda!
        </div>
      )}

      {unclassifiedTxs.length === 0 ? (
        <div className="bg-card border border-hairline p-12 text-center rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} className="text-emerald-500" />
          <p className="font-sans text-xs text-body font-semibold italic">Semua transaksi historis sudah diklasifikasikan dengan rapi!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bulk Action Controls */}
          <div className="bg-card border border-hairline p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="select_all"
                checked={unclassifiedTxs.length > 0 && selectedTxIds.length === unclassifiedTxs.length}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="select_all" className="font-sans font-bold text-xs tracking-wider text-ink cursor-pointer select-none">
                Pilih Semua ({selectedTxIds.length} Terpilih)
              </label>
            </div>

            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <span className="font-sans font-bold text-[10px] tracking-widest text-body uppercase whitespace-nowrap">
                Pindahkan ke:
              </span>
              <div className="relative flex-1 md:flex-none">
                <select
                  disabled={isPending || wallets.length === 0 || selectedTxIds.length === 0}
                  value={targetWalletId}
                  onChange={(e) => setTargetWalletId(e.target.value)}
                  className="appearance-none w-full md:w-[180px] bg-canvas-soft text-ink border border-hairline p-2 pl-3 pr-8 rounded-2xl font-sans text-xs uppercase font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.type})
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body pointer-events-none">
                  <HugeiconsIcon icon={Coins01Icon} size={12} />
                </div>
              </div>

              <button
                onClick={handleClassify}
                disabled={isPending || wallets.length === 0 || selectedTxIds.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs tracking-wider uppercase py-2.5 px-6 rounded-full disabled:opacity-50 transition-colors duration-150 whitespace-nowrap"
              >
                {isPending ? "Memproses..." : "Klasifikasikan"}
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-card border border-hairline rounded-3xl p-3 shadow-sm divide-y divide-hairline max-h-[450px] overflow-y-auto">
            {unclassifiedTxs.map((transaction) => {
              const isIncome = transaction.type === "INCOME";
              const isChecked = selectedTxIds.includes(transaction.id);
              return (
                <div 
                  key={transaction.id} 
                  className={`flex items-center justify-between py-3 px-2 hover:bg-canvas-soft transition-colors duration-150 ${
                    isChecked ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(transaction.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 shrink-0"
                    />
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
                  
                  <div className={`font-sans text-sm font-black whitespace-nowrap pr-2 ${
                    isIncome ? "text-budget-green" : "text-budget-red"
                  }`}>
                    {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
