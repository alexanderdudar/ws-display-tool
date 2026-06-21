"use client";

import { useMemo } from "react";
import { Treemap as RechartsTreemap, ResponsiveContainer, Tooltip } from "recharts";
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

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  color?: string;
  depth?: number;
}

function truncateLabel(name: string, maxChars: number): string {
  if (name.length <= maxChars) return name;
  return name.slice(0, maxChars - 1) + "…";
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = "", color = "#0071e3", depth = 0 }: TreemapContentProps) {
  if (depth === 0) return null;

  const fontSize = width > 120 ? 15 : width > 80 ? 13 : 11;
  const maxChars = Math.floor(width / (fontSize * 0.6));
  const showLabel = width > 35 && height > 18 && maxChars >= 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="none"
        strokeWidth={0}
        rx={3}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={fontSize}
          fontWeight={600}
        >
          {truncateLabel(name.replace(" (Options)", "+"), maxChars)}
        </text>
      )}
    </g>
  );
}

export function TreemapChart({ holdings, currency, hidden, viewMode }: Props) {
  const data = useMemo(() => {
    if (viewMode === "holding") {
      return aggregateBySymbol(holdings, currency)
        .filter((p) => p.totalValue > 0)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 30)
        .map((p, i) => ({
          name: p.symbol,
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
        name,
        value,
        color: viewMode === "sector" ? getColorForSector(name) : CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [holdings, currency, viewMode]);

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-[18px] border border-black/5 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5 h-[420px] flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsTreemap
            data={data}
            dataKey="value"
            content={<CustomContent />}
            fill="transparent"
            animationDuration={400}
          >
            <Tooltip
              formatter={(value) => formatChartValue(Number(value), currency, hidden)}
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
            />
          </RechartsTreemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
