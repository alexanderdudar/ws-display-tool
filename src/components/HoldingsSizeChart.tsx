"use client";

import { useMemo, ReactElement } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { Holding, Currency, SECURITY_TYPE_MAP, getAccountDisplayName } from "@/lib/types";
import { aggregateBySymbol } from "@/lib/aggregate";
import { getColorByIndex, getColorForSector, CATEGORY_COLORS } from "@/lib/colors";
import { getValueInCurrency } from "@/lib/hooks";
import { getETFBreakdown } from "@/lib/etf-breakdown";
import { TOOLTIP_STYLE, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, formatChartValue } from "@/lib/chart-utils";
import { ViewMode } from "./Dashboard";

interface Props {
  holdings: Holding[];
  currency: Currency;
  hidden: boolean;
  viewMode: ViewMode;
}

function CustomYTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }): ReactElement {
  const label = payload.value;
  const hasOptions = label.includes("(Options)");
  return (
    <text x={x} y={y} textAnchor="end" dominantBaseline="middle" fontSize={14} fill="var(--foreground)">
      {hasOptions ? (
        <>
          <tspan>{label.replace(" (Options)", "")}</tspan>
          <tspan fillOpacity={0.6}> (Options)</tspan>
        </>
      ) : label}
    </text>
  );
}

export function HoldingsSizeChart({ holdings, currency, hidden, viewMode }: Props) {
  const data = useMemo(() => {
    if (viewMode === "holding") {
      return aggregateBySymbol(holdings, currency)
        .filter((p) => p.totalValue > 0)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 12)
        .map((p, i) => ({
          symbol: p.symbol,
          value: p.totalValue,
          color: getColorByIndex(i),
        }));
    }

    const groups: Record<string, number> = {};
    for (const h of holdings) {
      const val = getValueInCurrency(h, currency);
      if (viewMode === "sector") {
        const breakdown = getETFBreakdown(h.symbol);
        if (breakdown) {
          for (const [sector, weight] of Object.entries(breakdown)) {
            groups[sector] = (groups[sector] || 0) + val * weight;
          }
        } else {
          groups[h.sector || "Other"] = (groups[h.sector || "Other"] || 0) + val;
        }
      } else {
        const key = viewMode === "account" ? getAccountDisplayName(h.accountName) : (SECURITY_TYPE_MAP[h.securityType] || h.securityType);
        groups[key] = (groups[key] || 0) + val;
      }
    }

    return Object.entries(groups)
      .map(([name, value], i) => ({
        symbol: name,
        value,
        color: viewMode === "sector" ? getColorForSector(name) : CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [holdings, currency, viewMode]);

  const labelWidth = useMemo(() => {
    if (data.length === 0) return 80;
    const longest = Math.max(...data.map((d) => d.symbol.length));
    return Math.min(Math.max(longest * 9 + 16, 70), 200);
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
              tick={{ fontSize: 14, fill: "#86868b", textAnchor: "start" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              tick={(props: Record<string, unknown>) => <CustomYTick x={props.x as number} y={props.y as number} payload={props.payload as { value: string }} />}
              axisLine={false}
              tickLine={false}
              width={labelWidth}
              tickMargin={6}
            />
            <Tooltip
              formatter={(value, _name, props) => [`${props.payload.symbol} : ${formatChartValue(Number(value), currency, hidden)}`]}
              labelStyle={{ display: "none" }}
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ ...TOOLTIP_ITEM_STYLE, padding: 0 }}
              separator=""
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} style={{ cursor: "default" }}>
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
