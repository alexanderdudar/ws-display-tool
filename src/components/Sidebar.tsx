"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { SecurityTypeLabel, Currency } from "@/lib/types";

interface Props {
  accounts: string[];
  accountTypeMap: Record<string, string>;
  selectedAccounts: Set<string>;
  onToggleAccount: (account: string) => void;
  onSelectAllAccounts: () => void;
  securityTypes: SecurityTypeLabel[];
  selectedTypes: Set<SecurityTypeLabel>;
  onToggleType: (type: SecurityTypeLabel) => void;
  onSelectAllTypes: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
}

function Dropdown({
  label,
  summary,
  children,
}: {
  label: string;
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col text-left"
      >
        <span className="text-[11px] text-[#86868b] font-medium uppercase tracking-wide">{label}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{summary}</span>
          <ChevronDown className={`w-3 h-3 text-[#86868b] transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-xl border border-black/10 dark:border-white/10 p-2 min-w-[180px] animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
  bold,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  bold?: boolean;
}) {
  return (
    <div onClick={onChange} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-[#f5f5f7] dark:hover:bg-white/5 transition-colors select-none">
      <div
        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? "bg-[#0071e3]"
            : "border border-[#c7c7cc] dark:border-white/25"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className={`text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] ${bold ? "font-medium" : ""}`}>
        {label}
      </span>
    </div>
  );
}

export function Sidebar({
  accounts,
  accountTypeMap,
  selectedAccounts,
  onToggleAccount,
  onSelectAllAccounts,
  securityTypes,
  selectedTypes,
  onToggleType,
  onSelectAllTypes,
  currency,
  onCurrencyChange,
}: Props) {
  const allAccountsSelected = selectedAccounts.size === accounts.length;
  const allTypesSelected = selectedTypes.size === securityTypes.length;

  const accountSummary = allAccountsSelected
    ? "All"
    : selectedAccounts.size === 0
    ? "None"
    : `${selectedAccounts.size} of ${accounts.length}`;

  const typeSummary = allTypesSelected
    ? "All"
    : selectedTypes.size === 0
    ? "None"
    : `${selectedTypes.size} of ${securityTypes.length}`;

  return (
    <div className="flex items-center gap-8 flex-wrap justify-end">
      <Dropdown label="Accounts" summary={accountSummary}>
        <CheckItem label="Select All" checked={allAccountsSelected} onChange={onSelectAllAccounts} bold />
        <div className="h-px bg-black/5 dark:bg-white/10 my-1" />
        {accounts.map((account) => (
          <CheckItem
            key={account}
            label={account}
            checked={selectedAccounts.has(account)}
            onChange={() => onToggleAccount(account)}
          />
        ))}
      </Dropdown>

      <div className="h-8 w-px bg-black/10 dark:bg-white/10" />

      <Dropdown label="Type" summary={typeSummary}>
        <CheckItem label="Select All" checked={allTypesSelected} onChange={onSelectAllTypes} bold />
        <div className="h-px bg-black/5 dark:bg-white/10 my-1" />
        {securityTypes.map((type) => (
          <CheckItem
            key={type}
            label={type}
            checked={selectedTypes.has(type)}
            onChange={() => onToggleType(type)}
          />
        ))}
      </Dropdown>

      <div className="h-8 w-px bg-black/10 dark:bg-white/10" />

      <Dropdown label="Currency" summary={currency}>
        <CheckItem label="CAD" checked={currency === "CAD"} onChange={() => onCurrencyChange("CAD")} />
        <CheckItem label="USD" checked={currency === "USD"} onChange={() => onCurrencyChange("USD")} />
      </Dropdown>
    </div>
  );
}
