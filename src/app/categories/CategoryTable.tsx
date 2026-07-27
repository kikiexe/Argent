"use client";

import { useState, useTransition } from "react";
import { deleteCategory } from "./actions";
import { Category } from "@/types/database";
import { HugeiconsIcon } from "@hugeicons/react";
import { Trash, ArrowDownLeft01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

export default function CategoryTable({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-hairline pb-4">
        <h2 className="font-sans text-lg font-black text-ink">
          Categories List
        </h2>
        <span className="font-sans text-[10px] text-body font-bold tracking-widest uppercase mt-1 sm:mt-0">
          {categories.length} Categories Registered
        </span>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-card border border-hairline p-12 text-center rounded-3xl shadow-sm">
          <p className="font-sans text-xs text-body font-semibold italic">No categories created yet. Use the form to create one.</p>
        </div>
      ) : (
        <div className="bg-card border border-hairline rounded-3xl p-3 shadow-sm divide-y divide-hairline">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between py-3.5 px-2 hover:bg-canvas-soft transition-colors duration-150">
              <div className="flex items-center gap-3">
                <span className="font-sans text-sm font-black text-ink">{category.name}</span>
                <span
                  className={`inline-flex items-center gap-1 font-sans font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                    category.type === "EXPENSE"
                      ? "border-rose-500/20 text-budget-red bg-rose-500/10"
                      : "border-emerald-500/20 text-budget-green bg-emerald-500/10"
                  }`}
                >
                  <HugeiconsIcon 
                    icon={category.type === "EXPENSE" ? ArrowDownLeft01Icon : ArrowUpRight01Icon} 
                    size={10} 
                    strokeWidth={2.5} 
                  />
                  <span>{category.type}</span>
                </span>
              </div>
              <div>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={isPending}
                  className="font-sans font-bold text-[10px] tracking-wider text-budget-red hover:underline uppercase disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <HugeiconsIcon icon={Trash} size={12} strokeWidth={2} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
