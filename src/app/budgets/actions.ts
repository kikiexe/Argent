"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const budgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  total_limit: z.number().nonnegative()
});

export async function setMonthlyBudget(
  prevState: any,
  formData: FormData
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required." };
    }

    const rawMonth = Number(formData.get("month"));
    const rawYear = Number(formData.get("year"));
    const rawLimit = Number(formData.get("total_limit"));

    const result = budgetSchema.safeParse({
      month: rawMonth,
      year: rawYear,
      total_limit: rawLimit
    });

    if (!result.success) {
      return { error: "Invalid budget input parameters." };
    }

    const { month, year, total_limit } = result.data;

    const { error: upsertError } = await supabase
      .from("monthly_budgets")
      .upsert(
        {
          user_id: user.id,
          month,
          year,
          total_limit
        },
        {
          onConflict: "user_id,month,year"
        }
      );

    if (upsertError) {
      console.error("Failed to upsert budget:", upsertError);
      return { error: "Gagal menyimpan anggaran bulanan. Silakan coba lagi." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in setMonthlyBudget:", err);
    return { error: "Terjadi kesalahan yang tidak terduga." };
  }
}

const categoryBudgetSchema = z.object({
  category_id: z.string().uuid({ message: "ID Kategori tidak valid." }),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  limit_amount: z.number().nonnegative({ message: "Limit harus berupa angka non-negatif." })
});

export async function setCategoryBudget(
  prevState: any,
  formData: FormData
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required." };
    }

    const category_id = formData.get("category_id") as string;
    const rawMonth = Number(formData.get("month"));
    const rawYear = Number(formData.get("year"));
    const rawLimit = Number(formData.get("limit_amount"));

    const result = categoryBudgetSchema.safeParse({
      category_id,
      month: rawMonth,
      year: rawYear,
      limit_amount: rawLimit
    });

    if (!result.success) {
      return { error: result.error.errors[0].message || "Invalid input parameters." };
    }

    const { month, year, limit_amount } = result.data;

    // Verify category belongs to user and is of type EXPENSE
    const { data: category, error: catError } = await supabase
      .from("categories")
      .select("type, user_id")
      .eq("id", category_id)
      .maybeSingle();

    if (catError || !category) {
      return { error: "Kategori tidak ditemukan." };
    }

    if (category.user_id !== user.id) {
      return { error: "Akses ditolak." };
    }

    if (category.type !== "EXPENSE") {
      return { error: "Budget hanya berlaku untuk kategori pengeluaran." };
    }

    const { error: upsertError } = await supabase
      .from("category_budgets")
      .upsert(
        {
          user_id: user.id,
          category_id,
          month,
          year,
          limit_amount
        },
        {
          onConflict: "user_id,category_id,month,year"
        }
      );

    if (upsertError) {
      console.error("Failed to upsert category budget:", upsertError);
      return { error: "Gagal menyimpan anggaran kategori. Silakan coba lagi." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in setCategoryBudget:", err);
    return { error: "Terjadi kesalahan yang tidak terduga." };
  }
}

export async function deleteCategoryBudget(
  categoryId: string,
  month: number,
  year: number
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required." };
    }

    const { error: deleteError } = await supabase
      .from("category_budgets")
      .delete()
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .eq("month", month)
      .eq("year", year);

    if (deleteError) {
      console.error("Failed to delete category budget:", deleteError);
      return { error: "Gagal menghapus anggaran kategori. Silakan coba lagi." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in deleteCategoryBudget:", err);
    return { error: "Terjadi kesalahan yang tidak terduga." };
  }
}
