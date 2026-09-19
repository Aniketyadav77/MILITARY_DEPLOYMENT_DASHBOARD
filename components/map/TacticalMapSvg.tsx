/** CAD-style vector terrain, roads, zones, camera cones and the active breach overlay (static mock geometry). */
export function TacticalMapSvg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1000 650"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tactical map of the cantonment with zones Alpha to Echo and camera coverage"
    >
      <defs>
        <pattern height="8" id="diagonalHatchRed" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse" width="8">
          <line stroke="#D64545" strokeOpacity="0.3" strokeWidth="1.5" x1="0" x2="0" y1="0" y2="8" />
        </pattern>
        <radialGradient cx="50%" cy="50%" id="alertGlow" r="50%">
          <stop offset="0%" stopColor="#D64545" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D64545" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer cantonment perimeter wall boundary */}
      <polygon fill="#111319" points="60,40 940,40 940,610 60,610" stroke="#414750" strokeDasharray="8,4" strokeWidth="1.5" />

      {/* Ring patrol road */}
      <polyline fill="none" points="90,70 910,70 910,580 90,580 90,70" stroke="#272a30" strokeWidth="14" />
      <polyline fill="none" points="90,70 910,70 910,580 90,580 90,70" stroke="#414750" strokeDasharray="6,6" strokeWidth="1" />
      {/* Cross arterials */}
      <line stroke="#272a30" strokeWidth="12" x1="90" x2="910" y1="330" y2="330" />
      <line stroke="#414750" strokeDasharray="4,4" strokeWidth="1" x1="90" x2="910" y1="330" y2="330" />
      <line stroke="#272a30" strokeWidth="12" x1="500" x2="500" y1="70" y2="580" />
      <line stroke="#414750" strokeDasharray="4,4" strokeWidth="1" x1="500" x2="500" y1="70" y2="580" />
      {/* Service lanes */}
      <polyline fill="none" points="500,200 750,200 750,330" stroke="#1d2025" strokeWidth="6" />
      <polyline fill="none" points="260,330 260,460 500,460" stroke="#1d2025" strokeWidth="6" />

      {/* ZONE ALPHA: HQ & OPS COMMAND */}
      <g id="zone-alpha">
        <rect fill="#191c21" fillOpacity="0.75" height="200" stroke="#414750" strokeWidth="1" width="330" x="130" y="100" />
        <path d="M 130 115 L 130 100 L 145 100" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 445 100 L 460 100 L 460 115" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 130 285 L 130 300 L 145 300" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 445 300 L 460 300 L 460 285" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <rect fill="#1d2025" height="60" stroke="#414750" strokeWidth="1" width="100" x="160" y="130" />
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" textAnchor="middle" x="210" y="165">BLDG 01-HQ</text>
        <rect fill="#1d2025" height="130" stroke="#414750" strokeWidth="1" width="130" x="290" y="130" />
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" textAnchor="middle" x="355" y="200">SCIF // TOC C4I</text>
        <text fill="#9dcaff" fontFamily="Inter" fontSize="10" fontWeight="600" letterSpacing="1" x="145" y="118">ZONE ALPHA // HQ &amp; OPS COMMAND</text>
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" x="145" y="290">COORD BM: 43R-FM-081</text>
      </g>

      {/* ZONE DELTA: AMMUNITION & WEAPONS DEPOT (active breach) */}
      <g id="zone-delta">
        <rect fill="url(#diagonalHatchRed)" height="200" stroke="#93000a" strokeWidth="1.5" width="330" x="540" y="100" />
        <path d="M 540 115 L 540 100 L 555 100" fill="none" stroke="#ffb4ab" strokeWidth="2" />
        <path d="M 855 100 L 870 100 L 870 115" fill="none" stroke="#ffb4ab" strokeWidth="2" />
        <path d="M 540 285 L 540 300 L 555 300" fill="none" stroke="#ffb4ab" strokeWidth="2" />
        <path d="M 855 300 L 870 300 L 870 285" fill="none" stroke="#ffb4ab" strokeWidth="2" />
        <rect fill="#1d2025" height="60" stroke="#93000a" strokeWidth="1" width="80" x="580" y="140" />
        <text fill="#ffb4ab" fontFamily="Inter" fontSize="9" textAnchor="middle" x="620" y="175">VAULT 01 [SECURED]</text>
        <rect fill="#1d2025" height="110" stroke="#D64545" strokeWidth="1.5" width="130" x="700" y="140" />
        <text fill="#ffb4ab" fontFamily="Inter" fontSize="10" fontWeight="600" textAnchor="middle" x="765" y="195">ARMOURY SECTOR 4</text>
        <text fill="#ffb4ab" fontFamily="Inter" fontSize="8" textAnchor="middle" x="765" y="210">INC-8821 INTRUSION</text>
        <circle className="animate-critical-pulse" cx="720" cy="190" fill="none" r="45" stroke="#D64545" strokeDasharray="3,3" strokeWidth="1" />
        <text fill="#ffb4ab" fontFamily="Inter" fontSize="10" fontWeight="600" letterSpacing="1" x="555" y="118">ZONE DELTA // AMMUNITION &amp; WEAPONS DEPOT</text>
        <text fill="#ffb4ab" fontFamily="Inter" fontSize="9" x="555" y="290">COORD BM: 43R-FM-089 [RED PRIORITY]</text>
      </g>

      {/* ZONE ECHO: MOTOR POOL & LOGISTICS */}
      <g id="zone-echo">
        <rect fill="#191c21" fillOpacity="0.75" height="190" stroke="#414750" strokeWidth="1" width="330" x="540" y="360" />
        <path d="M 540 375 L 540 360 L 555 360" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 855 360 L 870 360 L 870 375" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 540 535 L 540 550 L 555 550" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 855 550 L 870 550 L 870 535" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <rect fill="#1d2025" height="70" stroke="#414750" strokeWidth="1" width="120" x="570" y="390" />
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" textAnchor="middle" x="630" y="430">FLEET BAY ALPHA</text>
        <rect fill="#1d2025" height="70" stroke="#414750" strokeWidth="1" width="120" x="720" y="390" />
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" textAnchor="middle" x="780" y="430">POL / FUEL DEPOT</text>
        <text fill="#9dcaff" fontFamily="Inter" fontSize="10" fontWeight="600" letterSpacing="1" x="555" y="378">ZONE ECHO // MOTOR POOL &amp; LOGISTICS</text>
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" x="555" y="538">COORD BM: 43R-FM-094</text>
      </g>

      {/* ZONE CHARLIE: PERIMETER W */}
      <g id="zone-charlie">
        <rect fill="#191c21" fillOpacity="0.75" height="190" stroke="#414750" strokeWidth="1" width="330" x="130" y="360" />
        <path d="M 130 375 L 130 360 L 145 360" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 445 360 L 460 360 L 460 375" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 130 535 L 130 550 L 145 550" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <path d="M 445 550 L 460 550 L 460 535" fill="none" stroke="#9dcaff" strokeWidth="2" />
        <rect fill="#1d2025" height="80" stroke="#414750" strokeWidth="1" width="110" x="170" y="400" />
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" textAnchor="middle" x="225" y="445">BARRACKS CLUSTER</text>
        <text fill="#9dcaff" fontFamily="Inter" fontSize="10" fontWeight="600" letterSpacing="1" x="145" y="378">ZONE CHARLIE // PERIMETER W</text>
        <text fill="#8b919b" fontFamily="Inter" fontSize="9" x="145" y="538">COORD BM: 43R-FM-076 [1 LOSS]</text>
      </g>

      {/* Perimeter E & W markers on outer bounds */}
      <text fill="#c1c7d2" fontFamily="Inter" fontSize="10" fontWeight="600" letterSpacing="1" transform="rotate(-90 75 240)" x="75" y="240">PERIMETER WEST BARRIER</text>
      <text fill="#c1c7d2" fontFamily="Inter" fontSize="10" fontWeight="600" letterSpacing="1" transform="rotate(90 925 240)" x="925" y="240">ZONE BRAVO // PERIMETER E</text>

      {/* CAM-01: Main Gate */}
      <g transform="translate(500, 60)">
        <polygon fill="#00864e" fillOpacity="0.15" points="0,0 -20,40 20,40" stroke="#71db9a" strokeDasharray="2,2" strokeWidth="0.8" />
        <circle cx="0" cy="0" fill="#71db9a" r="4.5" stroke="#00391e" strokeWidth="1.5" />
        <text fill="#e1e2e9" fontFamily="Inter" fontSize="8" fontWeight="600" x="8" y="4">CAM-01 [MAIN GATE]</text>
      </g>
      {/* CAM-02: Perimeter N */}
      <g transform="translate(260, 68)">
        <polygon fill="#00864e" fillOpacity="0.15" points="0,0 -15,35 15,35" stroke="#71db9a" strokeWidth="0.8" />
        <circle cx="0" cy="0" fill="#71db9a" r="4" />
        <text fill="#c1c7d2" fontFamily="Inter" fontSize="8" x="8" y="3">CAM-02</text>
      </g>
      {/* CAM-03: Checkpoint Alpha */}
      <g transform="translate(140, 200)">
        <polygon fill="#00864e" fillOpacity="0.15" points="0,0 35,-15 35,15" stroke="#71db9a" strokeWidth="0.8" />
        <circle cx="0" cy="0" fill="#71db9a" r="4" />
        <text fill="#c1c7d2" fontFamily="Inter" fontSize="8" x="8" y="-6">CAM-03 CP-A</text>
      </g>
      {/* CAM-08: Officer Quarters */}
      <g transform="translate(380, 260)">
        <circle cx="0" cy="0" fill="#71db9a" r="4" />
        <text fill="#c1c7d2" fontFamily="Inter" fontSize="8" x="7" y="3">CAM-08</text>
      </g>
      {/* CAM-14: Depot North */}
      <g transform="translate(600, 95)">
        <polygon fill="#00864e" fillOpacity="0.15" points="0,0 25,35 -10,40" stroke="#71db9a" strokeWidth="0.8" />
        <circle cx="0" cy="0" fill="#71db9a" r="4" />
        <text fill="#c1c7d2" fontFamily="Inter" fontSize="8" x="8" y="3">CAM-14</text>
      </g>
      {/* CAM-16: Barracks Access */}
      <g transform="translate(280, 480)">
        <circle cx="0" cy="0" fill="#71db9a" r="4" />
        <text fill="#c1c7d2" fontFamily="Inter" fontSize="8" x="7" y="3">CAM-16</text>
      </g>
      {/* CAM-15: Perimeter W-04 (offline) */}
      <g transform="translate(88, 430)">
        <circle cx="0" cy="0" fill="#414750" r="4.5" stroke="#111319" strokeWidth="1.5" />
        <line stroke="#ffb4ab" strokeWidth="1.5" x1="-3" x2="3" y1="-3" y2="3" />
        <text fill="#8b919b" fontFamily="Inter" fontSize="8" x="10" y="3">CAM-15 [OFFLINE]</text>
      </g>
      {/* CAM-09: Ammunition Dump (caution) */}
      <g transform="translate(630, 240)">
        <polygon fill="#c58319" fillOpacity="0.18" points="0,0 -25,-25 15,-30" stroke="#ffb95b" strokeWidth="0.8" />
        <circle cx="0" cy="0" fill="#ffb95b" r="4.5" stroke="#0b0e13" strokeWidth="1" />
        <text fill="#ffb95b" fontFamily="Inter" fontSize="8" fontWeight="500" x="8" y="3">CAM-09 [WARN]</text>
      </g>
      {/* CAM-12: Armoury Sector 4 (pulsing critical breach) */}
      <g className="animate-critical-pulse" transform="translate(718, 188)">
        <path d="M 0 0 L -60 -20 A 70 70 0 0 1 -20 -60 Z" fill="#93000a" fillOpacity="0.4" stroke="#ffb4ab" strokeWidth="1.2" />
        <circle cx="0" cy="0" fill="#ffb4ab" r="6" stroke="#93000a" strokeWidth="2" />
        <line stroke="#ffb4ab" strokeWidth="1.2" x1="-12" x2="12" y1="0" y2="0" />
        <line stroke="#ffb4ab" strokeWidth="1.2" x1="0" x2="0" y1="-12" y2="12" />
        <rect fill="#93000a" height="14" stroke="#ffb4ab" strokeWidth="0.8" width="95" x="8" y="-18" />
        <text fill="#e1e2e9" fontFamily="Inter" fontSize="8" fontWeight="600" x="12" y="-8">CAM-12 [BREACH]</text>
      </g>
      {/* CAM-07: Perimeter E (selected inspection node) */}
      <g transform="translate(908, 300)">
        <polygon fill="#00864e" fillOpacity="0.2" points="0,0 -40,-25 -40,25" stroke="#71db9a" strokeWidth="1" />
        <circle cx="0" cy="0" fill="#71db9a" r="5.5" stroke="#9dcaff" strokeWidth="2" />
        <circle cx="0" cy="0" fill="none" r="9" stroke="#9dcaff" strokeDasharray="2,2" strokeWidth="1" />
        <text fill="#9dcaff" fontFamily="Inter" fontSize="9" fontWeight="600" x="-70" y="-12">CAM-07 [ACTIVE]</text>
      </g>
    </svg>
  );
}
