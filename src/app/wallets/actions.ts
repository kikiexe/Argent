"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
} | null;

const walletSchema = z.object({
  name: z.string().trim().min(1, "Nama wallet wajib diisi").max(50, "Nama wallet maksimal 50 karakter"),
  type: z.enum(["CASH", "BANK", "E_WALLET", "CREDIT"], {
    errorMap: () => ({ message: "Tipe wallet tidak valid" })
  }),
  is_default: z.boolean().optional()
});

export async function createWallet(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const is_default = formData.get("is_default") === "true";

  const validated = walletSchema.safeParse({ name, type, is_default });
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

  const { data: existing } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", validated.data.name)
    .maybeSingle();

  if (existing) {
    return { error: "Nama wallet sudah digunakan." };
  }

  /* If is_default is true, we must unset other defaults first */
  if (validated.data.is_default) {
    await supabase
      .from("wallets")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error: insertError } = await supabase.from("wallets").insert({
    user_id: user.id,
    name: validated.data.name,
    type: validated.data.type,
    is_default: !!validated.data.is_default
  });

  if (insertError) {
    return { error: "Gagal membuat wallet. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateWallet(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const is_default = formData.get("is_default") === "true";

  const validated = walletSchema.safeParse({ name, type, is_default });
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

  /* Check if wallet exists and belongs to the user */
  const { data: existingWallet, error: fetchErr } = await supabase
    .from("wallets")
    .select("id, is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !existingWallet) {
    return { error: "Wallet tidak ditemukan." };
  }

  /* Check if new name conflicts with another wallet */
  const { data: conflictWallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", validated.data.name)
    .neq("id", id)
    .maybeSingle();

  if (conflictWallet) {
    return { error: "Nama wallet sudah digunakan oleh wallet lain." };
  }

  /* Handle default logic */
  if (validated.data.is_default) {
    await supabase
      .from("wallets")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error: updateError } = await supabase
    .from("wallets")
    .update({
      name: validated.data.name,
      type: validated.data.type,
      is_default: !!validated.data.is_default
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: "Gagal memperbarui wallet. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteWallet(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  /* Check if wallet exists and belongs to the user */
  const { data: wallet, error: fetchErr } = await supabase
    .from("wallets")
    .select("id, is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !wallet) {
    return { error: "Wallet tidak ditemukan." };
  }

  /* Check if there are transactions associated with this wallet */
  const { count, error: countErr } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("wallet_id", id)
    .eq("user_id", user.id);

  if (countErr) {
    return { error: "Gagal memeriksa transaksi terkait." };
  }

  if (count && count > 0) {
    return {
      error: `Wallet ini masih memiliki ${count} transaksi. Pindahkan transaksi tersebut ke wallet lain sebelum menghapus.`
    };
  }

  /* Check if the wallet is default. If it is default, prevent deleting it unless they make another wallet default first */
  if (wallet.is_default) {
    const { data: otherWallets } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .neq("id", id);

    if (otherWallets && otherWallets.length > 0) {
      return {
        error: "Wallet default tidak dapat dihapus. Silakan tetapkan wallet lain sebagai default terlebih dahulu."
      };
    }
  }

  const { error: deleteErr } = await supabase
    .from("wallets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteErr) {
    return { error: "Gagal menghapus wallet. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function bulkClassifyTransactions(
  transactionIds: string[],
  walletId: string | null
): Promise<ActionState> {
  if (!transactionIds || transactionIds.length === 0) {
    return { error: "Pilih minimal satu transaksi." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  /* If walletId is provided, verify it belongs to this user */
  if (walletId) {
    const { data: wallet, error: walletErr } = await supabase
      .from("wallets")
      .select("id")
      .eq("id", walletId)
      .eq("user_id", user.id)
      .single();

    if (walletErr || !wallet) {
      return { error: "Wallet tujuan tidak ditemukan." };
    }
  }

  /* Verify that all transactionIds belong to this user */
  const { data: txs, error: txsErr } = await supabase
    .from("transactions")
    .select("id, user_id")
    .in("id", transactionIds);

  if (txsErr || !txs) {
    return { error: "Gagal memverifikasi transaksi." };
  }

  const allBelongToUser = txs.every((t) => t.user_id === user.id);
  if (!allBelongToUser || txs.length !== transactionIds.length) {
    return { error: "Beberapa transaksi yang dipilih tidak valid atau bukan milik Anda." };
  }

  /* Update the transaction records */
  const { error: updateErr } = await supabase
    .from("transactions")
    .update({ wallet_id: walletId })
    .in("id", transactionIds);

  if (updateErr) {
    return { error: "Gagal melakukan klasifikasi transaksi massal." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function setDefaultWallet(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  /* Set all wallets' is_default to false for this user */
  await supabase
    .from("wallets")
    .update({ is_default: false })
    .eq("user_id", user.id);

  /* Set the specific wallet as default */
  const { error: updateError } = await supabase
    .from("wallets")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: "Gagal memperbarui default wallet. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
