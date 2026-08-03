"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getLocalDateString } from "@/utils/timezone";

const extractionSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  note: z.string().max(50).nullable().optional(),
  type: z.enum(["EXPENSE", "INCOME"]).nullable().optional()
});

export type ExtractionResult = {
  success: boolean;
  data?: {
    category_id?: string | null;
    amount?: number | null;
    date?: string | null;
    note?: string | null;
    type?: "EXPENSE" | "INCOME" | null;
  };
  error?: string;
};

export async function extractTransactionFromVoice(text: string): Promise<ExtractionResult> {
  console.log("[AI Action] Starting extractTransactionFromVoice with text:", text);
  try {
    const trimmedText = text.trim();
    if (!trimmedText) {
      console.log("[AI Action] Trimmed text is empty");
      return { success: false, error: "Teks input kosong." };
    }

    if (trimmedText.length > 200) {
      console.log("[AI Action] Trimmed text exceeds 200 characters:", trimmedText.length);
      return { success: false, error: "Teks input terlalu panjang (maksimal 200 karakter)." };
    }

    // 1. Authenticate user
    console.log("[AI Action] Authenticating user...");
    const supabase = await createClient();
    const cookieStore = await cookies();
    const timezone = cookieStore.get("user-timezone")?.value || "UTC";
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[AI Action] Auth error or user not found:", authError);
      return { success: false, error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }
    console.log("[AI Action] Authenticated user ID:", user.id, "Timezone:", timezone);

    // 2. Rate Limiting Check
    console.log("[AI Action] Checking rate limit...");
    try {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const { count: countMin, error: countMinErr } = await supabase
        .from("api_usage_log")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("feature", "voice_extract")
        .gte("created_at", oneMinuteAgo);

      if (countMinErr) throw countMinErr;
      console.log("[AI Action] 1-minute usage count:", countMin);
      if (countMin !== null && countMin >= 5) {
        return { success: false, error: "Terlalu sering mengirim input suara. Silakan tunggu 1 menit." };
      }

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: countDay, error: countDayErr } = await supabase
        .from("api_usage_log")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("feature", "voice_extract")
        .gte("created_at", twentyFourHoursAgo);

      if (countDayErr) throw countDayErr;
      console.log("[AI Action] 24-hour usage count:", countDay);
      if (countDay !== null && countDay >= 50) {
        return { success: false, error: "Kuota harian Anda untuk input suara telah habis (maksimal 50x per hari)." };
      }
    } catch (dbErr) {
      console.error("[AI Action] Rate limiting DB error:", dbErr);
      return { success: false, error: "Gagal memeriksa kuota penggunaan Anda. Silakan coba beberapa saat lagi." };
    }

    // 3. Fetch active categories to provide as context
    console.log("[AI Action] Fetching active categories...");
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name, type")
      .eq("user_id", user.id);

    if (catError) {
      console.error("[AI Action] Categories DB fetch error:", catError);
      return { success: false, error: "Gagal memuat kategori dari database." };
    }
    if (!categories || categories.length === 0) {
      console.log("[AI Action] No categories found for user");
      return { success: false, error: "Kategori tidak ditemukan. Buat kategori terlebih dahulu." };
    }
    console.log("[AI Action] Categories fetched count:", categories.length);

    // 4. Invoke Gemini API via REST Endpoint (highly compatible across all runtimes)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("[AI Action] GEMINI_API_KEY is not defined in process.env");
      return { success: false, error: "Sistem AI tidak terkonfigurasi (kunci API hilang)." };
    }

    const todayStr = getLocalDateString(timezone);
    const prompt = `
You are a transaction assistant for a finance app called Pecune.
Your task is to parse a spoken transcription in Indonesian into structured financial transaction details.

Here is the list of available categories for the user:
${JSON.stringify(categories, null, 2)}

Identify the category, the amount, the date, and a note.
Rules:
1. "type": Determine if the transaction is "EXPENSE" (e.g. buying, paying, spending money) or "INCOME" (e.g. receiving money, salary, ortu sending, freelance).
2. "category_id": MUST match one of the available category IDs based on relevance and the matching type. If none of the categories match, set it to null.
3. "amount": The transaction amount as a number. Look for words like "ribu" (thousand), "juta" (million), "ratus" (hundred), "M" or "jt" (e.g., "15 ribu" -> 15000, "1.5 juta" -> 1500000).
4. "date": The date in YYYY-MM-DD format. If relative keywords like "tadi", "hari ini", "barusan" are used, use the current date: "${todayStr}". If "kemarin" is used, compute yesterday's date. Otherwise, use "${todayStr}".
5. "note": A short note summarizing the transaction (maximum 50 characters).
6. "Scope check": If the input text is not a financial transaction statement (e.g. if it is a programming/coding question, a math query, general knowledge, writing poem, or random conversation unrelated to expenses or income logs), you MUST set "type", "category_id", "amount", "date", and "note" to null.
7. "Aggregation": You MUST return exactly one single JSON object, NOT an array. If the input text describes multiple items/purchases, aggregate them into a single transaction (sum their amounts, combine the descriptions in the "note", and choose the most relevant category).

Return ONLY a JSON object with this exact structure:
{
  "type": "EXPENSE" | "INCOME" | null,
  "category_id": string | null,
  "amount": number | null,
  "date": string | null,
  "note": string | null
}
Do not return any markdown formatting or comments.

Input text: "${trimmedText}"
`;

    console.log("[AI Action] Fetching Gemini API REST endpoint...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 250
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const resJson = await response.json();
      const responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("[AI Action] Raw response from Gemini:", responseText);

      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsedData = JSON.parse(responseText.trim());
      const validated = extractionSchema.safeParse(parsedData);

      if (!validated.success) {
        console.error("[AI Action] Zod validation failed on AI output:", validated.error);
        return { success: false, error: "Respons kecerdasan buatan tidak sesuai format." };
      }

      console.log("[AI Action] Validated extraction result:", validated.data);

      // Reject out-of-scope prompts (where model sets all relevant fields to null)
      if (
        !validated.data.type &&
        !validated.data.amount &&
        !validated.data.note
      ) {
        console.log("[AI Action] Prompt identified as out-of-scope");
        return {
          success: false,
          error: "Input tidak dikenali sebagai transaksi keuangan. Silakan masukkan deskripsi belanja atau pendapatan Anda."
        };
      }

      // Log usage to database after successful validation
      try {
        console.log("[AI Action] Logging usage to DB...");
        const { error: logErr } = await supabase
          .from("api_usage_log")
          .insert({
            user_id: user.id,
            feature: "voice_extract"
          });
        if (logErr) throw logErr;
        console.log("[AI Action] Usage log inserted successfully");
      } catch (insertErr) {
        console.error("[AI Action] Failed to insert api usage log:", insertErr);
      }

      return {
        success: true,
        data: validated.data
      };
    } catch (error: any) {
      console.error("[AI Action] Gemini API call failed:", error);
      if (error.name === "AbortError") {
        return { success: false, error: "Koneksi ke sistem AI terputus (waktu habis)." };
      }
      return { success: false, error: "Gagal menghubungkan ke layanan kecerdasan buatan." };
    }
  } catch (globalErr: any) {
    console.error("[AI Action] Uncaught exception in extractTransactionFromVoice:", globalErr);
    return { success: false, error: "Terjadi kesalahan internal pada server." };
  }
}
