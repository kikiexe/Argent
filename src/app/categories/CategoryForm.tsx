"use client";

import { useActionState, useState, useEffect } from "react";
import { createCategory } from "./actions";
import { createWallet } from "@/app/wallets/actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Tag01Icon, 
  ArrowDownLeft01Icon, 
  ArrowUpRight01Icon, 
  PlusSignIcon, 
  Coins01Icon 
} from "@hugeicons/core-free-icons";

export default function CategoryForm({
  isFlipped,
  setIsFlipped
}: {
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
}) {

  // Category Form State
  const [categoryState, categoryAction, isCategoryPending] = useActionState(createCategory, null);
  const [selectedCatType, setSelectedCatType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // Wallet Form State
  const [walletState, walletAction, isWalletPending] = useActionState(createWallet, null);
  const [selectedWalletType, setSelectedWalletType] = useState<"CASH" | "BANK" | "E_WALLET" | "CREDIT">("CASH");
  const [walletName, setWalletName] = useState("");
  const [isDefaultWallet, setIsDefaultWallet] = useState(false);

  // Auto-reset category name on success
  useEffect(() => {
    if (categoryState?.success) {
      const input = document.getElementById("name") as HTMLInputElement;
      if (input) input.value = "";
    }
  }, [categoryState]);

  // Auto-reset wallet form on success
  useEffect(() => {
    if (walletState?.success) {
      setWalletName("");
      setSelectedWalletType("CASH");
      setIsDefaultWallet(false);
      // Flip back to category form automatically after successful wallet creation
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [walletState]);

  return (
    <div className={`perspective-1000 w-full relative transition-all duration-300 ${isFlipped ? "h-[365px]" : "h-[300px]"}`}>
      <div className={`w-full h-full transition-transform duration-500 preserve-3d relative ${isFlipped ? "rotate-y-180" : ""}`}>
        
        {/* FRONT FACE: New Category Form */}
        <div className="absolute inset-0 backface-hidden bg-card py-5 px-6 rounded-3xl border border-hairline shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
              <h3 className="font-sans font-black text-sm text-ink uppercase flex items-center gap-1.5">
                <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2.2} className="text-indigo-600" />
                <span>New Category</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="text-indigo-600 hover:text-indigo-700 font-sans font-black text-[10px] tracking-widest uppercase flex items-center gap-1 hover:underline transition-all"
              >
                <HugeiconsIcon icon={Coins01Icon} size={12} strokeWidth={2} />
                <span>Tambah Dompet</span>
              </button>
            </div>

            <form action={categoryAction} className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
                  Category Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <HugeiconsIcon icon={Tag01Icon} size={16} strokeWidth={1.8} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={50}
                    disabled={isCategoryPending}
                    placeholder="e.g. Groceries"
                    className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block font-sans font-bold text-[9px] tracking-widest text-body uppercase">
                  Transaction Type
                </span>
                <div className="grid grid-cols-2 gap-1 bg-canvas-soft p-1 rounded-2xl border border-hairline">
                  <button
                    type="button"
                    disabled={isCategoryPending}
                    onClick={() => setSelectedCatType("EXPENSE")}
                    className={`py-2 px-3 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5 ${
                      selectedCatType === "EXPENSE"
                        ? "bg-rose-500/10 text-budget-red border border-rose-500/10 shadow-sm"
                        : "text-body hover:text-ink"
                    }`}
                  >
                    <HugeiconsIcon icon={ArrowDownLeft01Icon} size={13} strokeWidth={2.5} />
                    <span>Expense</span>
                  </button>
                  <button
                    type="button"
                    disabled={isCategoryPending}
                    onClick={() => setSelectedCatType("INCOME")}
                    className={`py-2 px-3 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5 ${
                      selectedCatType === "INCOME"
                        ? "bg-emerald-500/10 text-budget-green border border-emerald-500/10 shadow-sm"
                        : "text-body hover:text-ink"
                    }`}
                  >
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={2.5} />
                    <span>Income</span>
                  </button>
                </div>
                <input type="hidden" name="type" value={selectedCatType} />
              </div>

              {categoryState?.error && (
                <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
                  Error: {categoryState.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isCategoryPending}
                className="w-full bg-indigo-600 text-white p-3.5 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2.2} />
                <span>{isCategoryPending ? "Creating..." : "Add Category"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* BACK FACE: New Wallet Form */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card py-5 px-6 rounded-3xl border border-hairline shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
              <h3 className="font-sans font-black text-sm text-ink uppercase flex items-center gap-1.5">
                <HugeiconsIcon icon={Coins01Icon} size={14} strokeWidth={2.2} className="text-indigo-600" />
                <span>New Wallet</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="text-indigo-600 hover:text-indigo-700 font-sans font-black text-[10px] tracking-widest uppercase flex items-center gap-1 hover:underline transition-all"
              >
                <HugeiconsIcon icon={Tag01Icon} size={12} strokeWidth={2} />
                <span>Tambah Kategori</span>
              </button>
            </div>

            <form action={walletAction} className="space-y-3">
              <div>
                <label htmlFor="wallet_name" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
                  Wallet Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <HugeiconsIcon icon={Coins01Icon} size={16} strokeWidth={1.8} />
                  </div>
                  <input
                    id="wallet_name"
                    name="name"
                    type="text"
                    required
                    maxLength={50}
                    disabled={isWalletPending}
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="e.g. Bank Mandiri, GoPay"
                    className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <span className="block font-sans font-bold text-[9px] tracking-widest text-body uppercase mb-2">
                  Wallet Type
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["CASH", "BANK", "E_WALLET", "CREDIT"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={isWalletPending}
                      onClick={() => setSelectedWalletType(t)}
                      className={`py-2 px-3 rounded-xl font-sans text-xs font-bold tracking-wider uppercase border transition-all duration-150 flex items-center justify-center ${
                        selectedWalletType === t
                          ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-sm"
                          : "bg-canvas-soft text-body border-hairline hover:text-ink"
                      }`}
                    >
                      {t.replace("_", " ")}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="type" value={selectedWalletType} />
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  id="is_default"
                  name="is_default"
                  type="checkbox"
                  value="true"
                  checked={isDefaultWallet}
                  disabled={isWalletPending}
                  onChange={(e) => setIsDefaultWallet(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                />
                <label htmlFor="is_default" className="font-sans font-bold text-xs tracking-wider text-ink cursor-pointer select-none">
                  Set as default wallet
                </label>
              </div>

              {walletState?.error && (
                <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
                  Error: {walletState.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isWalletPending}
                className="w-full bg-indigo-600 text-white p-3.5 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2.2} />
                <span>{isWalletPending ? "Saving..." : "Create Wallet"}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
