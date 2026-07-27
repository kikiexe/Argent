import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const monthParam = resolvedSearchParams.month;
  const yearParam = resolvedSearchParams.year;

  const currentDate = new Date();
  const currentMonth = monthParam ? parseInt(monthParam as string) : currentDate.getMonth() + 1;
  const currentYear = yearParam ? parseInt(yearParam as string) : currentDate.getFullYear();

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

  /* Fetch user categories for the input select */
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  /* Fetch transactions for current month and year */
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        id,
        name,
        type
      )
    `)
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 pt-12 pb-32 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <TransactionForm categories={categories || []} />
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
