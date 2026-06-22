"use client";

import { useMemo } from "react";
import { Holding, Currency } from "@/lib/types";
import { getValueInCurrency, getPnlInCurrency } from "@/lib/hooks";
import { aggregateBySymbol } from "@/lib/aggregate";

interface Props {
  holdings: Holding[];
  currency: Currency;
  hidden: boolean;
}

function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function Stat({
  label,
  value,
  sub,
  hidden,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  hidden: boolean;
  color?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-[#86868b] font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[17px] font-semibold ${color || "text-[#1d1d1f] dark:text-[#f5f5f7]"}`}>
          {hidden ? "•••••" : value}
        </span>
        {sub && (
          <span className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {hidden ? "••••" : sub.split("|").map((part, i) => (
              <span key={i} className={i > 0 ? "text-[#86868b] ml-1" : ""}>
                {part}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export function SummaryCards({ holdings, currency, hidden }: Props) {
  const stats = useMemo(() => {
    let totalValue = 0;
    let totalPnl = 0;
    let totalBookValue = 0;

    for (const h of holdings) {
      totalValue += getValueInCurrency(h, currency);
      totalPnl += getPnlInCurrency(h, currency);
      totalBookValue += currency === "CAD" ? h.bookValueCAD : h.bookValueMarket;
    }

    const aggregated = aggregateBySymbol(holdings, currency).filter((p) => p.totalBookValue > 0);
    const sorted = aggregated.sort((a, b) => b.pnlPct - a.pnlPct);
    const topGainer = sorted[0] ? { symbol: sorted[0].symbol, pct: sorted[0].pnlPct, pnl: sorted[0].totalPnl } : { symbol: "-", pct: 0, pnl: 0 };
    const topLoser = sorted[sorted.length - 1] ? { symbol: sorted[sorted.length - 1].symbol, pct: sorted[sorted.length - 1].pnlPct, pnl: sorted[sorted.length - 1].totalPnl } : { symbol: "-", pct: 0, pnl: 0 };

    const totalPnlPct = totalBookValue > 0 ? (totalPnl / totalBookValue) * 100 : 0;

    return { totalValue, totalPnl, totalPnlPct, count: aggregated.length, topGainer, topLoser };
  }, [holdings, currency]);

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <Stat
        label="Portfolio Value"
        value={formatMoney(stats.totalValue, currency)}
        hidden={hidden}
      />
      <div className="h-8 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
      <Stat
        label="Unrealized P&L"
        value={formatMoney(stats.totalPnl, currency)}
        sub={`${stats.totalPnlPct >= 0 ? "+" : ""}${stats.totalPnlPct.toFixed(2)}%`}
        hidden={hidden}
        color={stats.totalPnl >= 0 ? "text-green-600" : "text-red-500"}
      />
      <div className="h-8 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
      <Stat
        label="Positions"
        value={stats.count.toString()}
        hidden={false}
      />
      <div className="h-8 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
      <Stat
        label="Top Gainer (Unrealized)"
        value={stats.topGainer.symbol}
        sub={`+${stats.topGainer.pct.toFixed(1)}%|${hidden ? "•••••" : formatMoney(stats.topGainer.pnl, currency)}`}
        hidden={false}
        color="text-green-600"
      />
      <div className="h-8 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
      <Stat
        label="Top Loser (Unrealized)"
        value={stats.topLoser.symbol}
        sub={`${stats.topLoser.pct.toFixed(1)}%|${hidden ? "•••••" : formatMoney(stats.topLoser.pnl, currency)}`}
        hidden={false}
        color="text-red-500"
      />
    </div>
  );
}
