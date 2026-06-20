"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Settings2, Search } from "lucide-react";
import { Holding, Currency, SECURITY_TYPE_MAP, getAccountDisplayName } from "@/lib/types";
import { getValueInCurrency, getPnlInCurrency } from "@/lib/hooks";

function formatOptionName(symbol: string): string {
  const parts = symbol.trim().split(/\s+/);
  if (parts.length < 2) return symbol;
  const ticker = parts[0];
  const contract = parts[1];
  if (contract.length < 15) return symbol;

  const year = contract.slice(0, 2);
  const month = contract.slice(2, 4);
  const day = contract.slice(4, 6);
  const type = contract[6] === "C" ? "Call" : "Put";
  const strike = parseFloat(contract.slice(7)) / 1000;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthName = months[parseInt(month) - 1] || month;

  return `${ticker} $${strike} ${type} ${monthName} ${day}/${year}`;
}

function getDisplayName(holding: Holding): string {
  if (holding.securityType === "OPTION") {
    return formatOptionName(holding.symbol);
  }
  return holding.name || holding.symbol;
}

interface Props {
  holdings: Holding[];
  currency: Currency;
  hidden: boolean;
}

type SortKey = "symbol" | "name" | "account" | "type" | "sector" | "quantity" | "price" | "value" | "pnl" | "pnlPct";
type SortDir = "asc" | "desc";

interface Column {
  key: SortKey;
  label: string;
  default: boolean;
}

const ALL_COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", default: true },
  { key: "name", label: "Name", default: true },
  { key: "account", label: "Account", default: true },
  { key: "type", label: "Type", default: true },
  { key: "sector", label: "Sector", default: true },
  { key: "quantity", label: "Qty", default: true },
  { key: "price", label: "Price", default: true },
  { key: "value", label: "Market Value", default: true },
  { key: "pnl", label: "P&L", default: true },
  { key: "pnlPct", label: "P&L %", default: true },
];

export function PositionsTable({ holdings, currency, hidden }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Set<SortKey>>(
    new Set(ALL_COLUMNS.filter((c) => c.default).map((c) => c.key))
  );

  const rows = useMemo(() => {
    let filtered = holdings;
    if (search) {
      const q = search.toLowerCase();
      filtered = holdings.filter(
        (h) =>
          h.symbol.toLowerCase().includes(q) ||
          h.name.toLowerCase().includes(q)
      );
    }

    return filtered
      .map((h) => {
        const value = getValueInCurrency(h, currency);
        const pnl = getPnlInCurrency(h, currency);
        const bv = currency === "CAD" ? h.bookValueCAD : h.bookValueMarket;
        const pnlPct = bv > 0 ? (pnl / bv) * 100 : 0;
        return { holding: h, value, pnl, pnlPct };
      })
      .sort((a, b) => {
        const ah = a.holding;
        const bh = b.holding;
        let cmp = 0;
        switch (sortKey) {
          case "symbol":
            cmp = ah.symbol.split(" ")[0].localeCompare(bh.symbol.split(" ")[0]);
            break;
          case "name":
            cmp = (ah.name || ah.symbol).localeCompare(bh.name || bh.symbol);
            break;
          case "account":
            cmp = ah.accountName.localeCompare(bh.accountName);
            break;
          case "type":
            cmp = ah.securityType.localeCompare(bh.securityType);
            break;
          case "sector":
            cmp = (ah.sector || "Other").localeCompare(bh.sector || "Other");
            break;
          case "quantity":
            cmp = ah.quantity - bh.quantity;
            break;
          case "price":
            cmp = ah.marketPrice - bh.marketPrice;
            break;
          case "value":
            cmp = a.value - b.value;
            break;
          case "pnl":
            cmp = a.pnl - b.pnl;
            break;
          case "pnlPct":
            cmp = a.pnlPct - b.pnlPct;
            break;
        }
        if (cmp === 0) {
          cmp = ah.symbol.localeCompare(bh.symbol);
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [holdings, currency, sortKey, sortDir, search]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleColumn = (key: SortKey) => {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const fmt = (v: number) =>
    hidden
      ? "•••••"
      : new Intl.NumberFormat("en-CA", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  const fmtPnl = (v: number) =>
    hidden
      ? "•••••"
      : new Intl.NumberFormat("en-CA", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-[18px] border border-black/5 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search positions..."
            className="pl-9 pr-4 py-2 rounded-full bg-[#f5f5f7] dark:bg-white/10 text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] border-none w-72 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="p-2 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-colors"
            >
              <Settings2 className="w-4 h-4 text-[#86868b]" />
            </button>
            {showColumnPicker && (
              <div className="absolute right-0 top-10 z-50 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-xl border border-black/10 dark:border-white/10 p-2 min-w-[180px]">
                {ALL_COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-[#f5f5f7] dark:hover:bg-white/5 transition-colors select-none"
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                      visibleCols.has(col.key) ? "bg-[#0071e3]" : "border border-[#c7c7cc] dark:border-white/25"
                    }`}>
                      {visibleCols.has(col.key) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">{col.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              {ALL_COLUMNS.filter((c) => visibleCols.has(c.key)).map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left py-2 px-2 text-[#86868b] font-medium cursor-pointer hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] select-none whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ holding: h, value, pnl, pnlPct }) => (
              <tr
                key={`${h.accountNumber}-${h.symbol}-${h.exchange}`}
                className="border-b border-black/[0.03] dark:border-white/[0.05] hover:bg-[#f5f5f7]/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                {visibleCols.has("symbol") && (
                  <td className="py-2.5 px-2 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{h.symbol.split(" ")[0]}</td>
                )}
                {visibleCols.has("name") && (
                  <td className="py-2.5 px-2 text-[#86868b] max-w-[200px] truncate">{getDisplayName(h)}</td>
                )}
                {visibleCols.has("account") && (
                  <td className="py-2.5 px-2 text-[#86868b] whitespace-nowrap">
                    {getAccountDisplayName(h.accountName)} <span className="text-[#86868b]/60">· {h.accountType}</span>
                  </td>
                )}
                {visibleCols.has("type") && (
                  <td className="py-2.5 px-2 text-[#86868b]">{SECURITY_TYPE_MAP[h.securityType] || h.securityType}</td>
                )}
                {visibleCols.has("sector") && (
                  <td className="py-2.5 px-2 text-[#86868b]">{h.sector || "Other"}</td>
                )}
                {visibleCols.has("quantity") && (
                  <td className="py-2.5 px-2 tabular-nums">{hidden ? "•••" : h.quantity.toFixed(2)}</td>
                )}
                {visibleCols.has("price") && (
                  <td className="py-2.5 px-2 tabular-nums">{hidden ? "•••" : `$${h.marketPrice.toFixed(2)}`}</td>
                )}
                {visibleCols.has("value") && (
                  <td className="py-2.5 px-2 tabular-nums font-medium">{fmt(value)}</td>
                )}
                {visibleCols.has("pnl") && (
                  <td className={`py-2.5 px-2 tabular-nums font-medium ${pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {fmtPnl(pnl)}
                  </td>
                )}
                {visibleCols.has("pnlPct") && (
                  <td className={`py-2.5 px-2 tabular-nums ${pnlPct >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {hidden ? "•••" : `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-[12px] text-[#86868b]">
        {rows.length} positions
      </div>
    </div>
  );
}
