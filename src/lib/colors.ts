const SECTOR_COLORS: Record<string, string> = {
  Technology: "#0071e3",
  "Financial Services": "#34c759",
  Healthcare: "#af52de",
  Consumer: "#ff9500",
  Industrials: "#5ac8fa",
  Energy: "#ff3b30",
  "Real Estate & Utilities": "#30d158",
  Other: "#ff6482",
};

export const CHART_COLORS = [
  "#0071e3", "#34c759", "#ff9500", "#af52de", "#ff3b30",
  "#5ac8fa", "#d4a017", "#ff2d55", "#64d2ff", "#30d158",
  "#bf5af2", "#5856d6", "#ff6482", "#ac8e68", "#00c7be",
];

export const CATEGORY_COLORS = [
  "#ff9500", "#af52de", "#34c759", "#5ac8fa", "#ff2d55",
  "#00c7be", "#ff6482", "#5856d6", "#d4a017", "#30d158",
];

export function getColorForSector(sector: string): string {
  return SECTOR_COLORS[sector] || SECTOR_COLORS.Other;
}

export function getColorForSymbol(symbol: string, sector?: string): string {
  if (sector && sector !== "Other" && SECTOR_COLORS[sector]) {
    return SECTOR_COLORS[sector];
  }
  return getUniqueColor(symbol);
}

export function getUniqueColor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length];
}

export function getColorByIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
