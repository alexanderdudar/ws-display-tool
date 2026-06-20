"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from "recharts";
import { Holding, Currency } from "@/lib/types";
import { aggregateBySymbol } from "@/lib/aggregate";
import { TOOLTIP_STYLE, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, formatChartValue } from "@/lib/chart-utils";

interface Props {
  holdings: Holding[];
  currency: Currency;
  hidden: boolean;
}

export function PnlWaterfall({ holdings, currency, hidden }: Props) {
  const data = useMemo(() => {
    const aggregated = aggregateBySymbol(holdings, currency)
      .filter((p) => p.totalBookValue > 0 && Math.abs(p.totalPnl) > 0)
      .sort((a, b) => b.totalPnl - a.totalPnl);

    const top = aggregated.slice(0, 8);
    const bottom = aggregated.slice(-5);
    const combined = [...top, ...bottom.filter((b) => !top.includes(b))];

    return combined
      .sort((a, b) => b.totalPnl - a.totalPnl)
      .map((p) => ({
        symbol: p.symbol,
        pnl: p.totalPnl,
        color: p.totalPnl >= 0 ? "#34c759" : "#ff3b30",
      }));
  }, [holdings, currency]);

  const labelWidth = useMemo(() => {
    if (data.length === 0) return 60;
    const longest = Math.max(...data.map((d) => d.symbol.length));
    return Math.min(Math.max(longest * 8 + 12, 60), 120);
  }, [data]);

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-[18px] border border-black/5 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5 h-[420px] flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 50, top: 5, bottom: 5 }}>
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              tickFormatter={(v) => (hidden ? "•" : `$${(v / 1000).toFixed(0)}k`)}
              tick={{ fontSize: 12, fill: "#86868b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              tick={{ fontSize: 13, fill: "var(--foreground)" }}
              axisLine={false}
              tickLine={false}
              width={labelWidth}
              tickMargin={10}
            />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
            <Tooltip
              formatter={(value, _name, props) => [`${props.payload.symbol} : ${formatChartValue(Number(value), currency, hidden)}`]}
              labelStyle={{ display: "none" }}
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ ...TOOLTIP_ITEM_STYLE, padding: 0 }}
              separator=""
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]} style={{ cursor: "default" }}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} style={{ cursor: "default" }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
