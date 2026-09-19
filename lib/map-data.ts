// Mock data copied verbatim from the Stitch screen "ISCC Tactical GIS Cantonment Map".

export const mapHeader = {
  title: "AEGIS C2 // TAC-GIS",
  grid: "GRID: 38S MB 492 881",
  defcon: "DEFCON 3",
  system: "SYS: NOMINAL",
  searchPlaceholder: "FILTER TARGET / LAT-LONG / MGRS...",
  clockDate: "18 SEP 2026",
  acknowledgeAll: "ACKNOWLEDGE ALL (3)",
  network: "DEFENSE NET: SECURE",
  operator: "CAPT. A. VERMA",
  operatorId: "IC-78492X · SEC-4",
  avatar: "/map/operator-badge.jpg",
  avatarAlt: "Clearance badge photo of the duty officer",
};

export const mapReadout = {
  mgrs: "43R FM 8841 9022",
  wgs84: "28.6139° N, 77.2090° E",
  elevation: "216m MSL",
};

export const mapLayers = [
  { label: "CAMERAS [ON]", on: true },
  { label: "ZONES [ON]", on: true },
  { label: "IR TRIPWIRES [ON]", on: true },
  { label: "RADAR ARCS [OFF]", on: false },
];

export const cameraPopover = {
  title: "CAM-07 · PERIMETER E",
  status: "ONLINE",
  lastAlertLabel: "Last Alert:",
  lastAlert: "12 min ago (Animal - False Positive)",
  specsLabel: "Optical Specs:",
  specs: "FOV 82° · 1080P60 · AZ: 092°",
  bandwidthLabel: "Feed Bandwidth:",
  bandwidth: "4.8 Mbps · H.265",
};

export const mapControls = {
  scale: "SCALE 1:2500",
  scaleBar: "200m",
  gps: "GPS LOCK (12 SAT)",
  recenter: "RE-CENTER SECTOR",
  base: "GIS BASE: CAD VECTOR",
};

export type ZoneTone = "nominal" | "inspected" | "warn" | "breach";

export type ZoneRow = {
  name: string;
  detail: string;
  online: string;
  tone: ZoneTone;
  tag?: string;
};

export const zonesPanel = {
  title: "CANTONMENT ZONES & SENSORS",
  summary: "5 ZONES · 48 CAMERAS · 44 ONLINE",
  zones: [
    { name: "HQ & OPS COMMAND", detail: "ZONE ALPHA · 8 CAMS · SENSORS NOMINAL", online: "8/8 ONLINE", tone: "nominal" },
    { name: "PERIMETER E", detail: "ZONE BRAVO · 10 CAMS · 4 FENCE TRIPWIRES", online: "10/10 ONLINE", tone: "inspected", tag: "INSPECTED" },
    { name: "PERIMETER W", detail: "ZONE CHARLIE · 10 CAMS · 1 OFFLINE [CAM-15]", online: "9/10 ONLINE", tone: "warn" },
    { name: "DEPOT & ARMOURY", detail: "ZONE DELTA · 1 ACTIVE ALERT [CAM-12]", online: "11/12 ONLINE", tone: "breach", tag: "BREACH" },
    { name: "MOTOR POOL & LOGISTICS", detail: "ZONE ECHO · 8 CAMS · GATE SEISMIC ACTIVE", online: "8/8 ONLINE", tone: "nominal" },
  ] as ZoneRow[],
};

export const inspection = {
  title: "INSPECTION NODE: CAM-12",
  alert: "ACTIVE INTRUSION ALERT (INC-8821)",
  feed: {
    src: "/map/cam-12-flir-feed.jpg",
    alt: "Black-and-white FLIR night-vision feed of a weapons depot perimeter with a tracked human silhouette.",
    label: "CAM-12 · FLIR IR",
    rec: "REC [LIVE]",
    trackId: "#9941",
    trackScore: "0.94",
    target: "HUMAN TARGET",
    fov: "FOV: 42° NFOV",
    fps: "30 FPS",
  },
  ptz: { label: "PTZ TELEMETRY", value: "AZ: 184.2° | EL: -04.1° | ZOOM: 3.4x" },
  sensors: { label: "CORRELATED SENSORS", value: "SEISMIC-08 (TRIP) · BEAM #14 (BROKEN)" },
  location: { label: "LOCATION BENCHMARK", value: "ZONE DELTA · VAULT B-4 NORTH GATE" },
  actions: { lock: "LOCK PTZ TO TARGET", dispatch: "DISPATCH QRF", isolate: "ISOLATE SECTOR" },
};

export const mapFooter = {
  restricted: "RESTRICTED DISSEMINATION // US GOV PROPERTY",
  items: [
    "STRICT AUDIT COMPLIANCE LEVEL 4 ACTIVE",
    "ZERO TRUST TELEMETRY: ISOLATED",
  ],
  node: "NODE ID: TAC-8891-B",
  defcon: "DEFCON 3",
};
