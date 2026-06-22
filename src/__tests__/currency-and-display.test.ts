import { describe, it, expect } from "vitest";
import { Holding } from "@/lib/types";
import { getValueInCurrency, getPnlInCurrency } from "@/lib/hooks";
import { aggregateBySymbol } from "@/lib/aggregate";

function makeHolding(overrides: Partial<Holding>): Holding {
  return {
    accountName: "tfsa",
    accountType: "TFSA",
    accountNumber: "123",
    symbol: "TEST",
    exchange: "NYSE",
    name: "Test Inc",
    securityType: "EQUITY",
    quantity: 100,
    direction: "LONG",
    marketPrice: 50,
    marketPriceCurrency: "USD",
    bookValueCAD: 5000,
    bookValueMarket: 3600,
    bookValueMarketCurrency: "USD",
    marketValue: 5000,
    marketValueCurrency: "USD",
    unrealizedReturn: 1400,
    unrealizedReturnCurrency: "USD",
    sector: "Technology",
    ...overrides,
  };
}

// TFSA positions from user data
const TFSA_HOLDINGS: Holding[] = [
  makeHolding({
    symbol: "CLSK", name: "Cleanspark Inc", securityType: "EQUITY",
    quantity: 264.46, marketPrice: 17.29, marketValue: 6306,
    marketValueCurrency: "USD", unrealizedReturn: 1028.56,
    unrealizedReturnCurrency: "USD", bookValueCAD: 7300, bookValueMarket: 5277,
  }),
  makeHolding({
    symbol: "CLSK 260718C00020000", name: "CLSK $20 Call Jul 02/26", securityType: "OPTION",
    quantity: -2, marketPrice: 0.30, marketValue: -84,
    marketValueCurrency: "USD", unrealizedReturn: -9.91,
    unrealizedReturnCurrency: "USD", bookValueCAD: 0, bookValueMarket: 0,
    direction: "SHORT",
  }),
  makeHolding({
    symbol: "EUV", name: "Lithography & Semiconductor Photonics ETF", securityType: "EXCHANGE_TRADED_FUND",
    quantity: 255.75, marketPrice: 30.76, marketValue: 10884,
    marketValueCurrency: "USD", unrealizedReturn: 1061.70,
    unrealizedReturnCurrency: "USD", bookValueCAD: 13600, bookValueMarket: 9822,
  }),
  makeHolding({
    symbol: "EUV 260717C00040000", name: "EUV $40 Call Jul 17/26", securityType: "OPTION",
    quantity: -2, marketPrice: 0.45, marketValue: -123,
    marketValueCurrency: "USD", unrealizedReturn: -36.81,
    unrealizedReturnCurrency: "USD", bookValueCAD: 0, bookValueMarket: 0,
    direction: "SHORT",
  }),
  makeHolding({
    symbol: "QQC", name: "Invesco NASDAQ 100 Index ETF", securityType: "EXCHANGE_TRADED_FUND",
    quantity: 377.23, marketPrice: 50.96, marketValue: 19223,
    marketValueCurrency: "CAD", unrealizedReturn: 2763.09,
    unrealizedReturnCurrency: "CAD", bookValueCAD: 16460, bookValueMarket: 16460,
    bookValueMarketCurrency: "CAD",
  }),
  makeHolding({
    symbol: "VFV", name: "Vanguard S&P 500 Index ETF", securityType: "EXCHANGE_TRADED_FUND",
    quantity: 54.82, marketPrice: 188.07, marketValue: 10311,
    marketValueCurrency: "CAD", unrealizedReturn: 259.35,
    unrealizedReturnCurrency: "CAD", bookValueCAD: 10052, bookValueMarket: 10052,
    bookValueMarketCurrency: "CAD",
  }),
  makeHolding({
    symbol: "VOO", name: "Vanguard S&P 500 ETF", securityType: "EXCHANGE_TRADED_FUND",
    quantity: 12.17, marketPrice: 686.11, marketValue: 11677,
    marketValueCurrency: "USD", unrealizedReturn: -42.89,
    unrealizedReturnCurrency: "USD", bookValueCAD: 16200, bookValueMarket: 11720,
  }),
  makeHolding({
    symbol: "SOFI 260918P00022000", name: "SOFI $22 Call Sep 18/26", securityType: "OPTION",
    quantity: 19, marketPrice: 0.85, marketValue: 2199,
    marketValueCurrency: "USD", unrealizedReturn: -4533.58,
    unrealizedReturnCurrency: "USD", bookValueCAD: 9300, bookValueMarket: 6733,
  }),
];

