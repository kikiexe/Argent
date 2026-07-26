"use client";

import { useActionState, useState } from "react";
import { createCategory } from "./actions";

export default function CategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, null);
  const [selectedType, setSelectedType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  return (
    <div className="border border-hairline p-6 bg-canvas-soft rounded-none">
      <h3 className="font-sans font-bold text-xs tracking-widest text-ink uppercase mb-6">
        New Category
      </h3>

      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="name" className="block font-sans font-bold text-[10px] tracking-widest text-ink uppercase mb-2">
            Category Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={isPending}
            placeholder="e.g. Groceries"
            className="w-full bg-canvas text-ink border border-ink p-3 rounded-none font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
          />
        </div>

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

        {state?.error && (
          <div className="border border-ink bg-canvas p-3 rounded-none text-xs font-sans tracking-wide text-ink font-bold uppercase">
            Error: {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-ink text-canvas p-3 rounded-none font-sans font-bold text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}
