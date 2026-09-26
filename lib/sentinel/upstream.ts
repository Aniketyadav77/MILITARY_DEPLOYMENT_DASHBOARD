import "server-only";
import { sentinelConfig } from "./config";

/**
 * Authenticated, read-only access to the Sentinel CDN host.
 *
 * Auth, as observed on the live portal: POST email + access password as a form
 * to the login URL; success is a redirect carrying an HttpOnly session cookie.
 * Catalogue, playlists, segments and keys all require that cookie, and the
 * media paths additionally refuse clients without a browser User-Agent. The
 * cookie is a credential, so it is held here and never forwarded to the browser.
 *
 * The gateway allows one session per IP, so this process keeps exactly one and
 * every viewer's requests share it.
 */

type SessionState = {
  cookie: string | null;
  inflight: Promise<string> | null;
  inflightAt: number;
  /** Wrong credentials are not retried in a loop; the error is replayed for a while. */
  failedAt: number;
  failure: Error | null;
  /** Consecutive upstream requests that timed out on the current cookie. */
  timeouts: number;
  /** Last time the session was re-taken after another client displaced it. */
  reclaimedAt: number;
  /** When the watch-time cooldown began (0 = not cooling down). */
  cooldownAt: number;
  /** During a cooldown, the next time one request may go out to see whether it is over. */
  nextProbeAt: number;
};

const LOGIN_TIMEOUT_MS = 15_000;
const LOGIN_FAILURE_HOLD_MS = 30_000;
/** Time allowed for response headers. Bodies are not limited: media arrives at real-time pace. */
const HEADERS_TIMEOUT_MS = 20_000;
/** This many header timeouts in a row and the session is presumed dead and replaced. */
const TIMEOUTS_BEFORE_RELOGIN = 3;

// Route handlers can be bundled as separate module instances; one session on
// globalThis keeps them from each logging in (and from surviving dev reloads twice).
const g = globalThis as typeof globalThis & { __sentinelSession?: SessionState; __sentinelPacer?: Pacer };
const session: SessionState = (g.__sentinelSession ??= {
  cookie: null,
  inflight: null,
  inflightAt: 0,
  failedAt: 0,
  failure: null,
  timeouts: 0,
  reclaimedAt: 0,
  cooldownAt: 0,
  nextProbeAt: 0,
});
// A session object created by an older version of this module (dev reload) may lack newer fields.
session.timeouts ??= 0;
session.inflightAt ??= 0;
session.reclaimedAt ??= 0;
session.cooldownAt ??= 0;
session.nextProbeAt ??= 0;

/* -------------------------------------------------------------------- pacing */

/**
 * The gateway answers bursts with "429 slow down": about one request a second is
 * accepted indefinitely, more is refused within seconds, and a refusal locks the
 * session out for a few seconds — live video included. So every upstream request
 * goes through this pacer: spaced out, few in flight, and live video ("high")
 * ahead of background work such as wall snapshots ("low").
 */
const MIN_GAP_MS = 900;
const MAX_INFLIGHT = 3;
/** After a 429, nothing is sent for this long. */
const HOLD_429_MS = 5_000;

export type Priority = "high" | "low";

type Pacer = {
  last: number;
  inflight: number;
  holdUntil: number;
  high: Array<() => void>;
  low: Array<() => void>;
  timer: ReturnType<typeof setTimeout> | null;
};
const pacer: Pacer = (g.__sentinelPacer ??= {
  last: 0,
  inflight: 0,
  holdUntil: 0,
  high: [],
  low: [],
  timer: null,
});

function pump() {
  if (pacer.timer) return;
  while (pacer.inflight < MAX_INFLIGHT && (pacer.high.length || pacer.low.length)) {
    const wait = Math.max(pacer.last + MIN_GAP_MS, pacer.holdUntil) - Date.now();
    if (wait > 0) {
      pacer.timer = setTimeout(() => {
        pacer.timer = null;
        pump();
      }, wait);
      return;
    }
    pacer.last = Date.now();
    pacer.inflight++;
    (pacer.high.shift() ?? pacer.low.shift())?.();
  }
}

/** Wait for a turn to send; the returned release must be called once headers arrive (or it fails). */
function paceTurn(priority: Priority): Promise<() => void> {
  return new Promise((resolve) => {
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      pacer.inflight--;
      pump();
    };
    (priority === "high" ? pacer.high : pacer.low).push(() => resolve(release));
    pump();
  });
}