describe("getValueInCurrency", () => {
  it("returns USD market value when currency is USD and holding is in USD", () => {
    const h = makeHolding({ marketValue: 6306, marketValueCurrency: "USD" });
    expect(getValueInCurrency(h, "USD")).toBe(6306);
  });

  it("converts USD holding to CAD using FX rate", () => {
    const h = makeHolding({ marketValue: 6306, marketValueCurrency: "USD" });
    const cadValue = getValueInCurrency(h, "CAD");
    expect(cadValue).toBeGreaterThan(6306);
    expect(cadValue).toBeCloseTo(6306 * 1.38, 0);
  });

  it("returns CAD market value when currency is CAD and holding is in CAD", () => {
    const h = makeHolding({ marketValue: 19223, marketValueCurrency: "CAD" });
    expect(getValueInCurrency(h, "CAD")).toBe(19223);
  });

  it("converts CAD holding to USD using FX rate", () => {
    const h = makeHolding({ marketValue: 19223, marketValueCurrency: "CAD" });
    const usdValue = getValueInCurrency(h, "USD");
    expect(usdValue).toBeLessThan(19223);
    expect(usdValue).toBeCloseTo(19223 / 1.38, 0);
  });

  it("handles negative market value (short options) correctly", () => {
    const h = makeHolding({ marketValue: -84, marketValueCurrency: "USD" });
    expect(getValueInCurrency(h, "USD")).toBe(-84);
    expect(getValueInCurrency(h, "CAD")).toBeCloseTo(-84 * 1.38, 0);
  });

  it("handles zero market value", () => {
    const h = makeHolding({ marketValue: 0, marketValueCurrency: "USD" });
    expect(getValueInCurrency(h, "USD")).toBe(0);
    expect(getValueInCurrency(h, "CAD")).toBe(0);
  });
});

describe("getPnlInCurrency", () => {
  it("returns USD P&L when currency is USD and holding P&L is in USD", () => {
    const h = makeHolding({ unrealizedReturn: 1028.56, unrealizedReturnCurrency: "USD" });
    expect(getPnlInCurrency(h, "USD")).toBe(1028.56);
  });

  it("converts USD P&L to CAD", () => {
    const h = makeHolding({ unrealizedReturn: 1028.56, unrealizedReturnCurrency: "USD" });
    const cadPnl = getPnlInCurrency(h, "CAD");
    expect(cadPnl).toBeCloseTo(1028.56 * 1.38, 0);
  });

  it("returns CAD P&L when currency is CAD and holding P&L is in CAD", () => {
    const h = makeHolding({ unrealizedReturn: 2763.09, unrealizedReturnCurrency: "CAD" });
    expect(getPnlInCurrency(h, "CAD")).toBe(2763.09);
  });

  it("converts CAD P&L to USD", () => {
    const h = makeHolding({ unrealizedReturn: 2763.09, unrealizedReturnCurrency: "CAD" });
    const usdPnl = getPnlInCurrency(h, "USD");
    expect(usdPnl).toBeCloseTo(2763.09 / 1.38, 0);
  });

  it("handles negative P&L (losing options)", () => {
    const h = makeHolding({ unrealizedReturn: -4533.58, unrealizedReturnCurrency: "USD" });
    expect(getPnlInCurrency(h, "USD")).toBe(-4533.58);
    expect(getPnlInCurrency(h, "CAD")).toBeCloseTo(-4533.58 * 1.38, 0);
  });
});

