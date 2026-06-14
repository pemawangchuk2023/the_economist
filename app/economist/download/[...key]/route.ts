import { createR2SignedUrl, R2ConfigurationError } from "@/lib/r2";
import { normalizeObjectKey } from "@/lib/economist";

export const dynamic = "force-dynamic";

type DownloadRouteContext = {
  params: Promise<{
    key: string[];
  }>;
};

export const GET = async (_request: Request, context: DownloadRouteContext) => {
  try {
    const { key: keySegments } = await context.params;
    const key = normalizeObjectKey(keySegments.join("/"));
    const signedUrl = await createR2SignedUrl(key, "attachment");

    return Response.redirect(signedUrl, 302);
  } catch (error) {
    const message =
      error instanceof R2ConfigurationError
        ? "Cloudflare R2 is not fully configured yet."
        : "This PDF could not be downloaded.";

    return Response.json({ error: message }, { status: 500 });
  }
};
