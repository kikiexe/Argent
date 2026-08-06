import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { 
  BalanceCardSkeleton, 
  BudgetSectionSkeleton, 
  CategoryBudgetSkeleton, 
  RecentTransactionsSkeleton 
} from "@/components/DashboardSkeletons";
import { 
  BalanceCardWrapper, 
  BudgetSectionWrapper, 
  CategoryBudgetWrapper, 
  RecentTransactionsWrapper 
} from "./wrappers";
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

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || (user.email 
    ? user.email.split("@")[0].replace(/[._]/g, " ")
    : "Guest");

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        
        {/* Balance Card Section with Suspense */}
        <Suspense fallback={<BalanceCardSkeleton userName={userName} userEmail={user.email || ""} />}>
          <BalanceCardWrapper userId={user.id} userName={userName} userEmail={user.email || ""} avatarEmoji={user.user_metadata?.avatar_emoji} />
        </Suspense>

        <main className="max-w-4xl w-full mx-auto px-6 pt-10 pb-32 sm:pb-12 space-y-8">

          {/* Budget Section with Suspense */}
          <Suspense fallback={<BudgetSectionSkeleton />}>
            <BudgetSectionWrapper userId={user.id} />
          </Suspense>

          {/* Category Budget Breakdown with Suspense */}
          <Suspense fallback={<CategoryBudgetSkeleton />}>
            <CategoryBudgetWrapper userId={user.id} />
          </Suspense>

          {/* Recent Transactions List with Suspense */}
          <Suspense fallback={<RecentTransactionsSkeleton />}>
            <RecentTransactionsWrapper userId={user.id} />
          </Suspense>
          
        </main>
      </div>
    </div>
  );
}