export class SentinelAuthError extends Error {}
export class SentinelTimeoutError extends Error {}
/** Sentinel's watch-time quota is used up; nothing will be served until its cooldown ends. */
export class SentinelCooldownError extends Error {
  constructor(
    message: string,
    /** Epoch ms when this server will next check whether the cooldown is over. */
    readonly retryAt: number,
  ) {
    super(message);
  }
}

/* ------------------------------------------------------------------ cooldown */

/**
 * Sentinel meters watch time per account. Once it is used up, every request —
 * catalogue included — gets a 403 "watch time limit reached — please wait for
 * your cooldown" (no Retry-After). Hammering it helps nothing, so during a
 * cooldown no request goes upstream except one probe this often.
 */
const COOLDOWN_PROBE_MS = 60_000;
const COOLDOWN_TEXT = /watch time limit|cooldown/i;

export function sentinelCooldown(): { since: number; retryAt: number } | null {
  return session.cooldownAt ? { since: session.cooldownAt, retryAt: session.nextProbeAt } : null;
}

/** Throws while cooling down, except for the one request allowed through as a probe. */
function checkCooldown() {
  if (!session.cooldownAt) return;
  const now = Date.now();
  if (now < session.nextProbeAt) {
    throw new SentinelCooldownError("Sentinel watch-time limit reached — cooling down", session.nextProbeAt);
  }
  session.nextProbeAt = now + COOLDOWN_PROBE_MS; // this request is the probe; the rest keep waiting
}

function enterCooldown(reason: string): never {
  const now = Date.now();
  if (!session.cooldownAt) {
    session.cooldownAt = now;
    console.warn(`[sentinel] ${reason} — pausing upstream requests, re-checking every ${COOLDOWN_PROBE_MS / 1000}s`);
  }
  session.nextProbeAt = now + COOLDOWN_PROBE_MS;
  throw new SentinelCooldownError(`Sentinel: ${reason}`, session.nextProbeAt);
}

function leaveCooldown() {
  if (!session.cooldownAt) return;
  console.warn(`[sentinel] watch-time cooldown over after ${Math.round((Date.now() - session.cooldownAt) / 60_000)} min`);
  session.cooldownAt = 0;
  session.nextProbeAt = 0;
}

/**
 * fetch() that must produce response headers within `ms`. The timer stops once
 * headers arrive, so a long-running body stream is never cut off by it. The
 * caller's signal (the browser disconnecting) still aborts at any point.
 */
async function fetchWithHeaderTimeout(url: URL, init: RequestInit, ms: number, outer?: AbortSignal): Promise<Response> {
  const ctl = new AbortController();
  const onOuterAbort = () => ctl.abort(outer?.reason);
  if (outer?.aborted) ctl.abort(outer.reason);
  outer?.addEventListener("abort", onOuterAbort, { once: true });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctl.abort();
  }, ms);

  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } catch (err) {
    if (timedOut) throw new SentinelTimeoutError(`no response from ${url.pathname} within ${ms / 1000}s`);
    throw err;
  } finally {
    // The outer listener stays: a viewer closing a tile mid-segment must still
    // abort the upstream body. It goes away with the request's signal.
    clearTimeout(timer);
  }
}

async function login(): Promise<string> {
  const cfg = sentinelConfig();
  const res = await fetchWithHeaderTimeout(
    cfg.loginUrl,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email: cfg.email, password: cfg.password }),
      redirect: "manual",
      cache: "no-store",
    },
    LOGIN_TIMEOUT_MS,
  );
  await res.body?.cancel();

  // A rejected login re-renders the form (200); an accepted one redirects with the cookie.
  const pairs = res.headers.getSetCookie().map((c) => c.split(";", 1)[0].trim()).filter(Boolean);
  if (res.status < 300 || res.status >= 400 || pairs.length === 0) {
    throw new SentinelAuthError(`Sentinel login rejected (HTTP ${res.status}) — check email / access password`);
  }
  return pairs.join("; ");
}

async function sessionCookie(): Promise<string> {
  if (session.cookie) return session.cookie;
  if (session.failure && Date.now() - session.failedAt < LOGIN_FAILURE_HOLD_MS) throw session.failure;
  // A login is bounded by its own timeout; one older than that is orphaned
  // (e.g. from before a dev reload) and must not be awaited forever.
  if (session.inflight && Date.now() - session.inflightAt > LOGIN_TIMEOUT_MS * 2) session.inflight = null;

  if (!session.inflight) {
    session.inflightAt = Date.now();
    session.inflight = login()
      .then((cookie) => {
        session.cookie = cookie;
        session.failure = null;
        session.timeouts = 0;
        return cookie;
      })
      .catch((err: Error) => {
        session.failure = err;
        session.failedAt = Date.now();
        throw err;
      })
      .finally(() => {
        session.inflight = null;
      });
  }
  return session.inflight;
}

