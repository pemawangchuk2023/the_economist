import "server-only";

import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { normalizeObjectKey, parsePdfKey } from "@/lib/economist";

type R2Object = {
  key: string;
  size?: number;
  lastModified?: Date;
};

type R2Config = {
  bucketName: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  signedUrlExpiresSeconds: number;
};

export class R2ConfigurationError extends Error {
  missingConfig: string[];

  constructor(missingConfig: string[]) {
    super(`Cloudflare R2 is missing configuration: ${missingConfig.join(", ")}`);
    this.name = "R2ConfigurationError";
    this.missingConfig = missingConfig;
  }
}

let r2Client: S3Client | null = null;
let r2ClientSignature = "";

const getEnvValue = (name: string) => process.env[name]?.trim() ?? "";

export const getR2ConfigStatus = () => {
  const accountId = getEnvValue("R2_ACCOUNT_ID");
  const endpoint = getEnvValue("R2_ENDPOINT");
  const missingConfig = [
    !getEnvValue("R2_ACCESS_KEY_ID") ? "R2_ACCESS_KEY_ID" : "",
    !getEnvValue("R2_SECRET_ACCESS_KEY") ? "R2_SECRET_ACCESS_KEY" : "",
    !endpoint && !accountId ? "R2_ENDPOINT or R2_ACCOUNT_ID" : "",
  ].filter(Boolean);

  return {
    bucketName: getEnvValue("R2_BUCKET_NAME") || "economist-pdfs",
    isConfigured: missingConfig.length === 0,
    missingConfig,
  };
};

const getR2Config = (): R2Config => {
  const status = getR2ConfigStatus();

  if (!status.isConfigured) {
    throw new R2ConfigurationError(status.missingConfig);
  }

  const accountId = getEnvValue("R2_ACCOUNT_ID");
  const endpoint =
    getEnvValue("R2_ENDPOINT") || `https://${accountId}.r2.cloudflarestorage.com`;
  const signedUrlExpiresSeconds = Number(
    getEnvValue("R2_SIGNED_URL_EXPIRES_SECONDS") || "900"
  );

  return {
    bucketName: status.bucketName,
    endpoint: endpoint.replace(/\/+$/, ""),
    region: getEnvValue("R2_REGION") || "auto",
    accessKeyId: getEnvValue("R2_ACCESS_KEY_ID"),
    secretAccessKey: getEnvValue("R2_SECRET_ACCESS_KEY"),
    signedUrlExpiresSeconds: Number.isFinite(signedUrlExpiresSeconds)
      ? signedUrlExpiresSeconds
      : 900,
  };
};

const getR2Client = () => {
  const config = getR2Config();
  const signature = [
    config.endpoint,
    config.region,
    config.accessKeyId,
    config.bucketName,
  ].join("|");

  if (!r2Client || r2ClientSignature !== signature) {
    r2Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    r2ClientSignature = signature;
  }

  return { client: r2Client, config };
};

const assertPdfKey = (key: string) => {
  const normalizedKey = normalizeObjectKey(key);

  if (!parsePdfKey(normalizedKey)) {
    throw new Error("Invalid PDF object key.");
  }

  return normalizedKey;
};

const createContentDisposition = (
  mode: "inline" | "attachment",
  key: string
) => {
  const fileName =
    key.split("/").at(-1)?.replace(/["\r\n]/g, "") || "issue.pdf";

  return `${mode}; filename="${fileName}"`;
};

export const listR2Objects = async (prefix = "") => {
  const { client, config } = getR2Client();
  const objects: R2Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucketName,
        Prefix: prefix,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      })
    );

    response.Contents?.forEach((object) => {
      if (object.Key && object.Key.toLowerCase().endsWith(".pdf")) {
        objects.push({
          key: object.Key,
          size: object.Size,
          lastModified: object.LastModified,
        });
      }
    });

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
};

export const headR2Object = async (key: string): Promise<R2Object> => {
  const normalizedKey = assertPdfKey(key);
  const { client, config } = getR2Client();
  const response = await client.send(
    new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: normalizedKey,
    })
  );

  return {
    key: normalizedKey,
    size: response.ContentLength,
    lastModified: response.LastModified,
  };
};

export const createR2SignedUrl = async (
  key: string,
  mode: "inline" | "attachment"
) => {
  const normalizedKey = assertPdfKey(key);
  const { client, config } = getR2Client();
  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: normalizedKey,
    ResponseContentDisposition: createContentDisposition(mode, normalizedKey),
    ResponseContentType: "application/pdf",
  });

  return getSignedUrl(client, command, {
    expiresIn: config.signedUrlExpiresSeconds,
  });
};
