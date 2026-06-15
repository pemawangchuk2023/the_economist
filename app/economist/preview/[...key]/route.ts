import { Readable } from "node:stream";

import { getAuthenticatedUserId } from "@/lib/auth";
import { normalizeObjectKey } from "@/lib/economist";
import {
  createR2ContentDisposition,
  getR2PdfObject,
  headR2Object,
  isR2NotFoundError,
  R2ConfigurationError,
} from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PreviewRouteContext = {
  params: Promise<{
    key: string[];
  }>;
};

type PreviewHeadersInput = {
  key: string;
  contentLength?: number;
  contentRange?: string;
  etag?: string;
  lastModified?: Date;
};

const unauthorizedResponse = () =>
  Response.json(
    { error: "Please sign in to preview this PDF." },
    { status: 401 }
  );

const getRouteKey = async (context: PreviewRouteContext) => {
  const { key: keySegments } = await context.params;

  return normalizeObjectKey(keySegments.join("/"));
};

const createPreviewHeaders = ({
  key,
  contentLength,
  contentRange,
  etag,
  lastModified,
}: PreviewHeadersInput) => {
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store, max-age=0",
   "Content-Disposition": createR2ContentDisposition("inline", key.replace(/[^\x20-\x7E]/g, "-")),
    "Content-Type": "application/pdf",
    "X-Content-Type-Options": "nosniff",
  });

  if (contentLength !== undefined) {
    headers.set("Content-Length", String(contentLength));
  }

  if (contentRange) {
    headers.set("Content-Range", contentRange);
  }

  if (etag) {
    headers.set("ETag", etag);
  }

  if (lastModified) {
    headers.set("Last-Modified", lastModified.toUTCString());
  }

  return headers;
};

const createPreviewError = (error: unknown) => {
  console.error("PDF preview failed:", {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : undefined,
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof R2ConfigurationError) {
    return Response.json(
      { error: "Cloudflare R2 is not fully configured yet." },
      { status: 500 }
    );
  }

  if (isR2NotFoundError(error)) {
    return Response.json(
      { error: "This PDF could not be found." },
      { status: 404 }
    );
  }

  if (error instanceof Error && error.name === "InvalidRange") {
    return Response.json(
      { error: "The requested PDF byte range is not available." },
      { status: 416 }
    );
  }

  return Response.json(
    { error: "This PDF could not be previewed." },
    { status: 500 }
  );
};

const toResponseBody = (
  body: NonNullable<Awaited<ReturnType<typeof getR2PdfObject>>["body"]>
) => {
  if (!body) {
    throw new Error("PDF body is empty or null");
  }

  if (
    "transformToWebStream" in body &&
    typeof body.transformToWebStream === "function"
  ) {
    return body.transformToWebStream();
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream;
  }

  if (body instanceof ArrayBuffer || body instanceof Uint8Array) {
    return body;
  }

  throw new Error(
    `Unsupported body type: ${typeof body} - ${body?.constructor?.name || "unknown"}`
  );
};

export const HEAD = async (
  _request: Request,
  context: PreviewRouteContext
) => {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const key = await getRouteKey(context);
    const object = await headR2Object(key);

    return new Response(null, {
      headers: createPreviewHeaders({
        key,
        contentLength: object.size,
        lastModified: object.lastModified,
      }),
    });
  } catch (error) {
    return createPreviewError(error);
  }
};

export const GET = async (request: Request, context: PreviewRouteContext) => {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const key = await getRouteKey(context);
    const range = request.headers.get("range") ?? undefined;
    const object = await getR2PdfObject(key, range);

    if (!object.body) {
      throw new Error(
        `PDF body is missing for key: ${key}, contentLength: ${object.contentLength}`
      );
    }

    const body = toResponseBody(object.body);

    return new Response(body, {
      status: object.contentRange ? 206 : 200,
      headers: createPreviewHeaders({
        key,
        contentLength: object.contentLength,
        contentRange: object.contentRange,
        etag: object.etag,
        lastModified: object.lastModified,
      }),
    });
  } catch (error) {
    return createPreviewError(error);
  }
};
