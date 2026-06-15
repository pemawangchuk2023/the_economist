import { createR2SignedUrl, headR2Object, R2ConfigurationError } from "@/lib/r2";
import { normalizeObjectKey } from "@/lib/economist";
import { getAuthenticatedUserId } from "@/lib/auth";
import { incrementDownloadCount } from "@/lib/economist-store";

export const dynamic = "force-dynamic";

type DownloadRouteContext = {
  params: Promise<{
    key: string[];
  }>;
};

export const GET = async (_request: Request, context: DownloadRouteContext) => {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return Response.json(
        { error: "Please sign in to download this PDF." },
        { status: 401 }
      );
    }

    const { key: keySegments } = await context.params;
    const key = normalizeObjectKey(keySegments.join("/"));
    await headR2Object(key);

    const [signedUrl] = await Promise.all([
      createR2SignedUrl(key, "attachment"),
      incrementDownloadCount(key),
    ]);

    return Response.redirect(signedUrl, 302);
  } catch (error) {
    const message =
      error instanceof R2ConfigurationError
        ? "Cloudflare R2 is not fully configured yet."
        : "This PDF could not be downloaded.";

    return Response.json({ error: message }, { status: 500 });
  }
};
