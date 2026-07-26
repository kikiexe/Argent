import Header from "@/components/Header";
import BalanceCard from "@/components/BalanceCard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Notification01Icon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Folder01Icon,
  Receipt,
  PlusSignIcon,
  MinusSignIcon
} from "@hugeicons/core-free-icons";

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

  /* Get 5 most recent transactions */
  const recentTransactions = txList.slice(0, 5);

  const userName = user?.email 
    ? user.email.split("@")[0].replace(/[._]/g, " ")
    : "Guest";

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
        <Header />

        <main className="max-w-4xl w-full mx-auto px-6 pt-8 pb-24 sm:pb-12 space-y-8">
          {/* Top Greeting Block */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-sans text-[10px] font-bold tracking-widest text-body uppercase">
                Welcome back
              </span>
              <h2 className="font-sans text-xl font-black text-ink capitalize">
                Good Day, {userName}!
              </h2>
            </div>
            <button className="w-10 h-10 bg-white hover:bg-gray-50 border border-hairline rounded-full flex items-center justify-center shadow-sm text-ink-soft transition-colors">
              <HugeiconsIcon icon={Notification01Icon} size={18} strokeWidth={1.8} />
            </button>
          </div>

          {/* Balance Card Container */}
          <BalanceCard balance={balance} />

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-bold tracking-widest text-body uppercase">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/transactions?type=INCOME"
                className="bg-white hover:bg-emerald-50/20 border border-hairline hover:border-emerald-200/50 p-4 rounded-2xl shadow-sm transition-all duration-200 flex flex-col items-start gap-3 group"
              >
                <div className="w-9 h-9 bg-emerald-100/60 rounded-xl flex items-center justify-center text-budget-green transition-transform duration-200 group-hover:scale-105">
                  <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="block font-sans text-xs font-black text-ink">Record Income</span>
                  <span className="block font-sans text-[10px] text-body">Add incoming funds</span>
                </div>
              </Link>

              <Link
                href="/transactions?type=EXPENSE"
                className="bg-white hover:bg-rose-50/20 border border-hairline hover:border-rose-200/50 p-4 rounded-2xl shadow-sm transition-all duration-200 flex flex-col items-start gap-3 group"
              >
                <div className="w-9 h-9 bg-rose-100/60 rounded-xl flex items-center justify-center text-budget-red transition-transform duration-200 group-hover:scale-105">
                  <HugeiconsIcon icon={MinusSignIcon} size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="block font-sans text-xs font-black text-ink">Record Expense</span>
                  <span className="block font-sans text-[10px] text-body">Log daily spending</span>
                </div>
              </Link>

              <Link
                href="/categories"
                className="bg-white hover:bg-indigo-50/20 border border-hairline hover:border-indigo-200/50 p-4 rounded-2xl shadow-sm transition-all duration-200 flex flex-col items-start gap-3 group"
              >
                <div className="w-9 h-9 bg-indigo-100/60 rounded-xl flex items-center justify-center text-indigo-600 transition-transform duration-200 group-hover:scale-105">
                  <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={2} />
                </div>
                <div>
                  <span className="block font-sans text-xs font-black text-ink">Categories</span>
                  <span className="block font-sans text-[10px] text-body">Manage labels</span>
                </div>
              </Link>

              <Link
                href="/transactions"
                className="bg-white hover:bg-blue-50/20 border border-hairline hover:border-blue-200/50 p-4 rounded-2xl shadow-sm transition-all duration-200 flex flex-col items-start gap-3 group"
              >
                <div className="w-9 h-9 bg-blue-100/60 rounded-xl flex items-center justify-center text-blue-600 transition-transform duration-200 group-hover:scale-105">
                  <HugeiconsIcon icon={Receipt} size={16} strokeWidth={2} />
                </div>
                <div>
                  <span className="block font-sans text-xs font-black text-ink">Ledger</span>
                  <span className="block font-sans text-[10px] text-body">Transaction history</span>
                </div>
              </Link>
            </div>
          </div>

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
              <div className="bg-white border border-hairline p-10 rounded-3xl text-center shadow-sm">
                <p className="font-sans text-xs text-body font-semibold italic">
                  No transactions recorded yet. Use the actions above to get started.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-hairline rounded-3xl p-3 shadow-sm divide-y divide-gray-50">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          isIncome 
                            ? "bg-emerald-100/50 text-budget-green" 
                            : "bg-rose-100/50 text-budget-red"
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
                      <div className={`font-sans text-xs font-black ${
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

      {/* Footer */}
      <footer className="border-t border-hairline py-6 px-6 text-center bg-white shadow-inner hidden sm:block">
        <p className="font-sans text-[10px] tracking-widest text-body uppercase">
          Argent &copy; 2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
