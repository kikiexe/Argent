import { createClient } from "@/utils/supabase/server";
import BalanceCard from "@/components/BalanceCard";
import BudgetSection from "@/components/BudgetSection";
import CategoryBudgetBreakdown from "@/components/CategoryBudgetBreakdown";
import { Category, CategoryBudgetUsage } from "@/types/database";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowDownLeft01Icon, 
  ArrowUpRight01Icon 
} from "@hugeicons/core-free-icons";

interface WrapperProps {
  userId: string;
}

interface BalanceCardWrapperProps extends WrapperProps {
  userName: string;
  userEmail: string;
}

export async function BalanceCardWrapper({ userId, userName, userEmail }: BalanceCardWrapperProps) {
  const supabase = await createClient();
  const now = new Date();
  const currentYear = now.getFullYear();

  const chartStartDate = new Date(currentYear, now.getMonth() - 11, 1);
  const chartStartDateString = chartStartDate.toISOString().split("T")[0];

  /* Fetch lifetime balance stats and chart transaction data in parallel */
  const [statsResult, chartTxResult] = await Promise.all([
    supabase.rpc("get_user_stats").maybeSingle(),
    supabase.from("transactions").select(`
      *,
      categories (
        name,
        type
      )
    `).eq("user_id", userId).gte("date", chartStartDateString).order("date", { ascending: false })
  ]);

  const statsData = statsResult.data as { lifetime_balance: number; current_month_expenses: number } | null;
  const balance = statsData?.lifetime_balance ? Number(statsData.lifetime_balance) : 0;
  const chartTransactions = chartTxResult.data || [];

  return (
    <BalanceCard 
      balance={balance} 
      userName={userName} 
      userEmail={userEmail} 
      transactions={chartTransactions} 
    />
  );
}

export async function BudgetSectionWrapper({ userId }: WrapperProps) {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  /* Fetch monthly budget stats and monthly target budget in parallel */
  const [statsResult, budgetResult] = await Promise.all([
    supabase.rpc("get_user_stats").maybeSingle(),
    supabase.from("monthly_budgets").select("total_limit").eq("user_id", userId).eq("month", currentMonth).eq("year", currentYear).maybeSingle()
  ]);

  const statsData = statsResult.data as { lifetime_balance: number; current_month_expenses: number } | null;
  const currentMonthExpenses = statsData?.current_month_expenses ? Number(statsData.current_month_expenses) : 0;
  const totalLimit = budgetResult.data?.total_limit ? Number(budgetResult.data.total_limit) : 0;

  return (
    <BudgetSection
      month={currentMonth}
      year={currentYear}
      totalLimit={totalLimit}
      totalExpense={currentMonthExpenses}
    />
  );
}

export async function CategoryBudgetWrapper({ userId }: WrapperProps) {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  /* Fetch current month category budgets count, general categories, and monthly budget limit in parallel */
  const [countResult, catsResult, budgetResult] = await Promise.all([
    supabase.from("category_budgets").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("month", currentMonth).eq("year", currentYear),
    supabase.from("categories").select("*").eq("user_id", userId).eq("type", "EXPENSE").order("name", { ascending: true }),
    supabase.from("monthly_budgets").select("total_limit").eq("user_id", userId).eq("month", currentMonth).eq("year", currentYear).maybeSingle()
  ]);

  const count = countResult.count;
  let initError = null;

  /* If budgets do not exist for the current month, carry over last month's budgets */
  if (count === 0 && !countResult.error) {
    const { error: errorRpc } = await supabase.rpc("initialize_category_budgets", {
      target_month: currentMonth,
      target_year: currentYear
    });
    if (errorRpc) {
      console.error("Failed to initialize category budgets:", errorRpc);
      initError = errorRpc;
    }
  }

  /* Fetch category budget usage after check */
  const { data: categoryBudgetsData, error: usageError } = await supabase.rpc("get_category_budget_usage", {
    target_month: currentMonth,
    target_year: currentYear
  });

  const categoryBudgets = (categoryBudgetsData || []) as unknown as CategoryBudgetUsage[];
  const expenseCategories = (catsResult.data || []) as unknown as Category[];
  const totalLimit = budgetResult.data?.total_limit ? Number(budgetResult.data.total_limit) : 0;
  const hasError = !!(countResult.error || initError || usageError || catsResult.error);

  return (
    <CategoryBudgetBreakdown
      month={currentMonth}
      year={currentYear}
      budgets={categoryBudgets}
      expenseCategories={expenseCategories}
      totalLimit={totalLimit}
      hasError={hasError}
    />
  );
}

export async function RecentTransactionsWrapper({ userId }: WrapperProps) {
  const supabase = await createClient();

  const { data: recentTransactionsData } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        name,
        type
      )
    `)
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(5);

  const recentTransactions = recentTransactionsData || [];

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
  );
}
