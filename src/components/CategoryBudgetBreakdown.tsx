"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { setCategoryBudget, deleteCategoryBudget } from "@/app/budgets/actions";
import { Category, CategoryBudgetUsage } from "@/types/database";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon, Coins01Icon, Trash, PlusSignIcon } from "@hugeicons/core-free-icons";

interface CategoryBudgetBreakdownProps {
  month: number;
  year: number;
  budgets: CategoryBudgetUsage[];
  expenseCategories: Category[];
  totalLimit: number;
  hasError: boolean;
}

export default function CategoryBudgetBreakdown({
  month,
  year,
  budgets,
  expenseCategories,
  totalLimit,
  hasError
}: CategoryBudgetBreakdownProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus anggaran untuk kategori "${categoryName}"?`)) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteCategoryBudget(categoryId, month, year);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  const handleEditStart = (budget: CategoryBudgetUsage) => {
    setEditingCategoryId(budget.category_id);
    setIsAdding(false);
    setError(null);
  };

  // Filter out categories that already have a budget
  const budgetedCategoryIds = new Set(budgets.map((b) => b.category_id));
  const availableCategories = expenseCategories.filter(
    (c) => !budgetedCategoryIds.has(c.id)
  );

  const totalCategoryLimit = budgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);

  return (
    <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <h3 className="font-sans text-sm font-black text-ink">
            Anggaran Kategori
          </h3>
          <span className="block font-sans text-[10px] text-body font-semibold">
            Batas pengeluaran per kategori bulan ini
          </span>
        </div>
        {!isAdding && editingCategoryId === null && availableCategories.length > 0 && (
          <button
            onClick={() => {
              setIsAdding(true);
              setError(null);
            }}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-full font-sans font-bold text-[10px] tracking-wider uppercase transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={10} strokeWidth={2.5} />
            <span>Tambah</span>
          </button>
        )}
      </div>

      {hasError && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: Gagal memuat data anggaran kategori. Beberapa informasi mungkin tidak lengkap atau usang. Silakan muat ulang halaman.
        </div>
      )}

      {totalLimit > 0 && totalCategoryLimit > totalLimit && (
        <div className="bg-amber-500/10 text-budget-yellow border border-amber-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Peringatan: Total limit anggaran kategori ({formatCurrency(totalCategoryLimit)}) melebihi limit anggaran bulanan Anda ({formatCurrency(totalLimit)}).
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: {error}
        </div>
      )}

      {/* Add New Category Budget Form */}
      {isAdding && (
        <AddBudgetForm
          month={month}
          year={year}
          availableCategories={availableCategories}
          onSuccess={() => setIsAdding(false)}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Category Budgets List */}
      {budgets.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-hairline rounded-2xl bg-canvas-soft">
          <p className="font-sans text-xs text-body font-semibold italic">
            Belum ada anggaran kategori untuk bulan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {budgets.map((budget) => {
            const isEditing = editingCategoryId === budget.category_id;
            const percentage = budget.limit_amount > 0 ? (budget.spent_amount / budget.limit_amount) * 100 : 0;
            const clampedPercentage = Math.min(percentage, 100);
            const isOverbudget = budget.spent_amount > budget.limit_amount;
            const remaining = budget.limit_amount - budget.spent_amount;

            let progressBarColor = "bg-emerald-500";
            if (percentage >= 75 && percentage <= 100) {
              progressBarColor = "bg-amber-500";
            } else if (percentage > 100) {
              progressBarColor = "bg-rose-500";
            }

            if (isEditing) {
              return (
                <EditBudgetForm
                  key={budget.category_id}
                  budget={budget}
                  month={month}
                  year={year}
                  onSuccess={() => setEditingCategoryId(null)}
                  onCancel={() => setEditingCategoryId(null)}
                />
              );
            }

            return (
              <div key={budget.category_id} className="space-y-2 pb-4 border-b border-hairline last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-sans text-xs font-black text-ink">
                      {budget.category_name}
                    </span>
                    <span className="block font-sans text-[10px] text-body font-semibold">
                      Terpakai {formatCurrency(budget.spent_amount)} dari {formatCurrency(budget.limit_amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditStart(budget)}
                      disabled={isPending}
                      className="w-7 h-7 bg-canvas-soft hover:bg-canvas-soft/80 rounded-full flex items-center justify-center text-gray-500 hover:text-ink transition-colors"
                      title="Edit Limit"
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} size={12} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.category_id, budget.category_name)}
                      disabled={isPending}
                      className="w-7 h-7 bg-canvas-soft hover:bg-canvas-soft/80 rounded-full flex items-center justify-center text-gray-500 hover:text-budget-red transition-colors"
                      title="Hapus Limit"
                    >
                      <HugeiconsIcon icon={Trash} size={12} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-canvas-soft rounded-full h-2.5 overflow-hidden shadow-inner relative">
                    <div
                      className={`h-full ${progressBarColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${clampedPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-sans font-bold uppercase">
                    <span className="text-body">{percentage.toFixed(0)}% Terpakai</span>
                    <span className={isOverbudget ? "text-budget-red" : "text-body"}>
                      {isOverbudget
                        ? `Melebihi limit ${formatCurrency(Math.abs(remaining))}`
                        : `Sisa limit: ${formatCurrency(remaining)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AddBudgetFormProps {
  month: number;
  year: number;
  availableCategories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

function AddBudgetForm({ month, year, availableCategories, onSuccess, onCancel }: AddBudgetFormProps) {
  const [state, formAction, isPending] = useActionState(setCategoryBudget, null);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form
      action={formAction}
      className="space-y-4 bg-canvas-soft p-4 rounded-2xl border border-hairline"
    >
      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="year" value={year} />

      {state?.error && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category_id" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase">
            Pilih Kategori
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="w-full bg-card text-ink border border-hairline p-3 rounded-2xl font-sans text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
          >
            <option value="">-- Pilih Kategori Expense --</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="limit_amount" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase">
            Batas Limit Anggaran (IDR)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <HugeiconsIcon icon={Coins01Icon} size={16} strokeWidth={1.8} />
            </div>
            <input
              id="limit_amount"
              name="limit_amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 1500000"
              className="w-full bg-card text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full font-sans font-bold text-xs text-body hover:bg-canvas-soft transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-sans font-bold text-xs transition-colors"
        >
          {isPending ? "Menyimpan..." : "Simpan Anggaran"}
        </button>
      </div>
    </form>
  );
}

interface EditBudgetFormProps {
  budget: CategoryBudgetUsage;
  month: number;
  year: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function EditBudgetForm({ budget, month, year, onSuccess, onCancel }: EditBudgetFormProps) {
  const [state, formAction, isPending] = useActionState(setCategoryBudget, null);
  const [editLimit, setEditLimit] = useState<string>(budget.limit_amount.toString());

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form
      action={formAction}
      className="space-y-4 bg-canvas-soft p-4 rounded-2xl border border-hairline"
    >
      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="category_id" value={budget.category_id} />

      {state?.error && (
        <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
          Error: {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={`limit_${budget.category_id}`} className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase">
          Edit Batas Limit untuk {budget.category_name} (IDR)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <HugeiconsIcon icon={Coins01Icon} size={16} strokeWidth={1.8} />
          </div>
          <input
            id={`limit_${budget.category_id}`}
            name="limit_amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={editLimit}
            onChange={(e) => setEditLimit(e.target.value)}
            disabled={isPending}
            placeholder="e.g. 1500000"
            className="w-full bg-card text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full font-sans font-bold text-xs text-body hover:bg-canvas-soft transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-sans font-bold text-xs transition-colors"
        >
          {isPending ? "Menyimpan..." : "Perbarui"}
        </button>
      </div>
    </form>
  );
}
