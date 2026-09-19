// Mock data copied verbatim from the Stitch screen "ISCC Device Health & Hardware Diagnostics".

export const devicesHeader = {
  title: "ISCC // SYS-DIAGNOSTICS",
  secure: "SIPRNET SECURE",
  clockDate: "18 SEP 2026",
  links: [
    { label: "CAMERAS", active: true },
    { label: "NVRS" },
    { label: "TERMINALS" },
    { label: "TELEMETRY" },
    { label: "TOPOLOGY" },
  ],
  unacknowledged: "3 UNACKNOWLEDGED",
  operator: "CAPT. A. VERMA",
  operatorClearance: "IC-78492X · TS-SCI",
  faultReport: "FAULT REPORT",
};

export const railTop = { defcon: "2", state: "NOMINAL" };

export const railTabs = [
  { label: "Feeds", icon: "videocam" },
  { label: "Diag", icon: "memory", active: true },
  { label: "Devices", icon: "router" },
  { label: "Topology", icon: "hub" },
  { label: "Audit", icon: "verified_user" },
];

export const tabs = {
  cameras: { label: "CAMERAS (48)", badge: "ACTIVE" },
  nvrs: { label: "NVRS & RECORDERS (8)", badge: "1 FAULT" },
  terminals: { label: "TERMINALS & WORKSTATIONS (12)", badge: "NOMINAL" },
  searchPlaceholder: "Filter by IP / ID / MAC / Zone...",
  zones: [
    "ALL ZONES (4)",
    "HQ SECURE CORE",
    "PERIMETER EAST",
    "PERIMETER WEST",
    "VEHICLE DEPOT & AMMO",
  ],
  repoll: "RE-POLL ALL INTERFACES",
  export: "EXPORT CSV",
};

export const kpis = {
  total: { label: "TOTAL SENSORS REGISTERED", value: "48", note: "Edge Nodes / Optical / IR Arrays" },
  online: { label: "ONLINE / NOMINAL", value: "45", of: "/ 48", note: "93.75% AVAILABILITY (30D)" },
  offline: {
    label: "CRITICAL OFFLINE",
    value: "2",
    note: "CAM-15 Perim W · CAM-28 Depot N",
    title: "CAM-15 Perimeter W, CAM-28 Depot North",
  },
  degraded: { label: "DEGRADED / FAULT", value: "1", note: "CAM-09 Stream OK / No Rec" },
};

export const matrix = {
  title: "TACTICAL EDGE SENSOR MATRIX",
  showing: "SHOWING 11 PRIORITIZED TELEMETRY CHANNELS",
  legend: [
    { label: "45 OK", tone: "ok" },
    { label: "1 DEG", tone: "warn" },
    { label: "2 ERR", tone: "err" },
  ] as { label: string; tone: Tone }[],
};

export type Tone = "ok" | "warn" | "err";

export type CameraRow = {
  state: Tone;
  id: string;
  name: string;
  tag?: { label: string; pulse?: boolean };
  zone: string;
  ip: string;
  model: string;
  firmware: { text: string; note?: string; tone: Tone };
  stream: { label: string; tone: Tone };
  recording: { label: string; tone: Tone };
  /** `pct` draws the bar; without it only the label is shown (e.g. "0% [N/A]"). */
  storage: { label: string; pct?: number; tone: Tone };
  uptime: { label: string; tone: Tone; strong?: boolean };
  fault: { label: string; tone: Tone };
  actions: { label: string; tone: "default" | "warn" | "err" }[];
};

const std = [{ label: "PING", tone: "default" as const }, { label: "DIAG", tone: "default" as const }];

