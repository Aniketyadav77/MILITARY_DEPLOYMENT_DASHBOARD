import { fetchCatalogue } from "@/lib/sentinel/catalogue";
import type { CatalogueError, CatalogueResponse } from "@/lib/sentinel/types";
import { SentinelCooldownError } from "@/lib/sentinel/upstream";

/** Camera catalogue for the browser: `{ id, name }` per camera, straight from Sentinel. */
export async function GET() {
  try {
    const cameras = await fetchCatalogue();
    const body: CatalogueResponse = { cameras, fetchedAt: new Date().toISOString() };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof SentinelCooldownError) {
      // Logged once by the upstream module when the cooldown starts.
      const body: CatalogueError = {
        error: "Sentinel watch-time limit reached — waiting for the provider's cooldown",
        cooldownRetryAt: new Date(err.retryAt).toISOString(),
      };
      return Response.json(body, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    console.warn("[sentinel] catalogue unavailable:", (err as Error).message);
    const body: CatalogueError = { error: "Camera catalogue unavailable" };
    return Response.json(body, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
