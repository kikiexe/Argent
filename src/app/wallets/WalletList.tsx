"use client";

import { useTransition, useState } from "react";
import { deleteWallet, setDefaultWallet } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { Coins01Icon, Trash, Wallet01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { Wallet } from "@/types/database";

interface WalletWithBalance extends Wallet {
  balance: number;
}

export default function WalletList({
  wallets
}: {
  wallets: WalletWithBalance[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus wallet ini?")) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteWallet(id);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  const handleSetDefault = (id: string) => {
    setError(null);
    startTransition(async () => {
      const res = await setDefaultWallet(id);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  const getWalletTypeColor = (type: string) => {
    switch (type) {
      case "CASH":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/10";
      case "BANK":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/10";
      case "E_WALLET":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-500/10";
      case "CREDIT":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/10";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-500/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <h2 className="font-sans text-lg font-black text-ink flex items-center gap-2">
          <HugeiconsIcon icon={Coins01Icon} size={18} strokeWidth={2.2} className="text-indigo-600" />
          <span>My Wallets</span>
        </h2>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: {error}
        </div>
      )}

      {wallets.length === 0 ? (
        <div className="bg-card border border-hairline p-12 text-center rounded-3xl shadow-sm">
          <p className="font-sans text-xs text-body font-semibold italic">No wallets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id} 
              className="bg-card border border-hairline rounded-2xl p-3.5 shadow-sm hover:border-indigo-500/10 transition-all duration-150 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getWalletTypeColor(wallet.type)}`}>
                  <HugeiconsIcon icon={Wallet01Icon} size={14} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="block font-sans text-xs font-bold text-ink leading-tight">
                      {wallet.name}
                    </span>
                    {wallet.is_default && (
                      <span className="text-[7px] font-sans font-black tracking-widest uppercase bg-indigo-500/10 border border-indigo-400/20 text-indigo-600 px-1.5 py-0.5 rounded leading-none">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="block font-sans text-[8px] font-bold text-body uppercase tracking-widest leading-none mt-1">
                    {wallet.type.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-sans text-sm font-extrabold text-ink">
                  {formatCurrency(wallet.balance)}
                </span>
                
                <div className="flex items-center gap-1 shrink-0">
                  {/* Default status selector */}
                  {wallet.is_default ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-amber-500 bg-amber-500/10 border border-amber-500/10" title="Dompet Utama">
                      <HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(wallet.id)}
                      disabled={isPending}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-body hover:bg-canvas-soft transition-colors disabled:opacity-50"
                      title="Jadikan Dompet Utama"
                      aria-label="Set as default wallet"
                    >
                      <HugeiconsIcon icon={StarIcon} size={12} strokeWidth={1.8} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(wallet.id)}
                    disabled={isPending}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-budget-red hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    title="Delete"
                    aria-label="Delete wallet"
                  >
                    <HugeiconsIcon icon={Trash} size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
