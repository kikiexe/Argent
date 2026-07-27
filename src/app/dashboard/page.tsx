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

  /* Fetch all user transactions to compute live balance and display recent items */
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        name,
        type
      )
    `)
    .eq("user_id", user?.id)
    .order("date", { ascending: false });

  const txList = transactions || [];
  
  /* Calculate balance */
  const totalIncome = txList
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpense = txList
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const balance = totalIncome - totalExpense;

  /* Fetch current month budget limit */
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: budgetData } = await supabase
    .from("monthly_budgets")
    .select("total_limit")
    .eq("user_id", user?.id)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .maybeSingle();

  const totalLimit = budgetData?.total_limit ? Number(budgetData.total_limit) : 0;

  /* Calculate current month expenses */
  const currentMonthExpenses = txList
    .filter((t) => {
      if (t.type !== "EXPENSE") return false;
      const tDate = new Date(t.date);
      return tDate.getMonth() + 1 === currentMonth && tDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  /* Get 5 most recent transactions */
  const recentTransactions = txList.slice(0, 5);

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email 
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
        <BalanceCard balance={balance} userName={userName} userEmail={user?.email || ""} transactions={txList} />

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
