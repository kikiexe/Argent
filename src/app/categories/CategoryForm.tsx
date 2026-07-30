"use client";

import { useActionState, useState } from "react";
import { createCategory } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tag01Icon, ArrowDownLeft01Icon, ArrowUpRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

export default function CategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, null);
  const [selectedType, setSelectedType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  return (
    <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm">
      <h3 className="font-sans font-black text-sm text-ink uppercase mb-6 flex items-center gap-1.5">
        <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2.2} className="text-indigo-600" />
        <span>New Category</span>
      </h3>

      <form action={formAction} className="space-y-6">
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
              disabled={isPending}
              placeholder="e.g. Groceries"
              className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
            />
          </div>
        </div>

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
                  ? "bg-rose-500/10 text-budget-red border-rose-500/20"
                  : "bg-canvas-soft text-body border-hairline hover:border-body"
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
                  ? "bg-emerald-500/10 text-budget-green border-emerald-500/20"
                  : "bg-canvas-soft text-body border-hairline hover:border-body"
              }`}
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2.2} />
              <span>Income</span>
            </button>
          </div>
          <input type="hidden" name="type" value={selectedType} />
        </div>

        {state?.error && (
          <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
            Error: {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 text-white p-3.5 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2.2} />
          <span>{isPending ? "Creating..." : "Add Category"}</span>
        </button>
      </form>
    </div>
  );
}
