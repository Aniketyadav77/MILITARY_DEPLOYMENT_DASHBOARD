import { isKnownCamera } from "@/lib/sentinel/catalogue";
import { latestSnapshot } from "@/lib/sentinel/snapshots";
import { SentinelCooldownError, sentinelCooldown } from "@/lib/sentinel/upstream";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Latest still frame for one camera (JPEG). Answers immediately from memory:
 * 204 while the first frame is still being fetched, 502 while the camera is
 * failing and has no frame yet. `X-Captured-At` is when the frame was taken.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/sentinel/snapshot/[id]">) {
  const { id } = await ctx.params;

  try {
    if (!(await isKnownCamera(id))) return new Response("Not found", { status: 404, headers: NO_STORE });
  } catch (err) {
    if (err instanceof SentinelCooldownError) return new Response(null, { status: 503, headers: NO_STORE });
    console.warn("[sentinel] snapshot catalogue check failed:", (err as Error).message);
    return new Response("Upstream unavailable", { status: 502, headers: NO_STORE });
  }

  const { snap, failing } = latestSnapshot(id);
  if (!snap) return new Response(null, { status: sentinelCooldown() ? 503 : failing ? 502 : 204, headers: NO_STORE });

  return new Response(new Uint8Array(snap.jpeg), {
    headers: {
      ...NO_STORE,
      "Content-Type": "image/jpeg",
      "X-Captured-At": String(snap.capturedAt),
      "X-Snapshot-Failing": failing ? "1" : "0",
    },
  });
}
