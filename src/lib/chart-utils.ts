import { Currency } from "./types";

export const TOOLTIP_STYLE: React.CSSProperties = {
  background: "rgba(30, 30, 30, 0.95)",
  border: "none",
  borderRadius: "10px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
  fontSize: "13px",
  color: "#f5f5f7",
  padding: "8px 12px",
};

export const TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  color: "#f5f5f7",
};

export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "#86868b",
  fontSize: "12px",
  marginBottom: "2px",
};

export function formatChartValue(value: number, currency: Currency, hidden: boolean): string {
  if (hidden) return "•••••";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
