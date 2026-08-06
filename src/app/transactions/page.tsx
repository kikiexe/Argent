import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";
import { cookies } from "next/headers";
import { getLocalDateComponents } from "@/utils/timezone";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const monthParam = resolvedSearchParams.month;
  const yearParam = resolvedSearchParams.year;

  const cookieStore = await cookies();
  const timezone = cookieStore.get("user-timezone")?.value || "UTC";
  const { year: localYear, month: localMonth } = getLocalDateComponents(timezone);
  
  const currentMonth = monthParam ? parseInt(monthParam as string) : localMonth;
  const currentYear = yearParam ? parseInt(yearParam as string) : localYear;

  const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const endDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${new Date(
    currentYear,
    currentMonth,
    0
  ).getDate()}`;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  /* Fetch user categories, transactions, and wallets in parallel */
  const [categoriesResult, transactionsResult, walletsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("transactions")
      .select(`
        *,
        categories (
          id,
          name,
          type
        ),
        wallets (
          id,
          name,
          type
        )
      `)
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false }),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })
  ]);

  const categories = categoriesResult.data;
  const transactions = transactionsResult.data;
  const wallets = walletsResult.data;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 pt-12 pb-32 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <TransactionForm categories={categories || []} wallets={wallets || []} />
          </div>
          <div className="lg:col-span-2">
            <TransactionTable
              transactions={(transactions as any) || []}
              currentMonth={currentMonth}
              currentYear={currentYear}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
