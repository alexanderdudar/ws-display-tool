// Approximate sector weights for broad ETFs
// Source: fund fact sheets as of mid-2026
export const ETF_SECTOR_WEIGHTS: Record<string, Record<string, number>> = {
  QQQ: {
    Technology: 0.55,
    Consumer: 0.15,
    Healthcare: 0.07,
    "Financial Services": 0.05,
    Industrials: 0.05,
    Energy: 0.03,
    "Real Estate & Utilities": 0.02,
    Other: 0.08,
  },
  QQC: {
    Technology: 0.55,
    Consumer: 0.15,
    Healthcare: 0.07,
    "Financial Services": 0.05,
    Industrials: 0.05,
    Energy: 0.03,
    "Real Estate & Utilities": 0.02,
    Other: 0.08,
  },
  VOO: {
    Technology: 0.32,
    "Financial Services": 0.13,
    Healthcare: 0.12,
    Consumer: 0.20,
    Industrials: 0.09,
    Energy: 0.04,
    "Real Estate & Utilities": 0.05,
    Other: 0.05,
  },
  VFV: {
    Technology: 0.32,
    "Financial Services": 0.13,
    Healthcare: 0.12,
    Consumer: 0.20,
    Industrials: 0.09,
    Energy: 0.04,
    "Real Estate & Utilities": 0.05,
    Other: 0.05,
  },
  SPY: {
    Technology: 0.32,
    "Financial Services": 0.13,
    Healthcare: 0.12,
    Consumer: 0.20,
    Industrials: 0.09,
    Energy: 0.04,
    "Real Estate & Utilities": 0.05,
    Other: 0.05,
  },
};

export function getETFBreakdown(symbol: string): Record<string, number> | null {
  const clean = symbol.split(" ")[0].trim();
  return ETF_SECTOR_WEIGHTS[clean] || null;
}
