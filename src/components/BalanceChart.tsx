"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Transaction } from "@/types/database";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";

interface BalanceChartProps {
  transactions: (Transaction & { categories: { name: string; type: "EXPENSE" | "INCOME" } | null })[];
}

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

export default function BalanceChart({ transactions }: BalanceChartProps) {
  const [timeframe, setTimeframe] = useState<"1W" | "1M" | "1Y">("1Y");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
    return formatted.replace("Rp", "Rp ");
  };

  /* Data Aggregation Helper */
  const getChartData = (): ChartDataPoint[] => {
    const dataPoints: ChartDataPoint[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const getTxDate = (t: any) => {
      if (!t.date) return new Date(0);
      const [y, m, d] = t.date.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
    };

    const getOldestTransactionDate = () => {
      if (transactions.length === 0) return today;
      let oldest = today;
      transactions.forEach((t) => {
        const txDate = getTxDate(t);
        if (txDate < oldest) {
          oldest = txDate;
        }
      });
      return oldest;
    };

    if (timeframe === "1W") {
      // 7 Days: from 6 days ago up to today
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        
        const dayLabel = d.toLocaleDateString("id-ID", { weekday: "short" });
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
          if (t.date === formattedDate) {
            const amt = Number(t.amount);
            if (t.type === "INCOME") income += amt;
            if (t.type === "EXPENSE") expense += amt;
          }
        });

        dataPoints.push({
          label: dayLabel,
          income,
          expense
        });
      }
    } else if (timeframe === "1M") {
      // 4 Periods (Weeks): splitting last 28 days into 4 periods of 7 days
      for (let w = 3; w >= 0; w--) {
        const start = new Date(today);
        start.setDate(today.getDate() - (w * 7 + 6));
        const end = new Date(today);
        end.setDate(today.getDate() - (w * 7));

        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
          const txDate = getTxDate(t);
          if (txDate >= start && txDate <= end) {
            const amt = Number(t.amount);
            if (t.type === "INCOME") income += amt;
            if (t.type === "EXPENSE") expense += amt;
          }
        });

        dataPoints.push({
          label: `W${4 - w}`,
          income,
          expense
        });
      }
    } else if (timeframe === "1Y") {
      // Dynamic Months: last 12 calendar months ending in current month, trimmed to oldest transaction
      const oldestDate = getOldestTransactionDate();
      const monthsDiff = (today.getFullYear() - oldestDate.getFullYear()) * 12 + (today.getMonth() - oldestDate.getMonth()) + 1;
      const displayMonths = Math.min(12, Math.max(1, monthsDiff));

      for (let m = displayMonths - 1; m >= 0; m--) {
        const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const targetMonth = d.getMonth();
        const targetYear = d.getFullYear();
        const monthLabel = d.toLocaleDateString("id-ID", { month: "short" });

        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
          const txDate = getTxDate(t);
          if (txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear) {
            const amt = Number(t.amount);
            if (t.type === "INCOME") income += amt;
            if (t.type === "EXPENSE") expense += amt;
          }
        });

        dataPoints.push({
          label: monthLabel,
          income,
          expense
        });
      }
    }

    return dataPoints;
  };

  const chartData = getChartData();
  const totalInChart = chartData.reduce((sum, d) => sum + d.income + d.expense, 0);
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expense)),
    1000 // default floor to avoid division by zero
  );

  return (
    <div className="space-y-4 pt-1">
      {/* Header / Selector Row */}
      <div className="flex items-center justify-between">
        {/* Custom Styled Select for Timeframe */}
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="appearance-none bg-white/10 hover:bg-white/15 border border-white/10 text-white pl-3.5 pr-8 py-1.5 rounded-full font-sans text-[10px] font-bold tracking-widest uppercase focus:outline-none transition-colors cursor-pointer"
          >
            <option value="1W" className="text-indigo-950">1 Week</option>
            <option value="1M" className="text-indigo-950">1 Month</option>
            <option value="1Y" className="text-indigo-950">1 Year</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-indigo-200">
            <HugeiconsIcon icon={ChevronDownIcon} size={11} strokeWidth={2.5} />
          </div>
        </div>

        {/* Hover Value Details or Totals */}
        <div className="text-right">
          {hoveredIndex !== null ? (
            <div className="space-y-0.5">
              <span className="block font-sans text-[8px] font-bold tracking-widest text-indigo-200 uppercase leading-none">
                {chartData[hoveredIndex].label}
              </span>
              <span className="block font-sans text-[11px] font-black text-white leading-none">
                In: {formatCurrency(chartData[hoveredIndex].income)} | Out: {formatCurrency(chartData[hoveredIndex].expense)}
              </span>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="block font-sans text-[8px] font-bold tracking-widest text-indigo-200 uppercase leading-none">
                Total In Period
              </span>
              <span className="block font-sans text-[11px] font-black text-white leading-none">
                In: {formatCurrency(chartData.reduce((s, d) => s + d.income, 0))} | Out: {formatCurrency(chartData.reduce((s, d) => s + d.expense, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Custom Responsive Bar Chart Area */}
      <div className="relative h-[110px] w-full flex items-end justify-between px-1 sm:px-2 pt-6">
        {/* Grid Lines */}
        <div className="absolute inset-x-0 bottom-[24px] top-2 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-white/5 w-full" />
          <div className="border-b border-white/5 w-full" />
          <div className="border-b border-white/5 w-full" />
        </div>

        {/* Bars Columns */}
        {chartData.map((d, idx) => {
          const incPercent = (d.income / maxVal) * 100;
          const expPercent = (d.expense / maxVal) * 100;

          return (
            <div
              key={idx}
              className="flex flex-col items-center flex-1 group"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Double Bar wrapper */}
              <div className="flex items-end gap-[2px] h-[65px] w-full justify-center relative">
                {/* Income Bar (budget.green) */}
                <div
                  style={{ height: `${Math.max(incPercent, d.income > 0 ? 5 : 0)}%` }}
                  className={`w-1.5 bg-budget-green rounded-t-[2px] transition-all duration-300 ${
                    hoveredIndex === idx ? "brightness-110 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""
                  }`}
                />
                {/* Expense Bar (budget.red) */}
                <div
                  style={{ height: `${Math.max(expPercent, d.expense > 0 ? 5 : 0)}%` }}
                  className={`w-1.5 bg-budget-red rounded-t-[2px] transition-all duration-300 ${
                    hoveredIndex === idx ? "brightness-110 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""
                  }`}
                />
              </div>

              {/* X-axis Label */}
              <span className={`text-[8px] font-sans font-bold uppercase tracking-wider mt-1.5 transition-colors duration-150 ${
                hoveredIndex === idx ? "text-white font-black" : "text-indigo-200"
              }`}>
                {d.label}
              </span>
            </div>
          );
        })}

        {/* Empty State Overlay */}
        {totalInChart === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/20 backdrop-blur-[1px] rounded-2xl border border-white/5">
            <span className="text-[10px] font-sans font-bold tracking-widest text-indigo-100 uppercase bg-indigo-900/40 border border-white/10 px-4 py-2 rounded-full shadow-inner">
              No data in this period
            </span>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-5 text-[9px] font-sans font-bold tracking-widest uppercase text-indigo-100 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-budget-green" />
          <span>Earned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-budget-red" />
          <span>Spend</span>
        </div>
      </div>
    </div>
  );
}
