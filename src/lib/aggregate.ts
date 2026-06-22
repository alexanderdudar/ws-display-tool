import { Holding, Currency } from "./types";
import { getValueInCurrency, getPnlInCurrency } from "./hooks";

export interface AggregatedPosition {
  symbol: string;
  name: string;
  securityType: Holding["securityType"];
  sector: string;
  totalValue: number;
  totalPnl: number;
  totalBookValue: number;
  pnlPct: number;
}

export function aggregateBySymbol(
  holdings: Holding[],
  currency: Currency
): AggregatedPosition[] {
  const map = new Map<
    string,
    { name: string; securityType: Holding["securityType"]; sector: string; value: number; pnl: number; bookValue: number }
  >();

  for (const h of holdings) {
    const ticker = h.symbol.split(" ")[0];
    const isOption = h.securityType === "OPTION";
    const key = isOption ? `${ticker} (Options)` : ticker;
    const value = getValueInCurrency(h, currency);
    const pnl = getPnlInCurrency(h, currency);
    const bv = currency === "CAD" ? h.bookValueCAD : h.bookValueMarket;

    const existing = map.get(key);
    if (existing) {
      existing.value += value;
      existing.pnl += pnl;
      existing.bookValue += bv;
    } else {
      map.set(key, {
        name: h.name || ticker,
        securityType: h.securityType,
        sector: h.sector || "Other",
        value,
        pnl,
        bookValue: bv,
      });
    }
  }

  return Array.from(map.entries()).map(([symbol, data]) => ({
    symbol,
    name: data.name,
    securityType: data.securityType,
    sector: data.sector,
    totalValue: data.value,
    totalPnl: data.pnl,
    totalBookValue: data.bookValue,
    pnlPct: Math.abs(data.bookValue) > 0 ? (data.pnl / Math.abs(data.bookValue)) * 100 : 0,
  }));
}
