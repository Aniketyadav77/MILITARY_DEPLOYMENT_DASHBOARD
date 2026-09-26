v# ISCC Watchfloor — Gujarat CCTV camera wall

A Next.js 16 command-centre UI (dashboard, alerts, tactical map, device health, admin) whose **Cameras** page is a live wall of Gujarat traffic/CCTV cameras provided by **Sentinel**.

This document explains, step by step, how the camera feeds are pulled from Sentinel and shown on the wall: what Sentinel exposes, every limit it enforces, and how each piece of this codebase deals with them.

---

## Contents

1. [Quick start](#1-quick-start)
2. [Configuration (`.env`)](#2-configuration-env)
3. [The big picture](#3-the-big-picture)
4. [What Sentinel exposes](#4-what-sentinel-exposes)
5. [Sentinel's rules and limits](#5-sentinels-rules-and-limits)
6. [Step 1 — Logging in and holding one session](#step-1--logging-in-and-holding-one-session)
7. [Step 2 — Pacing every request (rate limit)](#step-2--pacing-every-request-rate-limit)
8. [Step 3 — Watch-time cooldown](#step-3--watch-time-cooldown)
9. [Step 4 — The camera catalogue](#step-4--the-camera-catalogue)
10. [Step 5 — Still frames for the grid (snapshots)](#step-5--still-frames-for-the-grid-snapshots)
11. [Step 6 — Full-motion video for the focused camera (HLS proxy)](#step-6--full-motion-video-for-the-focused-camera-hls-proxy)
12. [Step 7 — The browser side](#step-7--the-browser-side)
13. [API reference](#api-reference)
14. [File map](#file-map)
15. [Tuning knobs](#tuning-knobs)
16. [Troubleshooting](#troubleshooting)
17. [Security notes](#security-notes)

---

## 1. Quick start

Requirements: Node.js 22+, npm. ffmpeg does **not** need to be installed; it ships in `@ffmpeg-installer/ffmpeg`.

```bash
npm install
# create .env (see section 2)

# development
npm run dev            # http://localhost:3000

# production (recommended for the wall — much faster per request)
npm run build
npm run start          # http://localhost:3000
```

Open **`/cameras`**, or use the camera icon in the left rail.

> **Run only one copy at a time.** Sentinel allows one session per IP and meters watch time per account. Two servers (or one server plus Sentinel's own portal open in a browser) knock each other's session off and use up the quota twice as fast. If `npm run dev` says port 3000 is in use and moves to 3001, another copy is still running. Stop it first.

---

## 2. Configuration (`.env`)

All Sentinel settings live in `.env` in the project root. `.env*` is git-ignored, so **never commit it**. Only server code reads these values ([lib/sentinel/config.ts](lib/sentinel/config.ts) is `server-only`), so none of them reach the browser.

| Variable | Required | Meaning |
| --- | --- | --- |
| `SENTINEL_HLS_BASE` | yes | Base URL of the Sentinel CDN host, e.g. `https://<sentinel-host>/`. The login, catalogue, playlists, segments and key are all resolved against it. |
| `SENTINEL_EMAIL` | yes | The email the account was registered with. |
| `SENTINEL_ACCESS_PASSWORD` | one of these two | The system-generated access password issued at registration (format `XXXX-XXXX-XXXX`). |
| `SENTINEL_REGISTER_TOKEN` | one of these two | Same value under the name the registration flow used. Used if `SENTINEL_ACCESS_PASSWORD` is empty. |
| `SENTINEL_CATALOGUE_URL` | no | Catalogue location (default `cameras.json` relative to the base). |
| `SENTINEL_LOGIN_URL` | no | Login endpoint (default `auth/login` relative to the base). |
| `NEXT_PUBLIC_SENTINEL_MAX_FEEDS` | no | Maximum number of full-motion video players open at once (default `2`). |

> `SENTINEL_PASSWORD`, if present, is **not** used. The portal rejects it at `/auth/login`; the access password is the one that works.

Example (placeholders only):

```dotenv
SENTINEL_HLS_BASE=https://<sentinel-host>/
SENTINEL_EMAIL=you@example.com
SENTINEL_ACCESS_PASSWORD=XXXX-XXXX-XXXX
SENTINEL_CATALOGUE_URL=https://<sentinel-host>/cameras.json
```

---

## 3. The big picture

The browser **never talks to Sentinel directly.** It talks only to this app's own API routes. The Next.js server holds the Sentinel session cookie, fetches everything upstream, and passes back only what the browser needs.

```
 Browser (/cameras)                         Next.js server                                   Sentinel CDN
 ──────────────────                         ──────────────                                   ────────────
 useSentinelCatalogue ── GET /api/sentinel/cameras ───► catalogue.ts ─┐
                                                                      │
 SnapshotTile × N ────── GET /api/sentinel/snapshot/:id ─► snapshots.ts ─┤    upstream.ts
   (grid, still frames)                                   (ffmpeg)    ├──► session cookie ──► /auth/login
                                                                      │    request pacer        /cameras.json
 FocusTile + hls.js ──── GET /api/sentinel/hls/:id/... ─► HLS proxy ──┘    cooldown guard       /<cam>/index.m3u8
   (full-motion video)                                                                          /<cam>/segNNNNN.ts
                                                                                                /enc.key
```

Why this shape:

- **Credentials stay on the server.** Login uses an email and access password, and the resulting cookie is a credential. The browser never sees either.
- **One session per IP.** Sentinel allows exactly one logged-in session per IP. The server holds that single session and all viewers share it.
- **Limited bandwidth, so stills in the grid.** Sentinel gives a session a few Mbit/s in total, and each camera streams at about 1.5 Mbit/s. That's enough for 2–3 videos, not 30. The grid therefore shows a **current still frame per camera**, refreshed continuously, and **full-motion video plays only for the camera you click**.

---

## 4. What Sentinel exposes

Everything was worked out by observing the live portal. Paths are relative to `SENTINEL_HLS_BASE`.

| Path | What it is |
| --- | --- |
| `POST auth/login` | Form login (`email`, `password`). Success is a **302 redirect** with an HttpOnly session cookie. A wrong password re-renders the form with **200**. |
| `GET cameras.json` | The catalogue: a JSON array of `{ "id": "cam01", "name": "01 Chiman bhai Bridge" }` (30 cameras when this was written). |
| `GET <id>/index.m3u8` | The HLS media playlist for one camera (see below). |
| `GET <id>/segNNNNN.ts` | MPEG-TS video segments, about 7–9 s each, 0.3–1.5 MB each. They support HTTP `Range` requests (206). |
| `GET enc.key` | The 16-byte AES-128 key that encrypts every segment of every camera. |
| `GET /` | Sentinel's own "Control Room" page. |

**What a playlist looks like:**

```
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:8
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-KEY:METHOD=AES-128,URI="/enc.key",IV=0x00000000000000000000000000000000
#EXTINF:7.920000,
seg00000.ts
#EXTINF:8.000000,
seg00001.ts
...                       (about 7,200 segments, roughly 16 hours)
#EXT-X-ENDLIST
```

Two important facts follow from this:

1. **The "live" feed is a long loop.** The playlist is a finite recording (`VOD` + `ENDLIST`). Sentinel's portal presents it as live by playing each camera at **`now mod duration`**, so every viewer sees the same moment and a reconnect rejoins "now" instead of restarting. This app uses the same wall-clock rule everywhere.
2. **Segments are encrypted** with AES-128-CBC. The key is `enc.key` and the IV is given explicitly in the playlist, all zeros. When a playlist gives no IV, HLS uses the segment's media sequence number, and the code handles that case too.

---

## 5. Sentinel's rules and limits

Every design decision in this code comes from one of these rules. Each was observed against the live service.

| # | Rule | What happens if you break it | How this code complies |
| --- | --- | --- | --- |
| R1 | **Login required** for the catalogue, playlists, segments and key. | Redirect to the login page. | [upstream.ts](lib/sentinel/upstream.ts) logs in and attaches the cookie. |
| R2 | **Media needs a browser User-Agent.** | `403 browser required`. | The HLS proxy forwards the viewer's UA; snapshots send a Chrome UA. |
| R3 | **One session per IP.** A new login elsewhere displaces the old one. | `403 … One session per IP`. | One shared session per server process; displaced sessions are reclaimed at most once a minute. |
| R4 | **Rate limit**, about 1 request/s sustained; bursts above ~1.5–4/s are refused. | `429 slow down`, and the whole session is locked out for a few seconds, video included. | A global request pacer (Step 2). |
| R5 | **Bandwidth cap**, about 2.5–5 Mbit/s per session in total, with each camera at ~1.5 Mbit/s. | Everything slows down; video stalls. | Stills in the grid and video only for the focused camera (Steps 5 and 6). |
| R6 | **Watch-time quota** per account. | Every request, catalogue included, gets `403 watch time limit reached — please wait for your cooldown, then watch again`. No `Retry-After` header. | A cooldown guard stops all traffic and checks once a minute (Step 3). |

---

## Step 1 — Logging in and holding one session

File: [lib/sentinel/upstream.ts](lib/sentinel/upstream.ts)

1. The first time the server needs anything from Sentinel, `sessionCookie()` runs `login()`.
2. `login()` POSTs `email` and the access password as `application/x-www-form-urlencoded` to `auth/login`, with `redirect: "manual"` so the 302 isn't followed.
3. A **3xx with `Set-Cookie`** means success. The cookie pairs are joined into one `Cookie` header and kept in memory. Anything else throws `SentinelAuthError`. The failure is remembered for 30 s so a wrong password doesn't turn into a login loop.
4. Concurrent callers share one in-flight login promise, so there is never more than one login at a time.
5. The session lives on `globalThis`, so dev-mode hot reloads and separately bundled route handlers reuse it instead of each logging in, which would displace each other (R3).
6. `sentinelGet(url, opts)` is the one function every upstream GET goes through. It:
   - attaches the cookie (plus `User-Agent` and `Range` when given);
   - on a **redirect to the login page** (expired session), logs in once more and retries once;
   - on **`403 … session`** (displaced by another client on the same IP), logs in again, but **at most once every 60 s**, so two clients on one IP can't knock each other off in a loop;
   - on **3 header timeouts in a row** (20 s each), assumes the session died silently and logs in again.

---

## Step 2 — Pacing every request (rate limit)

File: [lib/sentinel/upstream.ts](lib/sentinel/upstream.ts), section *pacing*

Sentinel refuses bursts (R4), and each refusal locks the whole session out for a few seconds. So every upstream request waits its turn in a single **pacer**:

- **Spacing:** at least **900 ms** between request starts, roughly 1.1 requests/s.
- **Concurrency:** at most **3** requests waiting for response headers at once. A slot is freed as soon as headers arrive, so a long video body doesn't hold one.
- **Priority:** two queues. **`high`** covers the catalogue, playlists, key and video segments for the focused camera. **`low`** covers the grid's snapshot fetches. High always goes first, so opening a camera isn't stuck behind 30 snapshot fetches.
- **On `429`:** nothing at all is sent for **5 s**. A `high` request then retries once; a `low` request just fails and is retried later.

Measured result: zero 429s while filling a 30-camera wall with the focused video playing.

---

## Step 3 — Watch-time cooldown

File: [lib/sentinel/upstream.ts](lib/sentinel/upstream.ts), section *cooldown*

When the account's watch-time quota is used up (R6), Sentinel answers **everything** with `403 text/plain` *"watch time limit reached — please wait for your cooldown, then watch again"*, and it says nothing about how long the cooldown lasts.

1. Every response is checked. A `403` whose text matches `watch time limit|cooldown` puts the server into **cooldown mode**, and one warning line is logged.
2. In cooldown mode `sentinelGet` throws `SentinelCooldownError` immediately, **without contacting Sentinel**, except for **one probe request per minute**.
3. The first successful (2xx) response ends cooldown mode, and the log says how long it lasted.
4. The API routes turn the cooldown into a fast **503**. The catalogue response includes `cooldownRetryAt`, the time of the next probe.
5. The wall shows *"Sentinel's watch-time limit for this account is reached. Feeds resume automatically when the provider's cooldown ends"*, with an amber **"Sentinel watch-time limit · cooling down"** banner. It re-asks just after each probe, so there's no need to reload.

To save quota: close the camera tab when no one is watching. Hidden tabs and off-screen tiles already stop fetching.

---

## Step 4 — The camera catalogue

Files: [lib/sentinel/catalogue.ts](lib/sentinel/catalogue.ts), [app/api/sentinel/cameras/route.ts](app/api/sentinel/cameras/route.ts)

1. `GET /api/sentinel/cameras` calls `fetchCatalogue()`, which reads `cameras.json` through `sentinelGet`.
2. **Whitelisting:** only `id` and `name` are passed on. Ids must match `^[A-Za-z0-9_-]{1,64}$`, because they become URL path segments in the proxy. Duplicates are dropped. If Sentinel ever adds fields such as RTSP URLs with credentials in them, they stop here.
3. **Caching:** the result is memoised for **15 s**, and simultaneous requests share **one** upstream read.
4. **Stale-while-revalidate for access checks:** the HLS and snapshot routes call `isKnownCamera(id)` on every request, so that only catalogue cameras can be fetched. It answers **instantly** from the last good catalogue (trusted for up to 10 minutes) and refreshes the catalogue in the background. This keeps media flowing when a catalogue read is slow.
5. The response is `{ cameras: [{ id, name }], fetchedAt }`. The browser re-reads it every 60 s. An unchanged list keeps the same array, so no tile re-renders or reconnects.

---

## Step 5 — Still frames for the grid (snapshots)

Files: [lib/sentinel/snapshots.ts](lib/sentinel/snapshots.ts), [app/api/sentinel/snapshot/[id]/route.ts](app/api/sentinel/snapshot/[id]/route.ts)

This is how **every** camera on the wall shows a current picture despite the bandwidth cap. Instead of streaming, the server grabs **one frame per camera** from the segment playing *right now*, reading only its first ~256 KB.

For camera `id`:

1. **Playlist:** fetch `<id>/index.m3u8` once and parse it into a list of segments, each with its URL, start time, sequence number and key info (URI + IV). It's cached for 1 hour, since the loop never changes.
2. **Pick the current segment:** `position = (now in seconds) mod (total duration)`, then a binary search finds the segment containing that position. This is the same clock the portal and the video player use, so the still matches what live video would show.
3. **Key:** fetch `enc.key` (16 bytes), cached for 10 minutes.
4. **Download only the start of the segment:** `Range: bytes=0-262143`. Every segment starts with a keyframe, so the first 256 KB almost always contains a complete first frame. That's about 200–250 KB instead of ~1.5 MB.
5. **Decrypt:** AES-128-CBC with the key and the playlist's IV (or the sequence number if no IV is given). Padding is off, since it's only a prefix, and the data is trimmed to whole 16-byte blocks and then to whole 188-byte TS packets.
6. **Decode one frame:** pipe the TS bytes into the bundled ffmpeg:
   ```
   ffmpeg -threads 1 -skip_frame nokey -probesize 65536 -analyzeduration 0
          -f mpegts -i pipe:0 -an -sn -dn -threads 1
          -frames:v 1 -vf scale=640:-2 -q:v 5 -f image2 -c:v mjpeg pipe:1
   ```
   Decoding keyframes only, with no audio and minimal probing, takes about **0.3 s** per frame instead of 1–7 s.
7. **Fallback:** if no frame decodes from 256 KB, the same steps repeat once with the first 1 MB.
8. **Keep it in memory:** one JPEG per camera (about 20–35 KB, 640 px wide) with its capture time. Nothing is written to disk.

**How the route serves frames:** `GET /api/sentinel/snapshot/:id` **never waits on Sentinel.** It returns the latest frame from memory straight away. If that frame is older than 8 s, a new capture starts in the background, so the next poll gets it.

| Status | Meaning |
| --- | --- |
| `200 image/jpeg` | Latest frame. The header `X-Captured-At` gives the capture time in epoch ms. |
| `204` | No frame yet; the first one is being fetched. |
| `502` | This camera is failing and has no frame. Failed cameras are held off for 15 s. |
| `503` | Sentinel watch-time cooldown. |

Up to 6 captures run at once. The pacer from Step 2 decides how fast they actually reach Sentinel, all at `low` priority. A cold 30-camera wall fills in about 30–60 s, and after that each tile's frame is typically 20–60 s old. The pace is set by Sentinel's response latency under its rate limit.

---

## Step 6 — Full-motion video for the focused camera (HLS proxy)

File: [app/api/sentinel/hls/[...path]/route.ts](app/api/sentinel/hls/[...path]/route.ts)

When you click a tile, the browser plays real HLS video through a **read-only pass-through proxy** at `/api/sentinel/hls/...`, which mirrors Sentinel's paths.

1. **Only three kinds of path are allowed through**, so the proxy can't be used to reach the rest of the portal:
   - `<catalogue id>/…/*.m3u8`: playlists;
   - `<catalogue id>/…/<segment>`: media (`.ts .m4s .mp4 .m4v .aac .mp3 .vtt`);
   - key URIs, but **only ones that appeared inside a playlist this server served**.

   Every path segment must match `^[A-Za-z0-9._-]+$`; `.` and `..` are rejected.
2. **Playlists are rewritten:** every URI inside them (segments, `#EXT-X-KEY`, maps, variants) that points into Sentinel is mapped onto `/api/sentinel/hls/...`. Relative URIs are left alone, because the proxy mirrors Sentinel's layout and they already resolve correctly, which keeps a 7,200-segment playlist small. Key URIs are recorded in an allow-list.
3. **The key** is cached for 60 s, and simultaneous requests for it share one upstream fetch. Everyone joining at once used to pay a multi-second wait each.
4. **Segments are streamed straight through**, never stored. The viewer's `User-Agent` is forwarded (R2), and closing the player aborts the upstream download.
5. **Errors:** auth problems or cooldown give 503, header timeouts give 504, other upstream refusals give 502 with a one-line reason in the server log (e.g. `browser required`, `One session per IP`).

---

## Step 7 — The browser side

Files: [components/gotham/cameras/](components/gotham/cameras/), page [app/(shell)/cameras/page.tsx](app/(shell)/cameras/page.tsx)

**`LiveCameraWall`** ([LiveCameraWall.tsx](components/gotham/cameras/LiveCameraWall.tsx)) has two modes:

- **Grid:** one `SnapshotTile` per catalogue camera, in a responsive grid (tiles at least 300 px wide).
- **Focus:** click a tile to get a single `FocusTile` with full-motion video. Press **Esc** or click again to go back.

The header shows counts (`N live · N stale · N down · 30 cameras`), when the catalogue was last read, and the cooldown banner when there is one.

**`SnapshotTile` + `useSnapshot`** ([useSnapshot.ts](components/gotham/cameras/useSnapshot.ts)):

1. `useInView` (IntersectionObserver with a short settle delay) and `usePageVisible` decide whether a tile is **active**. Off-screen tiles and hidden tabs fetch nothing.
2. While active, the tile polls `/api/sentinel/snapshot/:id` every **4 s** (every 2 s while waiting for the first frame). These answers come from server memory and are cheap.
3. A new JPEG is swapped in only when `X-Captured-At` changes, and only once it has fully downloaded (via a blob URL), so tiles never flash blank.
4. Tile states:
   - **LIVE:** frame less than 90 s old;
   - **N s AGO:** amber, frame older than 90 s;
   - **ACQUIRING:** waiting for the first frame;
   - **RETRYING:** failing with no frame, retried with exponential backoff.

   The footer shows the frame's age and capture time.

**`FocusTile` + `useLiveFeed`** ([useLiveFeed.ts](components/gotham/cameras/useLiveFeed.ts)):

1. hls.js is loaded on demand and pointed at `/api/sentinel/hls/<id>/index.m3u8`. Safari uses native HLS instead.
2. **Wall-clock join:** once the manifest loads, playback starts at `now mod duration`, the same moment the portal shows.
3. A small buffer (8 s forward, 16 s max, 10 s back): enough to preview, without eating the bandwidth budget.
4. **Player slots:** at most `MAX_OPEN_FEEDS` players (default 2), and of those at most **3 joining at once**. A join is a burst of playlist + key + first segment; a slot is released at the first displayed frame.
5. **Health is judged from frames actually displayed** (`requestVideoFrameCallback`, or decoded-frame counts where that's missing):
   - no first frame within 30 s means reconnect;
   - a 5 s gap shows **STALLED**;
   - a 20 s gap means reconnect.

   Reconnects use exponential backoff (2 → 4 → 8 → 16 → 30 s, ±20% jitter, see [backoff.ts](components/gotham/cameras/backoff.ts)), which resets after 15 s of healthy playback.
6. The loop point (end of the recording) jumps back to 0 silently. Codec errors show **CODEC** and are not retried.
7. While the video joins, the camera's latest still is shown dimmed behind it.

---

## API reference

All routes send `Cache-Control: no-store`.

| Route | Returns |
| --- | --- |
| `GET /api/sentinel/cameras` | `200 { cameras: [{id, name}], fetchedAt }` · `503 { error, cooldownRetryAt }` during cooldown · `502 { error }` otherwise |
| `GET /api/sentinel/snapshot/:id` | `200 image/jpeg` (+ `X-Captured-At`) · `204` pending · `404` unknown camera · `502` failing · `503` cooldown |
| `GET /api/sentinel/hls/:id/index.m3u8` | Rewritten HLS playlist (`application/vnd.apple.mpegurl`) |
| `GET /api/sentinel/hls/:id/segNNNNN.ts` | MPEG-TS segment, streamed |
| `GET /api/sentinel/hls/enc.key` | AES key; only after a playlist that references it has been served |

---

## File map

```
app/
  (shell)/cameras/page.tsx              Camera wall page (/cameras)
  api/sentinel/cameras/route.ts         Catalogue endpoint
  api/sentinel/snapshot/[id]/route.ts   Still-frame endpoint
  api/sentinel/hls/[...path]/route.ts   HLS pass-through proxy (playlists, segments, key)
lib/sentinel/
  config.ts        Reads .env (server-only)
  upstream.ts      Login/session, request pacer, 429 handling, watch-time cooldown
  catalogue.ts     Catalogue fetch, whitelisting, memo, isKnownCamera
  snapshots.ts     Playlist parsing, range fetch, AES decrypt, ffmpeg frame grab, frame cache
  types.ts         Client-safe types, route helpers, MAX_OPEN_FEEDS
components/gotham/cameras/
  LiveCameraWall.tsx        Grid + focus UI, tile states, counts, cooldown banner
  useSentinelCatalogue.ts   Polls the catalogue, understands cooldown responses
  useSnapshot.ts            Polls one camera's still frame
  useLiveFeed.ts            hls.js player with slots, wall-clock join, health checks, backoff
  backoff.ts                Exponential backoff with jitter
components/gotham/hooks.ts  useInView, usePageVisible, useEpochSecond, useClock
next.config.ts              serverExternalPackages: @ffmpeg-installer/ffmpeg (keeps its binary path intact)
```

---

## Tuning knobs

Values as currently set. Change them only with Sentinel's limits (section 5) in mind.

| Where | Constant | Value | Effect |
| --- | --- | --- | --- |
| upstream.ts | `MIN_GAP_MS` | 900 | Minimum gap between upstream requests. Lower it and you risk 429 lockouts. |
| upstream.ts | `MAX_INFLIGHT` | 3 | Upstream requests awaiting headers at once. |
| upstream.ts | `HOLD_429_MS` | 5000 | Pause after a 429. |
| upstream.ts | `COOLDOWN_PROBE_MS` | 60000 | How often to check whether the watch-time cooldown is over. |
| snapshots.ts | `FRESH_MS` | 8000 | A frame older than this is refreshed on the next request. |
| snapshots.ts | `HEAD_BYTES` | 256 KB, then 1 MB | How much of a segment to fetch for a frame. |
| snapshots.ts | `MAX_FETCHES` | 6 | Captures in progress at once. |
| useSnapshot.ts | `POLL_MS` | 4000 | How often a visible tile asks for a newer frame. |
| LiveCameraWall.tsx | `STALE_S` | 90 | When a tile's frame counts as stale (amber). |
| useLiveFeed.ts | `MAX_JOINING` | 3 | Video players joining at once. |
| types.ts / `.env` | `MAX_OPEN_FEEDS` | 2 | Full-motion players open at once. |

---

## Troubleshooting

| Symptom (server log / UI) | Cause | Fix |
| --- | --- | --- |
| Wall says *watch-time limit reached*; log shows `watch time limit reached … pausing upstream requests` | Sentinel's per-account quota is used up (R6). | Wait. Feeds resume on their own, and the log prints how long the cooldown lasted. Close idle tabs and run only one copy to save quota. |
| `catalogue unavailable: HTTP 403`, or `session displaced` | Another client on the same IP logged in: a second copy of this app, or Sentinel's portal in a browser (R3). | Keep only one server running (check ports 3000/3001), and close the portal. |
| `Sentinel login rejected (HTTP 200)` | Wrong email or access password. | Use the system-generated access password (`XXXX-XXXX-XXXX`) as `SENTINEL_ACCESS_PASSWORD`. |
| `refused: HTTP 429 — slow down` | Too many requests (R4). | The pacer should prevent this. If you lowered `MIN_GAP_MS` or raised the concurrency knobs, revert them. |
| Tiles stuck on **ACQUIRING** for a long time | Cold start; each camera needs a playlist plus a segment through the pacer. | Normal for the first 30–60 s. Use `npm run build && npm run start`: dev mode adds seconds of overhead per request. |
| `refused: … browser required` | A media request was made without a browser User-Agent (R2). | Only happens if code calls `sentinelGet` for media without `userAgent`. |
| Error `ERR_MODULE_NOT_FOUND … server.ts` | Old `package.json` scripts pointed at a custom server that doesn't exist. | The scripts are now plain `next dev` / `next start`. |
| Focused video shows **CODEC** | The browser can't decode the stream. | Use Chrome, Edge or Safari (H.264). |

---

## Security notes

- **The access password and session cookie stay on the server.** They are read from `.env` by `server-only` modules and never sent to the browser. `.env` is git-ignored.
- **Only `{ id, name }` reach the browser.** Any other catalogue fields are dropped server-side.
- **The HLS proxy is an allow-list, not an open proxy.** It serves only catalogue cameras' playlists and segments, plus keys referenced by playlists it served. Path segments are strictly validated.
- **Nothing is recorded.** Video is streamed through without being stored. Only the latest still per camera is held in memory, replaced on each refresh, and the AES key is cached in memory briefly.
