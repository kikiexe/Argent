import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import CategoriesPageClient from "./CategoriesPageClient";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  /* Fetch user categories and wallet balances in parallel */
  const [categoriesResult, walletsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase.rpc("get_wallet_balances")
  ]);

  const categories = categoriesResult.data || [];
  const wallets = walletsResult.data || [];

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 pt-12 pb-32 sm:pb-12">
        <CategoriesPageClient categories={categories} wallets={wallets} />
      </main>
    </div>
  );
}
