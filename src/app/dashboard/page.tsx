import BalanceCard from "@/components/BalanceCard";
import BudgetSection from "@/components/BudgetSection";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon
} from "@hugeicons/core-free-icons";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  /* Call optimized RPC function to aggregate balance and current month's expenses in DB */
  const { data: statsData } = (await supabase
    .rpc("get_user_stats")
    .maybeSingle()) as unknown as { data: { lifetime_balance: number; current_month_expenses: number } | null };

  const balance = statsData?.lifetime_balance ? Number(statsData.lifetime_balance) : 0;
  const currentMonthExpenses = statsData?.current_month_expenses ? Number(statsData.current_month_expenses) : 0;

  /* Fetch 5 most recent transactions for display */
  const { data: recentTransactionsData } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        name,
        type
      )
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  const recentTransactions = recentTransactionsData || [];

  /* Fetch transactions for the chart (limited to the last 12 calendar months) */
  const chartStartDate = new Date(currentYear, now.getMonth() - 11, 1);
  const chartStartDateString = chartStartDate.toISOString().split("T")[0];

  const { data: chartTransactionsData } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        name,
        type
      )
    `)
    .eq("user_id", user.id)
    .gte("date", chartStartDateString)
    .order("date", { ascending: false });

  const chartTransactions = chartTransactionsData || [];

  /* Fetch current month budget limit */
  const { data: budgetData } = await supabase
    .from("monthly_budgets")
    .select("total_limit")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .maybeSingle();

  const totalLimit = budgetData?.total_limit ? Number(budgetData.total_limit) : 0;

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || (user.email 
    ? user.email.split("@")[0].replace(/[._]/g, " ")
    : "Guest");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        {/* Unified Top Curved Header with Balance Card (Full-Bleed) */}
        <BalanceCard balance={balance} userName={userName} userEmail={user.email || ""} transactions={chartTransactions} />

        <main className="max-w-4xl w-full mx-auto px-6 pt-10 pb-32 sm:pb-12 space-y-8">

          {/* Budget Section */}
          <BudgetSection
            month={currentMonth}
            year={currentYear}
            totalLimit={totalLimit}
            totalExpense={currentMonthExpenses}
          />

          {/* Recent Transactions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-sans text-xs font-bold tracking-widest text-body uppercase">
                Recent Transactions
              </h4>
              <Link
                href="/transactions"
                className="font-sans text-[10px] font-bold tracking-wider text-indigo-600 hover:underline uppercase"
              >
                View All
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="bg-card border border-hairline p-10 rounded-3xl text-center shadow-sm">
                <p className="font-sans text-xs text-body font-semibold italic">
                  No transactions recorded yet. Use the actions above to get started.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-hairline rounded-3xl p-3 shadow-sm divide-y divide-hairline">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                          isIncome 
                            ? "bg-emerald-100 dark:bg-emerald-950 text-budget-green" 
                            : "bg-rose-100 dark:bg-rose-950 text-budget-red"
                        }`}>
                          <HugeiconsIcon 
                            icon={isIncome ? ArrowDownLeft01Icon : ArrowUpRight01Icon} 
                            size={14} 
                            strokeWidth={2.5} 
                          />
                        </div>
                        <div>
                          <span className="block font-sans text-xs font-black text-ink">
                            {tx.categories?.name || "Uncategorized"}
                          </span>
                          <span className="block font-sans text-[10px] text-body font-semibold">
                            {formatDate(tx.date)} {tx.note && `• ${tx.note}`}
                          </span>
                        </div>
                      </div>
                      <div className={`font-sans text-xs font-black whitespace-nowrap ${
                        isIncome ? "text-budget-green" : "text-budget-red"
                      }`}>
                        {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
