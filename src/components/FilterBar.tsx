"use client";

import { SecurityTypeLabel } from "@/lib/types";

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
}

function Chip({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3.5 rounded-full font-medium transition-all duration-200
        ${sub ? "py-1.5" : "py-1.5"}
        ${
          active
            ? "bg-[#3a3a3c] dark:bg-white/20 text-white shadow-sm"
            : "bg-[#f5f5f7] dark:bg-white/10 text-[#86868b] hover:bg-[#e8e8ed] dark:hover:bg-white/15"
        }
      `}
    >
      <span className="block text-left text-[13px]">{label}</span>
      {sub && <span className={`block text-left text-[10px] leading-tight ${active ? "text-white/50" : "text-[#86868b]/50"}`}>{sub}</span>}
    </button>
  );
}

export function FilterBar({
  accounts,
  accountTypeMap,
  selectedAccounts,
  onToggleAccount,
  onSelectAllAccounts,
  securityTypes,
  selectedTypes,
  onToggleType,
  onSelectAllTypes,
}: Props) {
  const allAccountsSelected = selectedAccounts.size === accounts.length;
  const allTypesSelected = selectedTypes.size === securityTypes.length;

  return (
    <div className="w-[90%] max-w-[1800px] mx-auto space-y-3 py-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-[#86868b] uppercase tracking-wide mr-1">
          Accounts
        </span>
        <Chip
          label="All"
          active={allAccountsSelected}
          onClick={onSelectAllAccounts}
        />
        {accounts.map((account) => (
          <Chip
            key={account}
            label={account}
            sub={accountTypeMap[account]}
            active={selectedAccounts.has(account)}
            onClick={() => onToggleAccount(account)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-[#86868b] uppercase tracking-wide mr-1">
          Type
        </span>
        <Chip
          label="All"
          active={allTypesSelected}
          onClick={onSelectAllTypes}
        />
        {securityTypes.map((type) => (
          <Chip
            key={type}
            label={type}
            active={selectedTypes.has(type)}
            onClick={() => onToggleType(type)}
          />
        ))}
      </div>
    </div>
  );
}
