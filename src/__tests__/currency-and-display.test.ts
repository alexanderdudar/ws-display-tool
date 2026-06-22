import { describe, it, expect } from "vitest";
import { Holding } from "@/lib/types";
import { getValueInCurrency, getPnlInCurrency, deriveUsdCadRate } from "@/lib/hooks";
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

describe("deriveUsdCadRate", () => {
  it("derives rate from weighted average of USD holdings book values", () => {
    const holdings = [
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 13800, bookValueMarket: 10000,
      }),
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 6900, bookValueMarket: 5000,
      }),
    ];
    // Weighted: (13800 + 6900) / (10000 + 5000) = 20700 / 15000 = 1.38
    expect(deriveUsdCadRate(holdings)).toBeCloseTo(1.38, 2);
  });

  it("returns fallback 1.38 when portfolio has zero USD holdings", () => {
    const holdings = [
      makeHolding({
        marketValueCurrency: "CAD", bookValueCAD: 10000, bookValueMarket: 10000,
        bookValueMarketCurrency: "CAD",
      }),
      makeHolding({
        marketValueCurrency: "CAD", bookValueCAD: 5000, bookValueMarket: 5000,
        bookValueMarketCurrency: "CAD",
      }),
    ];
    expect(deriveUsdCadRate(holdings)).toBe(1.38);
  });

  it("handles portfolio with only options (zero book values) by using fallback", () => {
    const holdings = [
      makeHolding({
        symbol: "AAPL 260718C00200000", securityType: "OPTION",
        marketValueCurrency: "USD", bookValueCAD: 0, bookValueMarket: 0,
      }),
      makeHolding({
        symbol: "MSFT 260718C00400000", securityType: "OPTION",
        marketValueCurrency: "USD", bookValueCAD: 0, bookValueMarket: 0,
      }),
    ];
    expect(deriveUsdCadRate(holdings)).toBe(1.38);
  });

  it("handles portfolio with one tiny USD holding — still derives from it", () => {
    const holdings = [
      makeHolding({
        marketValueCurrency: "CAD", bookValueCAD: 100000, bookValueMarket: 100000,
        bookValueMarketCurrency: "CAD",
      }),
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 140, bookValueMarket: 100,
      }),
    ];
    // Should use the one USD holding: 140/100 = 1.40
    expect(deriveUsdCadRate(holdings)).toBeCloseTo(1.40, 2);
  });

  it("ignores USD holdings with zero book value CAD", () => {
    const holdings = [
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 0, bookValueMarket: 5000,
      }),
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 7000, bookValueMarket: 5000,
      }),
    ];
    // Only uses the one with valid CAD book value: 7000/5000 = 1.40
    expect(deriveUsdCadRate(holdings)).toBeCloseTo(1.40, 2);
  });

  it("ignores USD holdings with zero book value market", () => {
    const holdings = [
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 5000, bookValueMarket: 0,
      }),
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 6900, bookValueMarket: 5000,
      }),
    ];
    // Only uses valid one: 6900/5000 = 1.38
    expect(deriveUsdCadRate(holdings)).toBeCloseTo(1.38, 2);
  });

  it("uses fallback for non-USD book value when no USD marketValue holdings exist", () => {
    // Someone with only CAD ETFs but one has bookValueMarketCurrency = USD
    // (e.g. VFV which tracks S&P but trades in CAD)
    const holdings = [
      makeHolding({
        symbol: "VFV", marketValueCurrency: "CAD",
        bookValueCAD: 10000, bookValueMarket: 10000,
        bookValueMarketCurrency: "CAD",
      }),
    ];
    expect(deriveUsdCadRate(holdings)).toBe(1.38);
  });

  it("derives from bookValueMarketCurrency fallback when no USD marketValue exists", () => {
    // A holding that has market value in CAD but book value in a different currency
    const holdings = [
      makeHolding({
        symbol: "VOO", marketValueCurrency: "CAD",
        bookValueCAD: 13800, bookValueMarket: 10000,
        bookValueMarketCurrency: "USD",
      }),
    ];
    // Falls through primary check (marketValueCurrency !== USD)
    // Hits fallback: bookValueMarketCurrency !== CAD, so uses bookValueCAD/bookValueMarket
    expect(deriveUsdCadRate(holdings)).toBeCloseTo(1.38, 2);
  });

  it("produces a rate in reasonable range (1.2 - 1.6) for typical portfolios", () => {
    const rate = deriveUsdCadRate(TFSA_HOLDINGS);
    expect(rate).toBeGreaterThan(1.2);
    expect(rate).toBeLessThan(1.6);
  });

  it("large CAD portfolio with single small USD position still gets valid rate", () => {
    const holdings = [
      // Large CAD positions
      makeHolding({ symbol: "VFV", marketValueCurrency: "CAD", bookValueCAD: 50000, bookValueMarket: 50000, bookValueMarketCurrency: "CAD" }),
      makeHolding({ symbol: "QQC", marketValueCurrency: "CAD", bookValueCAD: 30000, bookValueMarket: 30000, bookValueMarketCurrency: "CAD" }),
      makeHolding({ symbol: "XIU", marketValueCurrency: "CAD", bookValueCAD: 20000, bookValueMarket: 20000, bookValueMarketCurrency: "CAD" }),
      // Single small USD position
      makeHolding({ symbol: "AAPL", marketValueCurrency: "USD", bookValueCAD: 700, bookValueMarket: 500 }),
    ];
    const rate = deriveUsdCadRate(holdings);
    // Should derive from the AAPL position: 700/500 = 1.40
    expect(rate).toBeCloseTo(1.40, 2);
  });

  it("empty portfolio returns fallback", () => {
    expect(deriveUsdCadRate([])).toBe(1.38);
  });

  it("does NOT return ~1.0 when CAD holdings have bookValueMarketCurrency defaulting to USD", () => {
    // This simulates a bug where a CAD holding (QQC) has bookValueMarketCurrency
    // incorrectly set to "USD" because the CSV field was empty.
    // bookValueCAD and bookValueMarket would be equal (both in CAD),
    // giving a false ratio of 1.0
    const holdings = [
      makeHolding({
        symbol: "QQC", marketValueCurrency: "CAD",
        bookValueCAD: 16000, bookValueMarket: 16000,
        bookValueMarketCurrency: "USD", // wrong! should be CAD
      }),
    ];
    const rate = deriveUsdCadRate(holdings);
    // Should NOT be 1.0 — the fallback should reject ratios close to 1.0
    // for the USD/CAD pair since that's not realistic
    expect(rate).toBeGreaterThan(1.2);
  });

  it("rejects derived rate below 1.2 as unrealistic for USD/CAD", () => {
    // If book values produce a ratio < 1.2, it's clearly wrong data
    const holdings = [
      makeHolding({
        marketValueCurrency: "USD", bookValueCAD: 1000, bookValueMarket: 1000,
      }),
    ];
    const rate = deriveUsdCadRate(holdings);
    expect(rate).toBeGreaterThan(1.2);
  });
});
