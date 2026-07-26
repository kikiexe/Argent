"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"], { errorMap: () => ({ message: "Tipe transaksi tidak valid" }) }),
  amount: z.coerce.number().positive("Nominal transaksi harus lebih besar dari 0"),
  category_id: z.string().uuid("Kategori wajib dipilih"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  note: z.string().trim().max(200, "Catatan maksimal 200 karakter").optional().nullable()
});

export type ActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function createTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const type = formData.get("type") as string;
  const amount = formData.get("amount") as string;
  const category_id = formData.get("category_id") as string;
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;

  const validated = transactionSchema.safeParse({
    type,
    amount,
    category_id,
    date,
    note: note || null
  });

  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  /* Verify that the category belongs to the user and matches the type */
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id, type")
    .eq("id", validated.data.category_id)
    .eq("user_id", user.id)
    .single();

  if (catError || !category) {
    return { error: "Kategori tidak ditemukan atau bukan milik Anda." };
  }

  if (category.type !== validated.data.type) {
    return { error: "Tipe transaksi tidak cocok dengan tipe kategori." };
  }

  const { error: insertError } = await supabase.from("transactions").insert({
    type: validated.data.type,
    amount: validated.data.amount,
    category_id: validated.data.category_id,
    date: validated.data.date,
    note: validated.data.note || null,
    user_id: user.id
  });

  if (insertError) {
    return { error: "Gagal mencatat transaksi. Silakan coba lagi." };
  }

  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: "Gagal menghapus transaksi. Silakan coba lagi." };
  }

  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}
