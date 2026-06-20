export interface HoldingRaw {
  "Account Name": string;
  "Account Type": string;
  "Account Classification": string;
  "Account Number": string;
  Symbol: string;
  Exchange: string;
  MIC: string;
  Name: string;
  "Security Type": string;
  Quantity: string;
  "Position Direction": string;
  "Market Price": string;
  "Market Price Currency": string;
  "Book Value (CAD)": string;
  "Book Value Currency (CAD)": string;
  "Book Value (Market)": string;
  "Book Value Currency (Market)": string;
  "Market Value": string;
  "Market Value Currency": string;
  "Market Unrealized Returns": string;
  "Market Unrealized Returns Currency": string;
}

export interface Holding {
  accountName: string;
  accountType: string;
  accountNumber: string;
  symbol: string;
  exchange: string;
  name: string;
  securityType: "EQUITY" | "EXCHANGE_TRADED_FUND" | "OPTION" | "MUTUAL_FUND";
  quantity: number;
  direction: "LONG" | "SHORT";
  marketPrice: number;
  marketPriceCurrency: string;
  bookValueCAD: number;
  bookValueMarket: number;
  bookValueMarketCurrency: string;
  marketValue: number;
  marketValueCurrency: string;
  unrealizedReturn: number;
  unrealizedReturnCurrency: string;
  sector?: string;
}

export type SecurityTypeLabel = "Equities" | "ETFs" | "Options" | "Mutual Funds";

export const SECURITY_TYPE_MAP: Record<string, SecurityTypeLabel> = {
  EQUITY: "Equities",
  EXCHANGE_TRADED_FUND: "ETFs",
  OPTION: "Options",
  MUTUAL_FUND: "Mutual Funds",
};

export function getAccountDisplayName(accountName: string): string {
  return accountName;
}

export type Currency = "CAD" | "USD";
