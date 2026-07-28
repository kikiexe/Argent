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

