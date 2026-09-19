// Mock data copied verbatim from the Stitch screen "ISCC System Administration & Configuration Console".

export const adminHeader = {
  title: "ISCC MATRIX // SYS-ADMIN & SECURITY ACCESS",
  defcon: "DEFCON 3 // ELEVATED",
  siprnet: "SIPRNET: SECURE ENCLAVE 01",
  clearance: "CLEARANCE: TS//SCI",
  operator: "CAPT. A. VERMA [TAC-4 · IC-78492X]",
  audit: "AUDIT LOG ACTIVE",
  lockdown: "EMERGENCY LOCKDOWN",
};

export type DirectoryEntry = {
  label: string;
  icon: string;
  badge: string;
  badgeTone: "primary" | "outline" | "secondary";
  active?: boolean;
};

export const directory = {
  title: "ADMINISTRATION DIRECTORY",
  badge: "STIG L4",
  items: [
    { label: "Users & Roles", icon: "group", badge: "6 ACTIVE", badgeTone: "primary", active: true },
    { label: "Escalation Rules", icon: "crisis_alert", badge: "4 RULES", badgeTone: "outline" },
    { label: "Alert Schedules", icon: "timelapse", badge: "2 ACTIVE", badgeTone: "secondary" },
    { label: "NVR Integration", icon: "dns", badge: "8 NODES", badgeTone: "outline" },
    { label: "Backup & Restore", icon: "cloud_sync", badge: "04:00Z", badgeTone: "outline" },
    { label: "System Info", icon: "terminal", badge: "v2.4.19", badgeTone: "outline" },
  ] as DirectoryEntry[],
  enclave: {
    title: "ENCLAVE INTEGRITY",
    rows: [
      { label: "KEYSTORE:", value: "HARDWARE HSM ARMED", tone: "secondary" },
      { label: "ZERO-TRUST:", value: "ENFORCED", tone: "primary" },
      { label: "CERT EXPIRY:", value: "142 DAYS", tone: "default" },
    ] as { label: string; value: string; tone: "secondary" | "primary" | "default" }[],
    compliance: { label: "STIG COMPLIANCE:", value: "DISA-100%" },
  },
};

export type Role = "ADMIN" | "SUPERVISOR" | "OPERATOR" | "MAINTENANCE" | "VIEWER";
export type UserStatus = "ACTIVE [ONLINE]" | "OFFLINE" | "STANDBY";

export type UserRow = {
  serviceNo: string;
  name: string;
  icon: string;
  role: Role;
  clearance: "TS//SCI" | "SECRET" | "CONFIDENTIAL";
  status: UserStatus;
  lastLogin: string;
  /** Selected user (row 1) and the emphasised top three rows. */
  selected?: boolean;
  emphasis?: boolean;
};

export const usersPanel = {
  title: "USER ACCOUNTS & SECURITY CLEARANCES",
  sessions: "ACTIVE SESSIONS: 4 // REGISTERED OPERATORS: 6",
  sync: "DIR SYNC: ONLINE",
  searchPlaceholder: "Filter by name, service number, or clearance...",
  roles: ["ALL ROLES", "ADMIN", "SUPERVISOR", "OPERATOR", "MAINTENANCE", "VIEWER"],
  statuses: ["ALL STATUS", "ACTIVE [ONLINE]", "OFFLINE", "STANDBY"],
  add: "+ ADD OPERATOR / USER",
  footer: "SHOWING 6 OF 6 REGISTERED MILITARY & CIVILIAN PERSONNEL",
  audit: "AUDIT LOG: ALL USER ACTIONS IMMUTABLY RECORDED",
  users: [
    { serviceNo: "IC-78492X", name: "CAPT. ARJUN VERMA", icon: "verified_user", role: "ADMIN", clearance: "TS//SCI", status: "ACTIVE [ONLINE]", lastLogin: "14:32:08Z TODAY (TERMINAL 01)", selected: true, emphasis: true },
    { serviceNo: "IC-65120B", name: "MAJ. HELENA VANCE", icon: "military_tech", role: "SUPERVISOR", clearance: "TS//SCI", status: "ACTIVE [ONLINE]", lastLogin: "13:45:12Z TODAY (TERMINAL 02)", emphasis: true },
    { serviceNo: "IC-99214D", name: "HAV. RAJESH SINGH", icon: "person", role: "OPERATOR", clearance: "SECRET", status: "ACTIVE [ONLINE]", lastLogin: "08:00:21Z TODAY (TERMINAL 03)", emphasis: true },
    { serviceNo: "IC-88402P", name: "SUB. MANOJ KUMAR", icon: "person", role: "OPERATOR", clearance: "SECRET", status: "OFFLINE", lastLogin: "YESTERDAY 22:15Z" },
    { serviceNo: "CIV-33019M", name: "ENG. DAVID CHEN", icon: "engineering", role: "MAINTENANCE", clearance: "CONFIDENTIAL", status: "STANDBY", lastLogin: "18 SEP 09:30Z" },
    { serviceNo: "CIV-11048K", name: "AUD. SARAH JENKINS", icon: "visibility", role: "VIEWER", clearance: "SECRET", status: "OFFLINE", lastLogin: "16 SEP 16:20Z" },
  ] as UserRow[],
};

