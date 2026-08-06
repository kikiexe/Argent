"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAvatar(emoji: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_emoji: emoji }
    });

    if (updateError) {
      return { error: "Gagal memperbarui avatar." };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Error updating avatar:", err);
    return { error: "Terjadi kesalahan server." };
  }
}
