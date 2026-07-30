"use client";

import { useActionState, useState } from "react";
import { setMonthlyBudget } from "@/app/budgets/actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon, Coins01Icon } from "@hugeicons/core-free-icons";

interface BudgetSectionProps {
  month: number;
  year: number;
  totalLimit: number;
  totalExpense: number;
}

export default function BudgetSection({
  month,
  year,
  totalLimit,
  totalExpense
}: BudgetSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(setMonthlyBudget, null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const monthName = new Date(year, month - 1).toLocaleDateString("id-ID", {
    month: "long"
  });

  const percentage = totalLimit > 0 ? (totalExpense / totalLimit) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);
  
  const isOverbudget = totalExpense > totalLimit;
  const remaining = totalLimit - totalExpense;

  let progressBarColor = "bg-emerald-500";
  if (percentage >= 75 && percentage <= 100) {
    progressBarColor = "bg-amber-500";
  } else if (percentage > 100) {
    progressBarColor = "bg-rose-500";
  }

  const handleFormSuccess = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-sans text-sm font-black text-ink">
              Budget - {monthName} {year}
            </h3>
            <span className="block font-sans text-[10px] text-body font-semibold">
              Monthly spending target limit
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-8 h-8 bg-canvas-soft hover:bg-canvas-soft/80 rounded-full flex items-center justify-center text-gray-500 hover:text-ink transition-colors"
          title="Edit Limit"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={14} strokeWidth={2} />
        </button>
      </div>

      {isEditing ? (
        <form
          action={async (formData) => {
            await formAction(formData);
            handleFormSuccess();
          }}
          className="space-y-4 bg-canvas-soft p-4 rounded-2xl border border-hairline"
        >
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="year" value={year} />
          
          <div className="space-y-2">
            <label htmlFor="total_limit" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase">
              Set Budget Limit (IDR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <HugeiconsIcon icon={Coins01Icon} size={16} strokeWidth={1.8} />
              </div>
              <input
                id="total_limit"
                name="total_limit"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={totalLimit || ""}
                disabled={isPending}
                placeholder="e.g. 5000000"
                className="w-full bg-card text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-xs font-semibold text-budget-red">
              Error: {state.error}
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full font-sans font-bold text-xs text-body hover:bg-canvas-soft transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-sans font-bold text-xs transition-colors"
            >
              {isPending ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {totalLimit === 0 ? (
            <div className="text-center p-4 border border-dashed border-hairline rounded-2xl bg-canvas-soft">
              <p className="font-sans text-xs text-body font-semibold italic">
                No budget limit configured for this month.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-indigo-600 hover:text-indigo-700 font-sans text-xs font-bold uppercase tracking-wider"
              >
                Set Limit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Limit Details List */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1">
                  <span className="font-sans text-[10px] text-body font-bold uppercase tracking-wider">Limit</span>
                  <span className="font-sans text-sm font-black text-ink">{formatCurrency(totalLimit)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-hairline">
                  <span className="font-sans text-[10px] text-body font-bold uppercase tracking-wider">Spent</span>
                  <span className="font-sans text-sm font-black text-ink">{formatCurrency(totalExpense)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-hairline">
                  <span className="font-sans text-[10px] text-body font-bold uppercase tracking-wider">
                    {isOverbudget ? "Limit Exceeded" : "Remaining"}
                  </span>
                  <span className={`font-sans text-sm font-black ${
                    isOverbudget ? "text-budget-red" : "text-budget-green"
                  }`}>
                    {isOverbudget ? formatCurrency(Math.abs(remaining)) : formatCurrency(remaining)}
                  </span>
                </div>
              </div>

              {/* Progress Bar indicator */}
              <div className="space-y-1">
                <div className="w-full bg-canvas-soft rounded-full h-3 overflow-hidden shadow-inner relative">
                  <div
                    className={`h-full ${progressBarColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${clampedPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase">
                  <span className="text-body">{percentage.toFixed(0)}% Consumed</span>
                  <span className={isOverbudget ? "text-budget-red" : "text-body"}>
                    {isOverbudget ? "Limit exceeded!" : "Under budget limit"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
