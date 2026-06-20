"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Holding, Currency } from "@/lib/types";
import { aggregateBySymbol } from "@/lib/aggregate";

interface Props {
  holdings: Holding[];
  currency: Currency;
  hidden: boolean;
}

export function WinnersLosersChart({ holdings, currency, hidden }: Props) {
  const data = useMemo(() => {
    const aggregated = aggregateBySymbol(holdings, currency)
      .filter((p) => p.totalBookValue > 0);

    const sorted = aggregated.sort((a, b) => b.totalPnl - a.totalPnl);
    const winners = sorted.slice(0, 5);
    const losers = sorted.slice(-5);
    const combined = [...winners, ...losers.filter((l) => !winners.includes(l))];
    return combined
      .sort((a, b) => b.totalPnl - a.totalPnl)
      .map((p) => ({ symbol: p.symbol, pnl: p.totalPnl }));
  }, [holdings, currency]);

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-[18px] border border-black/5 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5 h-full">
      <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
        Winners & Losers
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 50, right: 20 }}>
            <XAxis
              type="number"
              tickFormatter={(v) => (hidden ? "•" : `$${(v / 1000).toFixed(0)}k`)}
              tick={{ fontSize: 11, fill: "#86868b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              tick={{ fontSize: 12, fill: "#1d1d1f" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              formatter={(value) =>
                hidden
                  ? "•••••"
                  : new Intl.NumberFormat("en-CA", {
                      style: "currency",
                      currency,
                      minimumFractionDigits: 0,
                    }).format(Number(value))
              }
              contentStyle={{
                background: "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? "#34c759" : "#ff3b30"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
