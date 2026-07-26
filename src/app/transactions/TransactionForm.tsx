"use client";

import { useActionState, useState, useEffect } from "react";
import { createTransaction } from "./actions";
import { Category } from "@/types/database";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Receipt, 
  ArrowDownLeft01Icon, 
  ArrowUpRight01Icon, 
  Folder01Icon, 
  Coins01Icon, 
  Calendar01Icon, 
  NotebookIcon, 
  PlusSignIcon 
} from "@hugeicons/core-free-icons";

export default function TransactionForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createTransaction, null);
  const [selectedType, setSelectedType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  /* Reset category selection when transaction type changes */
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setSelectedCategory(filteredCategories[0].id);
    } else {
      setSelectedCategory("");
    }
  }, [selectedType, categories]);

  /* Get today's date in YYYY-MM-DD local format */
  const todayStr = new Date().toLocaleDateString("sv-SE");

  return (
    <div className="bg-white p-6 rounded-3xl border border-hairline shadow-sm">
      <h3 className="font-sans font-black text-sm text-ink uppercase mb-6 flex items-center gap-1.5">
        <HugeiconsIcon icon={Receipt} size={14} strokeWidth={2.2} className="text-indigo-600" />
        <span>Record Transaction</span>
      </h3>

      <form action={formAction} className="space-y-6">
        <div>
          <span className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Transaction Type
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setSelectedType("EXPENSE")}
              className={`p-3 rounded-2xl font-sans text-xs font-bold tracking-wider uppercase border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                selectedType === "EXPENSE"
                  ? "bg-rose-50 text-budget-red border-rose-200"
                  : "bg-gray-50 text-body border-gray-200 hover:border-gray-300"
              }`}
            >
              <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} strokeWidth={2.2} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setSelectedType("INCOME")}
              className={`p-3 rounded-2xl font-sans text-xs font-bold tracking-wider uppercase border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                selectedType === "INCOME"
                  ? "bg-emerald-50 text-budget-green border-emerald-200"
                  : "bg-gray-50 text-body border-gray-200 hover:border-gray-300"
              }`}
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2.2} />
              <span>Income</span>
            </button>
          </div>
          <input type="hidden" name="type" value={selectedType} />
        </div>

        <div>
          <label htmlFor="category_id" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Category
          </label>
          {filteredCategories.length === 0 ? (
            <div className="text-xs text-body font-sans italic p-4 border border-dashed border-gray-200 bg-gray-50 rounded-2xl">
              No categories found. Please create an {selectedType.toLowerCase()} category first.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={1.8} />
              </div>
              <select
                id="category_id"
                name="category_id"
                required
                disabled={isPending}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50 appearance-none"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Amount (IDR)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <HugeiconsIcon icon={Coins01Icon} size={16} strokeWidth={1.8} />
            </div>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              disabled={isPending}
              placeholder="0.00"
              className="w-full bg-gray-50 text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Transaction Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <HugeiconsIcon icon={Calendar01Icon} size={16} strokeWidth={1.8} />
            </div>
            <input
              id="date"
              name="date"
              type="date"
              required
              disabled={isPending}
              defaultValue={todayStr}
              className="w-full bg-gray-50 text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="note" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Note (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <HugeiconsIcon icon={NotebookIcon} size={16} strokeWidth={1.8} />
            </div>
            <input
              id="note"
              name="note"
              type="text"
              disabled={isPending}
              placeholder="e.g. Weekly groceries"
              className="w-full bg-gray-50 text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
            />
          </div>
        </div>

        {state?.error && (
          <div className="bg-rose-50 text-budget-red border border-rose-100 p-3.5 rounded-2xl text-xs font-sans font-semibold">
            Error: {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || filteredCategories.length === 0}
          className="w-full bg-indigo-600 text-white p-3.5 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2.2} />
          <span>{isPending ? "Recording..." : "Record Transaction"}</span>
        </button>
      </form>
    </div>
  );
}