export const cameras: CameraRow[] = [
  { state: "ok", id: "CAM-01", name: "MAIN GATE ENTRANCE", zone: "HQ", ip: "10.142.12.101", model: "AXIS Q6135-LE", firmware: { text: "v11.8.42", note: "[OK]", tone: "ok" }, stream: { label: "1080P60 RTSP", tone: "ok" }, recording: { label: "ACTIVE [EDGE+NVR]", tone: "ok" }, storage: { label: "64%", pct: 64, tone: "ok" }, uptime: { label: "99.98%", tone: "ok" }, fault: { label: "None (Nominal)", tone: "ok" }, actions: std },
  { state: "ok", id: "CAM-07", name: "PERIMETER E PTZ", zone: "Perimeter E", ip: "10.142.14.107", model: "BOSCH AUTODOME 7000i", firmware: { text: "v7.82.01", note: "[OK]", tone: "ok" }, stream: { label: "4K30 H.265", tone: "ok" }, recording: { label: "ACTIVE [NVR]", tone: "ok" }, storage: { label: "82%", pct: 82, tone: "ok" }, uptime: { label: "99.94%", tone: "ok" }, fault: { label: "None", tone: "ok" }, actions: std },
  { state: "warn", id: "CAM-09", name: "AMMUNITION DUMP B-1", tag: { label: "NO REC" }, zone: "Depot", ip: "10.142.20.109", model: "FLIR FC-644 ID", firmware: { text: "v4.2.1 [PATCH PENDING]", tone: "warn" }, stream: { label: "1080P30 FLIR", tone: "ok" }, recording: { label: "NO RECORDING [STORAGE ERR]", tone: "warn" }, storage: { label: "98% [FULL]", pct: 98, tone: "warn" }, uptime: { label: "98.12%", tone: "warn" }, fault: { label: "Storage write reject (08m ago)", tone: "warn" }, actions: [{ label: "PURGE", tone: "warn" }, { label: "DIAG", tone: "default" }] },
  { state: "ok", id: "CAM-12", name: "ARMOURY VAULT PTZ", zone: "Depot", ip: "10.142.20.112", model: "PELCO SPECTRA PRO", firmware: { text: "v3.14.9", note: "[OK]", tone: "ok" }, stream: { label: "1080P60 TAC", tone: "ok" }, recording: { label: "ACTIVE [REC]", tone: "ok" }, storage: { label: "45%", pct: 45, tone: "ok" }, uptime: { label: "99.99%", tone: "ok" }, fault: { label: "PTZ calibr. 4d ago", tone: "ok" }, actions: std },
  { state: "ok", id: "CAM-14", name: "VEHICLE DEPOT GATE", zone: "Motor Pool", ip: "10.142.30.114", model: "HANWHA XNV-8080R", firmware: { text: "v2.01.0", note: "[OK]", tone: "ok" }, stream: { label: "1080P30", tone: "ok" }, recording: { label: "ACTIVE", tone: "ok" }, storage: { label: "72%", pct: 72, tone: "ok" }, uptime: { label: "99.85%", tone: "ok" }, fault: { label: "None", tone: "ok" }, actions: std },
  { state: "err", id: "CAM-15", name: "PERIMETER W FENCE-04", tag: { label: "OFFLINE", pulse: true }, zone: "Perimeter W", ip: "10.142.16.115", model: "BOSCH MIC IP 7100i", firmware: { text: "v7.80.00 [MISMATCH]", tone: "err" }, stream: { label: "NO SIGNAL / TIMEOUT", tone: "err" }, recording: { label: "DISABLED / OFFLINE", tone: "err" }, storage: { label: "0% [N/A]", tone: "ok" }, uptime: { label: "74.20%", tone: "err" }, fault: { label: "ERR_RTSP_CARRIER_DROP (14:31Z)", tone: "err" }, actions: [{ label: "REBOOT", tone: "err" }, { label: "DIAG", tone: "default" }] },
  { state: "ok", id: "CAM-16", name: "BARRACKS CORRIDOR", zone: "HQ", ip: "10.142.12.116", model: "AXIS P3245-LV", firmware: { text: "v10.2.1", note: "[OK]", tone: "ok" }, stream: { label: "1080P30", tone: "ok" }, recording: { label: "ACTIVE", tone: "ok" }, storage: { label: "51%", pct: 51, tone: "ok" }, uptime: { label: "99.91%", tone: "ok" }, fault: { label: "None", tone: "ok" }, actions: std },
  { state: "ok", id: "CAM-21", name: "MOTOR POOL REAR", zone: "Motor Pool", ip: "10.142.30.121", model: "FLIR PT-606", firmware: { text: "v4.1.9", note: "[OK]", tone: "ok" }, stream: { label: "1080P60", tone: "ok" }, recording: { label: "ACTIVE", tone: "ok" }, storage: { label: "69%", pct: 69, tone: "ok" }, uptime: { label: "99.64%", tone: "ok" }, fault: { label: "None", tone: "ok" }, actions: std },
  { state: "err", id: "CAM-28", name: "DEPOT PERIMETER N", tag: { label: "FIBER FAULT" }, zone: "Depot", ip: "10.142.20.128", model: "AXIS Q1798-LE", firmware: { text: "v11.8.40", note: "[OK]", tone: "ok" }, stream: { label: "LINK DOWN / FIBER LOSS", tone: "err" }, recording: { label: "FAIL / UNREACHABLE", tone: "err" }, storage: { label: "0% [N/A]", tone: "ok" }, uptime: { label: "81.50%", tone: "err" }, fault: { label: "FIBER_TRANSCEIVER_FAULT (02h ago)", tone: "err" }, actions: [{ label: "REBOOT", tone: "err" }, { label: "DIAG", tone: "default" }] },
  { state: "ok", id: "CAM-33", name: "FUEL STORAGE S", zone: "Depot", ip: "10.142.20.133", model: "PELCO SARIX", firmware: { text: "v3.12.0", note: "[OK]", tone: "ok" }, stream: { label: "1080P30", tone: "ok" }, recording: { label: "ACTIVE", tone: "ok" }, storage: { label: "77%", pct: 77, tone: "ok" }, uptime: { label: "99.88%", tone: "ok" }, fault: { label: "None", tone: "ok" }, actions: std },
  { state: "ok", id: "CAM-42", name: "HQ SCIF ACCESS", zone: "HQ", ip: "10.142.10.142", model: "SONY SNC-VB770", firmware: { text: "v5.4.1", note: "[OK]", tone: "ok" }, stream: { label: "1080P60", tone: "ok" }, recording: { label: "ACTIVE [ENCRYPTED]", tone: "ok" }, storage: { label: "38%", pct: 38, tone: "ok" }, uptime: { label: "100.0%", tone: "ok", strong: true }, fault: { label: "None", tone: "ok" }, actions: std },
];

