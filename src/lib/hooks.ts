"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Holding, Currency, SECURITY_TYPE_MAP, SecurityTypeLabel } from "./types";
import { parseHoldingsCSV } from "./parse-csv";
import { getSector } from "./sector-map";

const STORAGE_KEY = "ws-display-tool-holdings-v2";
const CURRENCY_KEY = "ws-display-tool-currency";
const FX_KEY = "ws-display-tool-fx-rate";

function deriveUsdCadRate(holdings: Holding[]): number {
  let sumCAD = 0;
  let sumMarket = 0;
  for (const h of holdings) {
    if (h.marketValueCurrency === "USD" && h.bookValueCAD > 0 && h.bookValueMarket > 0) {
      sumCAD += h.bookValueCAD;
      sumMarket += h.bookValueMarket;
    }
  }
  return sumMarket > 0 ? sumCAD / sumMarket : 1.38;
}

let _usdCadRate = 1.38;

export function getUsdCadRate(): number {
  return _usdCadRate;
}

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedRate = localStorage.getItem(FX_KEY);
    if (storedRate) _usdCadRate = parseFloat(storedRate);

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Holding[];
        setHoldings(parsed.map((h) => ({ ...h, sector: getSector(h.symbol) })));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  const uploadCSV = useCallback((csvText: string) => {
    const parsed = parseHoldingsCSV(csvText);
    const rate = deriveUsdCadRate(parsed);
    _usdCadRate = rate;
    localStorage.setItem(FX_KEY, rate.toString());
    setHoldings(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  }, []);

  const clearData = useCallback(() => {
    setHoldings([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { holdings, loaded, uploadCSV, clearData };
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("CAD");

  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_KEY);
    if (stored === "CAD" || stored === "USD") setCurrency(stored);
  }, []);

  const setCurrencyAndStore = useCallback((c: Currency) => {
    setCurrency(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }, []);

  return { currency, setCurrency: setCurrencyAndStore };
}

export function usePrivacyMode() {
  const [hidden, setHidden] = useState(false);
  return { hidden, toggle: () => setHidden((h) => !h) };
}

const THEME_KEY = "ws-display-tool-theme";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      if (prefersDark) document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(THEME_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_KEY, "light");
      }
      return next;
    });
  }, []);

  return { darkMode, toggle };
}

export function useFilters(holdings: Holding[]) {
  const accounts = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const h of holdings) {
      totals[h.accountName] = (totals[h.accountName] || 0) + h.marketValue;
    }
    return Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  }, [holdings]);

  const accountTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const h of holdings) {
      if (!map[h.accountName]) map[h.accountName] = h.accountType;
    }
    return map;
  }, [holdings]);

  const securityTypes = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const h of holdings) {
      const label = SECURITY_TYPE_MAP[h.securityType];
      if (label) totals[label] = (totals[label] || 0) + h.marketValue;
    }
    return Object.keys(totals).sort((a, b) => totals[b] - totals[a]) as SecurityTypeLabel[];
  }, [holdings]);

  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<SecurityTypeLabel>>(new Set());

  useEffect(() => {
    setSelectedAccounts(new Set(accounts));
  }, [accounts]);

  useEffect(() => {
    setSelectedTypes(new Set(securityTypes));
  }, [securityTypes]);

  const toggleAccount = useCallback((account: string) => {
    setSelectedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(account)) next.delete(account);
      else next.add(account);
      return next;
    });
  }, []);

  const toggleType = useCallback((type: SecurityTypeLabel) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const selectAllAccounts = useCallback(() => {
    setSelectedAccounts((prev) =>
      prev.size === accounts.length ? new Set() : new Set(accounts)
    );
  }, [accounts]);

  const selectAllTypes = useCallback(() => {
    setSelectedTypes((prev) =>
      prev.size === securityTypes.length ? new Set() : new Set(securityTypes)
    );
  }, [securityTypes]);

  const filtered = useMemo(() => {
    if (selectedAccounts.size === 0 || selectedTypes.size === 0) return [];
    return holdings.filter(
      (h) =>
        selectedAccounts.has(h.accountName) &&
        selectedTypes.has(SECURITY_TYPE_MAP[h.securityType])
    );
  }, [holdings, selectedAccounts, selectedTypes]);

  return {
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
  };
}

export function getValueInCurrency(holding: Holding, currency: Currency): number {
  const rate = _usdCadRate;
  const isCAD = holding.marketValueCurrency === "CAD";
  if (currency === "CAD") {
    return isCAD ? holding.marketValue : holding.marketValue * rate;
  }
  return isCAD ? holding.marketValue / rate : holding.marketValue;
}

export function getPnlInCurrency(holding: Holding, currency: Currency): number {
  const rate = _usdCadRate;
  const isCAD = holding.unrealizedReturnCurrency === "CAD";
  if (currency === "CAD") {
    return isCAD ? holding.unrealizedReturn : holding.unrealizedReturn * rate;
  }
  return isCAD ? holding.unrealizedReturn / rate : holding.unrealizedReturn;
}
