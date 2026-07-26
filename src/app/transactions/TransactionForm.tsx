"use client";

import { useActionState, useState, useEffect } from "react";
import { createTransaction } from "./actions";
import { Category } from "@/types/database";

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
    <div className="border border-hairline p-6 bg-canvas-soft rounded-none">
      <h3 className="font-sans font-bold text-xs tracking-widest text-ink uppercase mb-6">
        Record Transaction
      </h3>

      <form action={formAction} className="space-y-6">
        <div>
          <span className="block font-sans font-bold text-[10px] tracking-widest text-ink uppercase mb-2">
            Transaction Type
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setSelectedType("EXPENSE")}
              className={`p-3 rounded-none font-sans text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${
                selectedType === "EXPENSE"
                  ? "bg-ink text-canvas border border-ink"
                  : "bg-canvas text-ink border border-hairline hover:border-ink"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setSelectedType("INCOME")}
              className={`p-3 rounded-none font-sans text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${
                selectedType === "INCOME"
                  ? "bg-ink text-canvas border border-ink"
                  : "bg-canvas text-ink border border-hairline hover:border-ink"
              }`}
            >
              Income
            </button>
          </div>
          <input type="hidden" name="type" value={selectedType} />
        </div>

        <div>
          <label htmlFor="category_id" className="block font-sans font-bold text-[10px] tracking-widest text-ink uppercase mb-2">
            Category
          </label>
          {filteredCategories.length === 0 ? (
            <div className="text-xs text-body font-serif italic p-3 border border-dashed border-hairline bg-canvas">
              No categories found. Please create an {selectedType.toLowerCase()} category first.
            </div>
          ) : (
            <select
              id="category_id"
              name="category_id"
              required
              disabled={isPending}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-canvas text-ink border border-ink p-3 rounded-none font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block font-sans font-bold text-[10px] tracking-widest text-ink uppercase mb-2">
            Amount (IDR)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            disabled={isPending}
            placeholder="0.00"
            className="w-full bg-canvas text-ink border border-ink p-3 rounded-none font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="date" className="block font-sans font-bold text-[10px] tracking-widest text-ink uppercase mb-2">
            Transaction Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            disabled={isPending}
            defaultValue={todayStr}
            className="w-full bg-canvas text-ink border border-ink p-3 rounded-none font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="note" className="block font-sans font-bold text-[10px] tracking-widest text-ink uppercase mb-2">
            Note (Optional)
          </label>
          <input
            id="note"
            name="note"
            type="text"
            disabled={isPending}
            placeholder="e.g. Weekly groceries"
            className="w-full bg-canvas text-ink border border-ink p-3 rounded-none font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
          />
        </div>

        {state?.error && (
          <div className="border border-ink bg-canvas p-3 rounded-none text-xs font-sans tracking-wide text-ink font-bold uppercase">
            Error: {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || filteredCategories.length === 0}
          className="w-full bg-ink text-canvas p-3 rounded-none font-sans font-bold text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50"
        >
          {isPending ? "Recording..." : "Record Transaction"}
        </button>
      </form>
    </div>
  );
}