export const nvrPanel = {
  title: "NVR STORAGE & CLUSTER TOPOLOGY",
  preview: "(PREVIEW - 4 OF 8)",
  viewAll: "VIEW ALL RECORDERS",
  nodes: [
    { name: "NVR-01 HQ", badge: "16 CAMS OK", storage: "Storage: 34.2 / 48 TB", pct: 71, pctLabel: "71%", temp: "42°C", raidLabel: "RAID-6:", raid: "OK (8/8)", tone: "ok" },
    { name: "NVR-02 PERIMETER E", badge: "12 CAMS OK", storage: "Storage: 21.8 / 32 TB", pct: 68, pctLabel: "68%", temp: "44°C", raidLabel: "RAID-6:", raid: "OK (6/6)", tone: "ok" },
    { name: "NVR-03 PERIMETER W", badge: "CAM-15 DOWN", storage: "Storage: 29.4 / 32 TB", pct: 92, pctLabel: "92% [CRIT]", temp: "49°C", raidLabel: "FAULT:", raid: "HIGH USAGE", tone: "warn" },
    { name: "NVR-04 DEPOT", badge: "8 CAMS", storage: "Storage: 17.2 / 32 TB", pct: 54, pctLabel: "54%", temp: "40°C", raidLabel: "RAID-6:", raid: "OK (4/4)", tone: "ok" },
  ] as {
    name: string; badge: string; storage: string; pct: number; pctLabel: string;
    temp: string; raidLabel: string; raid: string; tone: "ok" | "warn";
  }[],
};

export const terminalPanel = {
  title: "OPERATOR TERMINALS & WORKSTATIONS",
  preview: "(PREVIEW - 4 OF 12)",
  viewAll: "VIEW ALL WORKSTATIONS",
  columns: ["STATION", "DUTY OPERATOR", "IP", "HEARTBEAT", "STATUS"],
  rows: [
    { station: "TERM-01 [MASTER]", operator: "Capt. A. Verma", ip: "10.142.1.11", heartbeat: "JUST NOW (0.4s)", status: "CONNECTED [TS-SCI]", master: true },
    { station: "TERM-02 [TACTICAL]", operator: "Hav. R. Singh", ip: "10.142.1.12", heartbeat: "1.2s ago", status: "CONNECTED" },
    { station: "TERM-03 [RADAR/OPTIC]", operator: "Sub. M. Kumar", ip: "10.142.1.13", heartbeat: "0.8s ago", status: "CONNECTED" },
    { station: "TERM-04 [QRF DISPATCH]", operator: "Lt. P. Nair", ip: "10.142.1.14", heartbeat: "2.1s ago", status: "CONNECTED" },
  ] as { station: string; operator: string; ip: string; heartbeat: string; status: string; master?: boolean }[],
};

export const statusStrip = {
  tamper: "TAMPER ENCLAVE: SEALED",
  hash: "HASH: 9E4F-A21C",
  audit: "STIG AUDIT LOGS",
};

export const complianceFooter = {
  left: "US-DOD DISA COMPLIANT // CLASSIFIED RECORDING SYSTEM // ISO-8601 ZULU SYNCHRONIZED",
  right:
    "RESTRICTED DISSEMINATION // US GOV PROPERTY // STRICT AUDIT COMPLIANCE LEVEL 4 ACTIVE // ZERO TRUST TELEMETRY: ISOLATED // NODE ID: TAC-8891-B",
};
