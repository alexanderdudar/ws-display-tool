const SECTOR_MAP: Record<string, string> = {
  // Technology (includes semis, software, fintech, communication/media)
  AAPL: "Technology", MSFT: "Technology", GOOGL: "Technology", GOOG: "Technology",
  META: "Technology", NVDA: "Technology", AMD: "Technology", INTC: "Technology",
  AVGO: "Technology", CSCO: "Technology", ORCL: "Technology", CRM: "Technology",
  ADBE: "Technology", NOW: "Technology", IBM: "Technology", TXN: "Technology",
  QCOM: "Technology", AMAT: "Technology", MU: "Technology", LRCX: "Technology",
  KLAC: "Technology", SNPS: "Technology", CDNS: "Technology", MRVL: "Technology",
  NXPI: "Technology", ADI: "Technology", MPWR: "Technology", ON: "Technology",
  ENTG: "Technology", DELL: "Technology", HPE: "Technology", MSI: "Technology",
  KEYS: "Technology", FFIV: "Technology", IT: "Technology", PLTR: "Technology",
  PANW: "Technology", CRWD: "Technology", DDOG: "Technology", SNOW: "Technology",
  MDB: "Technology", HUBS: "Technology", TWLO: "Technology", ZM: "Technology",
  PYPL: "Technology", FIS: "Technology", GPN: "Technology", FISV: "Technology",
  INTU: "Technology", PAYX: "Technology", BR: "Technology", NDAQ: "Technology",
  ANET: "Technology", TRMB: "Technology", PTC: "Technology",
  ANSS: "Technology", ZBRA: "Technology", STX: "Technology", WDC: "Technology",
  MSTR: "Technology", APP: "Technology", CRWV: "Technology", ALAB: "Technology",
  GLW: "Technology", TEL: "Technology", APH: "Technology", VRT: "Technology",
  HOOD: "Technology", RKLB: "Technology", GRMN: "Technology", VRSK: "Technology", TSM: "Technology",
  VRSN: "Technology", CLSK: "Technology", NBIS: "Technology",
  // Communication / Media → Technology
  NFLX: "Technology", DIS: "Technology", CMCSA: "Technology",
  T: "Technology", VZ: "Technology", TMUS: "Technology",
  EA: "Technology", TTWO: "Technology", WBD: "Technology",
  FOX: "Technology", NWS: "Technology", FWONA: "Technology",
  FWONK: "Technology", Z: "Technology", GDDY: "Technology",
  EBAY: "Technology", ASTS: "Technology", MELI: "Technology",

  // Financial Services
  JPM: "Financial Services", BAC: "Financial Services", WFC: "Financial Services",
  GS: "Financial Services", MS: "Financial Services", C: "Financial Services",
  BLK: "Financial Services", SCHW: "Financial Services", AXP: "Financial Services",
  V: "Financial Services", MA: "Financial Services", COF: "Financial Services",
  PNC: "Financial Services", USB: "Financial Services", TFC: "Financial Services",
  BNY: "Financial Services", STT: "Financial Services", "BRK.B": "Financial Services",
  AMP: "Financial Services", RJF: "Financial Services", LPLA: "Financial Services",
  FCNCA: "Financial Services", RF: "Financial Services", CFG: "Financial Services",
  ICE: "Financial Services", CME: "Financial Services", MCO: "Financial Services",
  SPGI: "Financial Services", FNF: "Financial Services", APO: "Financial Services",
  ARES: "Financial Services", KKR: "Financial Services", ALL: "Financial Services",
  TRV: "Financial Services", HIG: "Financial Services", AFL: "Financial Services",
  MET: "Financial Services", CINF: "Financial Services", WRB: "Financial Services",
  ACGL: "Financial Services", XYZ: "Financial Services", SOFI: "Financial Services", WTW: "Financial Services",

  // Healthcare
  UNH: "Healthcare", JNJ: "Healthcare", LLY: "Healthcare", MRK: "Healthcare",
  ABBV: "Healthcare", PFE: "Healthcare", TMO: "Healthcare", ABT: "Healthcare",
  AMGN: "Healthcare", GILD: "Healthcare", ISRG: "Healthcare", VRTX: "Healthcare",
  SYK: "Healthcare", BDX: "Healthcare", EW: "Healthcare", BSX: "Healthcare",
  MDT: "Healthcare", ZBH: "Healthcare", ALNY: "Healthcare", BIIB: "Healthcare",
  CI: "Healthcare", ELV: "Healthcare", HUM: "Healthcare", CVS: "Healthcare",
  IQV: "Healthcare", DGX: "Healthcare", LH: "Healthcare", INCY: "Healthcare",
  INSM: "Healthcare", PODD: "Healthcare", STE: "Healthcare", WST: "Healthcare",
  A: "Healthcare", WAT: "Healthcare", RPRX: "Healthcare", COO: "Healthcare",
  MDLN: "Healthcare", ZTS: "Healthcare",

  // Consumer (cyclical + defensive merged)
  AMZN: "Consumer", TSLA: "Consumer", HD: "Consumer",
  NKE: "Consumer", SBUX: "Consumer", MCD: "Consumer",
  TJX: "Consumer", BKNG: "Consumer", LOW: "Consumer",
  CMG: "Consumer", ORLY: "Consumer", AZO: "Consumer",
  ROST: "Consumer", DHI: "Consumer", LVS: "Consumer",
  HLT: "Consumer", MAR: "Consumer", DRI: "Consumer",
  YUM: "Consumer", DPZ: "Consumer", BBY: "Consumer",
  BURL: "Consumer", EXPE: "Consumer", ABNB: "Consumer",
  UBER: "Consumer", DASH: "Consumer", CVNA: "Consumer",
  F: "Consumer", GM: "Consumer", TSCO: "Consumer",
  NVR: "Consumer", LYV: "Consumer", GPC: "Consumer",
  PG: "Consumer", KO: "Consumer", PEP: "Consumer",
  COST: "Consumer", WMT: "Consumer", PM: "Consumer",
  MO: "Consumer", CL: "Consumer", KMB: "Consumer",
  MDLZ: "Consumer", GIS: "Consumer", HSY: "Consumer",
  KHC: "Consumer", KDP: "Consumer", CHD: "Consumer",
  MKC: "Consumer", SYY: "Consumer", ADM: "Consumer",
  STZ: "Consumer", MNST: "Consumer", KVUE: "Consumer",
  TGT: "Consumer",

  // Industrials (includes basic materials)
  CAT: "Industrials", HON: "Industrials", UNP: "Industrials", UPS: "Industrials",
  GE: "Industrials", GEV: "Industrials", RTX: "Industrials", BA: "Industrials",
  LMT: "Industrials", DE: "Industrials", ETN: "Industrials", EMR: "Industrials",
  GD: "Industrials", NSC: "Industrials", CSX: "Industrials", FDX: "Industrials",
  WAB: "Industrials", DAL: "Industrials", URI: "Industrials", PWR: "Industrials",
  ROK: "Industrials", DOV: "Industrials", AME: "Industrials", FTV: "Industrials",
  CMI: "Industrials", FAST: "Industrials", ODFL: "Industrials", JBHT: "Industrials",
  TXT: "Industrials", GWW: "Industrials", HWM: "Industrials", TDG: "Industrials",
  AJG: "Industrials", AON: "Industrials", MMM: "Industrials", EME: "Industrials",
  FIX: "Industrials", JCI: "Industrials", XYL: "Industrials", AXON: "Industrials",
  "HEI.A": "Industrials", CARR: "Industrials", VLTO: "Industrials",
  ALLE: "Industrials", RSG: "Industrials", WM: "Industrials", ROP: "Industrials",
  // Basic Materials → Industrials
  LIN: "Industrials", APD: "Industrials", SHW: "Industrials",
  NEM: "Industrials", NUE: "Industrials", STLD: "Industrials",
  DOW: "Industrials", LYB: "Industrials", PPG: "Industrials",
  AVY: "Industrials", IFF: "Industrials", PKG: "Industrials",
  AMCR: "Industrials", CRH: "Industrials", SCCO: "Industrials",
  CTVA: "Industrials",

  // Energy
  XOM: "Energy", CVX: "Energy", COP: "Energy", SLB: "Energy",
  EOG: "Energy", OXY: "Energy", MPC: "Energy", VLO: "Energy",
  PSX: "Energy", FANG: "Energy", WMB: "Energy", TRGP: "Energy",
  EXE: "Energy", BE: "Energy", CEG: "Energy", VST: "Energy",

  // Utilities & Real Estate (merged — both are yield/defensive)
  NEE: "Real Estate & Utilities", DUK: "Real Estate & Utilities",
  SO: "Real Estate & Utilities", D: "Real Estate & Utilities",
  AEP: "Real Estate & Utilities", EXC: "Real Estate & Utilities",
  SRE: "Real Estate & Utilities", PEG: "Real Estate & Utilities",
  ED: "Real Estate & Utilities", WEC: "Real Estate & Utilities",
  EIX: "Real Estate & Utilities", DTE: "Real Estate & Utilities",
  FE: "Real Estate & Utilities", PPL: "Real Estate & Utilities",
  CNP: "Real Estate & Utilities", AWK: "Real Estate & Utilities",
  XEL: "Real Estate & Utilities",
  PLD: "Real Estate & Utilities", AMT: "Real Estate & Utilities",
  CCI: "Real Estate & Utilities", EQIX: "Real Estate & Utilities",
  SPG: "Real Estate & Utilities",
  O: "Real Estate & Utilities", VICI: "Real Estate & Utilities",
  EQR: "Real Estate & Utilities", AVB: "Real Estate & Utilities",
  EXR: "Real Estate & Utilities", IRM: "Real Estate & Utilities",
  KIM: "Real Estate & Utilities", WPC: "Real Estate & Utilities",

  // ETFs — classified by dominant sector exposure
  SMH: "Technology",    // VanEck Semiconductor ETF → 100% tech
  SOXL: "Technology",   // 3x leveraged semiconductors → 100% tech
  QQC: "Technology",    // Nasdaq 100 → ~55% tech dominant
  QQQ: "Technology",    // Nasdaq 100 → ~55% tech dominant
  MTRX: "Technology",   // AI infrastructure → ~90% tech
  EUV: "Technology",    // Lithography & semi photonics → 100% tech
  QTUM: "Technology",   // Quantum computing / AI → ~90% tech
  SSPC: "Other",        // 2x short SPAC — speculative
  VFV: "Other",         // S&P 500 — fully diversified
  VOO: "Other",         // S&P 500 — fully diversified
  SPY: "Other",         // S&P 500 — fully diversified
  SVR: "Industrials",   // Silver bullion — commodity
  CGL: "Industrials",   // iShares Canadian Gold Index ETF — commodity
  PSA: "Financial Services",   // Purpose HISA — held in PE account
  WSE300: "Financial Services", // WS Private Equity fund
};

export function getSector(symbol: string): string {
  const clean = symbol.split(" ")[0].trim();
  return SECTOR_MAP[clean] || "Other";
}

export function getAllSectors(): string[] {
  return [
    "Technology",
    "Financial Services",
    "Healthcare",
    "Consumer",
    "Industrials",
    "Energy",
    "Real Estate & Utilities",
    "Other",
  ];
}
