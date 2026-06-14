import type { PdfIssue, ReadingStatus } from "@/types/economist";

export const LIBRARY_YEARS = ["2026", "2025", "2024", "2023"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DEFAULT_READING_STATUS: ReadingStatus = "not-started";

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  "not-started": "Not Started",
  reading: "Reading",
  completed: "Completed",
};

type R2ObjectLike = {
  key: string;
  size?: number;
  lastModified?: Date | string;
};

export const isReadingStatus = (value: string): value is ReadingStatus =>
  value === "not-started" || value === "reading" || value === "completed";

export const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const normalizeObjectKey = (key: string) =>
  key
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => safeDecodeURIComponent(segment))
    .join("/")
    .replace(/^\/+/, "");

export const getMonthFromSlug = (monthSlug: string) => {
  const normalized = safeDecodeURIComponent(monthSlug).toLowerCase();

  return MONTHS.find((month) => month.toLowerCase() === normalized);
};

export const parsePdfKey = (key: string) => {
  const normalizedKey = normalizeObjectKey(key);
  const parts = normalizedKey.split("/").filter(Boolean);
  const [year, month] = parts;
  const fileName = parts.at(-1) ?? "";

  if (
    !/^\d{4}$/.test(year ?? "") ||
    !month ||
    !fileName.toLowerCase().endsWith(".pdf")
  ) {
    return null;
  }

  const normalizedMonth = getMonthFromSlug(month);

  if (!normalizedMonth) {
    return null;
  }

  return {
    key: normalizedKey,
    year,
    month: normalizedMonth,
    fileName,
  };
};

export const createIssueTitle = (fileName: string) =>
  fileName.replace(/\.pdf$/i, "").replace(/\s+/g, " ").trim();

export const createPdfIssue = (object: R2ObjectLike): PdfIssue | null => {
  const parsed = parsePdfKey(object.key);

  if (!parsed) {
    return null;
  }

  const lastModified =
    object.lastModified instanceof Date
      ? object.lastModified.toISOString()
      : object.lastModified;

  return {
    key: parsed.key,
    fileName: parsed.fileName,
    title: createIssueTitle(parsed.fileName),
    year: parsed.year,
    month: parsed.month,
    size: object.size,
    lastModified,
  };
};

export const createPrefix = (year?: string, month?: string) => {
  if (year && month) {
    return `${year}/${month}/`;
  }

  if (year) {
    return `${year}/`;
  }

  return "";
};

export const sortIssues = (issues: PdfIssue[]) =>
  [...issues].sort((left, right) => {
    const leftDate = left.lastModified ? Date.parse(left.lastModified) : 0;
    const rightDate = right.lastModified ? Date.parse(right.lastModified) : 0;

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    return right.key.localeCompare(left.key);
  });

export const encodeObjectKeyForPath = (key: string) =>
  normalizeObjectKey(key).split("/").map(encodeURIComponent).join("/");

export const getReadHref = (key: string) =>
  `/economist/read/${encodeObjectKeyForPath(key)}`;

export const getDownloadHref = (key: string) =>
  `/economist/download/${encodeObjectKeyForPath(key)}`;

export const formatBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) {
    return "Unknown size";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${
    units[exponent]
  }`;
};

export const formatDate = (date?: string) => {
  if (!date) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};
