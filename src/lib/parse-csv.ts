import Papa from "papaparse";
import { HoldingRaw, Holding } from "./types";
import { getSector } from "./sector-map";

export function parseHoldingsCSV(csvText: string): Holding[] {
  const result = Papa.parse<HoldingRaw>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data
    .filter((row) => row.Symbol && row["Security Type"])
    .map((row): Holding => {
      const symbol = row.Symbol.trim();
      const securityType = row["Security Type"].trim() as Holding["securityType"];

      const accountName = row["Account Name"]?.replace(/"/g, "") || "";
      const rawAccountType = row["Account Type"]?.replace(/"/g, "") || "";
      const accountType = accountName === "private_equity" ? "Private Equity" : rawAccountType;

      return {
        accountName,
        accountType,
        accountNumber: row["Account Number"] || "",
        symbol,
        exchange: row.Exchange || "",
        name: row.Name || "",
        securityType,
        quantity: parseFloat(row.Quantity) || 0,
        direction: (row["Position Direction"] as "LONG" | "SHORT") || "LONG",
        marketPrice: parseFloat(row["Market Price"]) || 0,
        marketPriceCurrency: row["Market Price Currency"] || "USD",
        bookValueCAD: parseFloat(row["Book Value (CAD)"]) || 0,
        bookValueMarket: parseFloat(row["Book Value (Market)"]) || 0,
        bookValueMarketCurrency: row["Book Value Currency (Market)"] || "USD",
        marketValue: parseFloat(row["Market Value"]) || 0,
        marketValueCurrency: row["Market Value Currency"] || "USD",
        unrealizedReturn: parseFloat(row["Market Unrealized Returns"]) || 0,
        unrealizedReturnCurrency: row["Market Unrealized Returns Currency"] || "USD",
        sector: getSector(symbol),
      };
    });
}
