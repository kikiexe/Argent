"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(50, "Nama kategori maksimal 50 karakter"),
  type: z.enum(["EXPENSE", "INCOME"], { errorMap: () => ({ message: "Tipe kategori tidak valid" }) })
});

export type ActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function createCategory(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;

  const validated = categorySchema.safeParse({ name, type });
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

  const { error: insertError } = await supabase.from("categories").insert({
    name: validated.data.name,
    type: validated.data.type,
    user_id: user.id
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Kategori dengan nama dan tipe ini sudah terdaftar." };
    }
    return { error: "Gagal menyimpan kategori. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

const deleteCategorySchema = z.string().uuid("ID Kategori tidak valid");

export async function deleteCategory(id: string): Promise<ActionState> {
  const validatedId = deleteCategorySchema.safeParse(id);
  if (!validatedId.success) {
    return { error: validatedId.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", validatedId.data)
    .eq("user_id", user.id);

  if (deleteError) {
    if (deleteError.code === "23503") {
      return { error: "Kategori tidak dapat dihapus karena masih digunakan dalam riwayat transaksi." };
    }
    return { error: "Gagal menghapus kategori. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