export const rbac = {
  title: "ACCESS CONTROL MATRIX (RBAC // NIST SP 800-53)",
  subtitle: "MANDATORY ACCESS CONTROL (MAC) POLICY ENFORCEMENT ENGINE",
  badge: "STIG SEC-RULE 4.2",
  roles: ["ADMIN", "SUPERVISOR", "OPERATOR", "MAINTENANCE", "VIEWER"],
  selectedRole: "SUPERVISOR",
  columns: ["ADMIN", "SUPV", "OPER", "MAINT", "VIEW"],
  descriptor: "CAPABILITY & PRIVILEGE DESCRIPTOR",
  /** Flags in column order: ADMIN, SUPV, OPER, MAINT, VIEW. */
  capabilities: [
    { label: "Acknowledge alerts", flags: [true, true, true, false, false] },
    { label: "Dispatch QRF / Patrols", flags: [true, true, true, false, false] },
    { label: "Manage cameras & PTZ Override", flags: [true, true, true, true, false] },
    { label: "Export forensic reports & clips", flags: [true, true, false, false, false] },
    { label: "Administer users & security keys", flags: [true, false, false, false, false] },
    { label: "Modify DEFCON threshold", flags: [true, true, false, false, false] },
  ] as { label: string; flags: boolean[] }[],
  revert: "REVERT TO STIG BASELINE",
  save: "SAVE MATRIX CHANGES",
};

export const escalation = {
  title: "AUTOMATED ESCALATION PROTOCOLS (DEFCON-ALIGNED)",
  add: "+ ADD RULE",
  rules: [
    {
      priority: "P1",
      tone: "error",
      title: "RULE ESC-01 [CRITICAL/HIGH]",
      parts: [
        { text: "HIGH severity unacknowledged " },
        { text: "5 min", em: true },
        { text: " → Escalate to Shift Supervisor (Terminals 01, 02); " },
        { text: "15 min", em: true },
        { text: " → Duty Officer + Siren Relay [Sector Klaxon]." },
      ],
    },
    {
      priority: "P2",
      tone: "tertiary",
      title: "RULE ESC-02 [PERIMETER BREACH]",
      parts: [
        { text: "Tripwire/Seismic dual-sensor trigger unacknowledged " },
        { text: "2 min", em: true },
        { text: " → Auto-slave nearest PTZ + broadcast alert to QRF Team." },
      ],
    },
  ] as { priority: string; tone: "error" | "tertiary"; title: string; parts: { text: string; em?: boolean }[] }[],
};

export const profiles = {
  title: "DYNAMIC SENSITIVITY PROFILES",
  engine: "AUTOMATION ENGINE",
  night: {
    title: "NIGHT PROFILE (20:00–06:00 ZULU)",
    status: "SCHEDULED ACTIVE IN 05h 08m",
    icon: "nightlight",
    body: "High-sensitivity IR threshold, AI CV confidence lowered to 85% for human silhouette detection, auto-IR illuminator boost.",
  },
  weather: {
    title: "ADVERSE WEATHER PROFILE",
    status: "STANDBY // SENSOR DAMPING",
    icon: "storm",
    body: "Rain/fog optical noise suppression, seismic vibration damping filter armed.",
    override: "MANUAL OVERRIDE: OFF",
    engage: "ENGAGE",
  },
};

export const adminFooter = {
  items: [
    { label: "ZERO-TRUST ENCLAVE ACTIVE", kind: "status" },
    { label: "US-DOD DISA STIG COMPLIANCE L4", kind: "plain" },
    { label: "HASH: 0x9E4F-A21C-8809", kind: "hash" },
    { label: "RESTRICTED DISSEMINATION", kind: "restricted" },
  ] as { label: string; kind: "status" | "plain" | "hash" | "restricted" }[],
};
