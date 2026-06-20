"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SummaryCards } from "./SummaryCards";
import { AllocationChart } from "./AllocationChart";
import { TreemapChart } from "./Treemap";
import { HoldingsSizeChart } from "./HoldingsSizeChart";
import { PnlWaterfall } from "./PnlWaterfall";
import { PositionsTable } from "./PositionsTable";
import { Holding } from "@/lib/types";
import { useFilters, useCurrency, usePrivacyMode, useDarkMode } from "@/lib/hooks";

export type ViewMode = "sector" | "holding" | "account" | "type";

interface Props {
  holdings: Holding[];
  onReupload: () => void;
}

export function Dashboard({ holdings, onReupload }: Props) {
  const { currency, setCurrency } = useCurrency();
  const { hidden, toggle } = usePrivacyMode();
  const { darkMode, toggle: toggleDarkMode } = useDarkMode();
  const [viewMode, setViewMode] = useState<ViewMode>("sector");
  const {
    accounts,
    accountTypeMap,
    securityTypes,
    selectedAccounts,
    selectedTypes,
    toggleAccount,
    toggleType,
    selectAllAccounts,
    selectAllTypes,
    filtered,
  } = useFilters(holdings);

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black">
      <Header
        privacyHidden={hidden}
        onTogglePrivacy={toggle}
        onReupload={onReupload}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      <main className="w-[90%] max-w-[1800px] mx-auto py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SummaryCards holdings={filtered} currency={currency} hidden={hidden} />
          </div>
          <Sidebar
            accounts={accounts}
            accountTypeMap={accountTypeMap}
            selectedAccounts={selectedAccounts}
            onToggleAccount={toggleAccount}
            onSelectAllAccounts={selectAllAccounts}
            securityTypes={securityTypes}
            selectedTypes={selectedTypes}
            onToggleType={toggleType}
            onSelectAllTypes={selectAllTypes}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>
        <div className="flex border-b border-black/5 dark:border-white/10 items-end">
          <span className="text-[14px] text-[#86868b] font-medium pb-2.5">VIEW BY</span>
          <div className="flex gap-6 ml-auto">
          {(["sector", "holding", "account", "type"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`pb-2.5 text-[14px] font-medium transition-colors border-b-2 -mb-px ${
                viewMode === v
                  ? "border-[#0071e3] text-[#1d1d1f] dark:text-[#f5f5f7]"
                  : "border-transparent text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AllocationChart holdings={filtered} currency={currency} hidden={hidden} viewMode={viewMode} />
          <TreemapChart holdings={filtered} currency={currency} hidden={hidden} viewMode={viewMode} />
          <HoldingsSizeChart holdings={filtered} currency={currency} hidden={hidden} viewMode={viewMode} />
          <PnlWaterfall holdings={filtered} currency={currency} hidden={hidden} />
        </div>
        <PositionsTable holdings={filtered} currency={currency} hidden={hidden} />
      </main>
    </div>
  );
}
