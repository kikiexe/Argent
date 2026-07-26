"use client";

import { useState, useTransition } from "react";
import { deleteCategory } from "./actions";
import { Category } from "@/types/database";

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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-ink pb-4">
        <h2 className="font-display text-2xl font-normal tracking-wide text-ink">
          Categories Ledger
        </h2>
        <span className="font-sans text-[10px] text-body font-bold tracking-widest uppercase mt-1 sm:mt-0">
          {categories.length} Categories Registered
        </span>
      </div>

      {error && (
        <div className="border border-ink bg-canvas p-3 rounded-none text-xs font-sans tracking-wide text-ink font-bold uppercase">
          Error: {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="border border-hairline p-12 text-center bg-canvas-soft rounded-none">
          <p className="font-serif text-sm text-body italic">No categories created yet. Use the sidebar to create one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink">
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3">Name</th>
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3">Type</th>
                <th className="font-sans font-bold text-[10px] tracking-widest text-ink uppercase pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-canvas-soft group">
                  <td className="py-4 font-serif text-sm text-ink">{category.name}</td>
                  <td className="py-4">
                    <span
                      className={`inline-block font-sans font-bold text-[9px] tracking-widest uppercase px-2 py-1 rounded-none border ${
                        category.type === "EXPENSE"
                          ? "border-budget-red/20 text-budget-red bg-budget-red/5"
                          : "border-budget-green/20 text-budget-green bg-budget-green/5"
                      }`}
                    >
                      {category.type}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(category.id)}
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