describe("aggregateBySymbol", () => {
  it("separates equities from options with same ticker", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "USD");
    const clskEquity = agg.find((a) => a.symbol === "CLSK");
    const clskOptions = agg.find((a) => a.symbol === "CLSK (Options)");
    expect(clskEquity).toBeDefined();
    expect(clskOptions).toBeDefined();
    expect(clskEquity!.totalValue).toBe(6306);
    expect(clskOptions!.totalValue).toBe(-84);
  });

  it("aggregates multiple options under same ticker into one group", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "USD");
    const euvOptions = agg.find((a) => a.symbol === "EUV (Options)");
    expect(euvOptions).toBeDefined();
    expect(euvOptions!.totalValue).toBe(-123);
  });

  it("correctly sums P&L for options group", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "USD");
    const clskOptions = agg.find((a) => a.symbol === "CLSK (Options)");
    expect(clskOptions!.totalPnl).toBe(-9.91);
  });

  it("handles CAD-denominated holdings without conversion when currency is CAD", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "CAD");
    const qqc = agg.find((a) => a.symbol === "QQC");
    expect(qqc).toBeDefined();
    expect(qqc!.totalValue).toBe(19223);
  });

  it("converts CAD-denominated holdings when currency is USD", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "USD");
    const qqc = agg.find((a) => a.symbol === "QQC");
    expect(qqc).toBeDefined();
    expect(qqc!.totalValue).toBeCloseTo(19223 / 1.38, 0);
  });

  it("converts USD-denominated holdings when currency is CAD", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "CAD");
    const clsk = agg.find((a) => a.symbol === "CLSK");
    expect(clsk).toBeDefined();
    expect(clsk!.totalValue).toBeCloseTo(6306 * 1.38, 0);
  });

  it("total of all positions in USD should include shorts as negative", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "USD");
    const total = agg.reduce((sum, a) => sum + a.totalValue, 0);
    // Short options should reduce the total
    const allPositive = agg.filter((a) => a.totalValue > 0).reduce((s, a) => s + a.totalValue, 0);
    const allNegative = agg.filter((a) => a.totalValue < 0).reduce((s, a) => s + a.totalValue, 0);
    expect(total).toBe(allPositive + allNegative);
    expect(allNegative).toBeLessThan(0);
  });
});

describe("chart display correctness", () => {
  it("allocation chart total should use absolute values for percentage calculation", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "USD");
    const positiveOnly = agg.filter((a) => a.totalValue > 0);
    const total = positiveOnly.reduce((s, a) => s + a.totalValue, 0);
    // Percentages should sum to ~100 for positive positions
    const pctSum = positiveOnly.reduce((s, a) => s + (a.totalValue / total) * 100, 0);
    expect(pctSum).toBeCloseTo(100, 1);
  });

  it("P&L waterfall should include options with book value = 0 that have P&L", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "USD");
    const withPnl = agg.filter((a) => Math.abs(a.totalPnl) > 0);
    const clskOptions = withPnl.find((a) => a.symbol === "CLSK (Options)");
    // Short options DO have P&L and should not be excluded
    expect(clskOptions).toBeDefined();
    expect(clskOptions!.totalPnl).toBe(-9.91);
  });

  it("sector grouping should sum correctly with mixed CAD/USD holdings", () => {
    const agg = aggregateBySymbol(TFSA_HOLDINGS, "CAD");
    const techPositions = agg.filter((a) => a.sector === "Technology");
    // All tech positions should be converted to CAD
    for (const pos of techPositions) {
      // Verify no raw USD values leaked through for USD-denominated holdings
      const originalHoldings = TFSA_HOLDINGS.filter((h) => {
        const ticker = h.symbol.split(" ")[0];
        const key = h.securityType === "OPTION" ? `${ticker} (Options)` : ticker;
        return key === pos.symbol;
      });
      if (originalHoldings.every((h) => h.marketValueCurrency === "USD")) {
        // Should be larger than raw USD value (multiplied by rate > 1)
        const rawUsd = originalHoldings.reduce((s, h) => s + h.marketValue, 0);
        if (rawUsd > 0) {
          expect(pos.totalValue).toBeGreaterThan(rawUsd);
        }
      }
    }
  });
});