/** Taking the IP's single session back from another client is done at most this often. */
const SESSION_RECLAIM_MS = 60_000;

/**
 * The gateway answers a displaced session ("One session per IP") with a short
 * text/plain 403. Returns the body text so the caller can rebuild the response
 * if it turns out to be some other refusal (e.g. "browser required").
 */
async function sessionRefusal(res: Response): Promise<{ displaced: boolean; text: string } | null> {
  if (res.status !== 403 || !(res.headers.get("content-type") ?? "").startsWith("text/")) return null;
  const text = await res.text();
  return { displaced: /session/i.test(text), text };
}

function isLoginRedirect(res: Response): boolean {
  if (res.status < 300 || res.status >= 400) return false;
  const loc = res.headers.get("location");
  if (!loc) return false;
  const cfg = sentinelConfig();
  return new URL(loc, cfg.hlsBase).pathname === cfg.loginUrl.pathname;
}

/**
 * GET a Sentinel URL with the session attached. An expired session shows up as
 * a redirect to the login page; that triggers exactly one re-login and retry.
 * A session that has silently stopped answering is replaced after a few timeouts.
 */
export async function sentinelGet(
  url: URL,
  opts: { userAgent?: string | null; signal?: AbortSignal; range?: string; priority?: Priority } = {},
): Promise<Response> {
  const priority = opts.priority ?? "high";
  const send = async (cookie: string) => {
    const headers: Record<string, string> = { Cookie: cookie };
    if (opts.userAgent) headers["User-Agent"] = opts.userAgent;
    if (opts.range) headers.Range = opts.range;
    checkCooldown();
    const release = await paceTurn(priority);
    let res: Response;
    try {
      res = await fetchWithHeaderTimeout(
        url,
        { headers, redirect: "manual", cache: "no-store" },
        HEADERS_TIMEOUT_MS,
        opts.signal,
      );
    } finally {
      release();
    }
    if (res.status === 429) pacer.holdUntil = Math.max(pacer.holdUntil, Date.now() + HOLD_429_MS);
    if (res.status === 403 && (res.headers.get("content-type") ?? "").startsWith("text/")) {
      const text = (await res.clone().text()).slice(0, 200).trim();
      if (COOLDOWN_TEXT.test(text)) {
        await res.body?.cancel();
        enterCooldown(text);
      }
    } else if (res.ok) {
      leaveCooldown();
    }
    return res;
  };

  const attempt = async (cookie: string) => {
    try {
      let res = await send(cookie);
      // Live video waits out a rate-limit hold and tries once more; background work just fails.
      if (res.status === 429 && priority === "high" && !opts.signal?.aborted) {
        await res.body?.cancel();
        res = await send(cookie);
      }
      session.timeouts = 0;
      return res;
    } catch (err) {
      if (err instanceof SentinelTimeoutError && session.cookie === cookie) {
        session.timeouts++;
        if (session.timeouts >= TIMEOUTS_BEFORE_RELOGIN) {
          console.warn("[sentinel] session unresponsive — logging in again");
          session.cookie = null;
          session.timeouts = 0;
        }
      }
      throw err;
    }
  };

  const cookie = await sessionCookie();
  let res = await attempt(cookie);

  const refusal = await sessionRefusal(res);
  if (refusal && !refusal.displaced) {
    // Consumed to inspect it; hand the caller an equivalent response.
    return new Response(refusal.text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain" },
    });
  }

  if (refusal?.displaced) {
    // Another client on this IP took the session. Take it back, but rarely, so
    // two clients sharing an IP can't knock each other off in a loop.
    if (Date.now() - session.reclaimedAt < SESSION_RECLAIM_MS) {
      throw new SentinelAuthError(`Sentinel session displaced (${refusal.text}); will reclaim shortly`);
    }
    session.reclaimedAt = Date.now();
    console.warn(`[sentinel] session displaced (${refusal.text}) — logging in again`);
    if (session.cookie === cookie) session.cookie = null;
    res = await attempt(await sessionCookie());
  } else if (isLoginRedirect(res)) {
    await res.body?.cancel();
    if (session.cookie === cookie) session.cookie = null;
    res = await attempt(await sessionCookie());
  } else {
    return res;
  }

  if (isLoginRedirect(res) || res.status === 403) {
    await res.body?.cancel();
    throw new SentinelAuthError(`Sentinel session was refused immediately after login (HTTP ${res.status})`);
  }
  return res;
}
