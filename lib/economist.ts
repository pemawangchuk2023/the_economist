import type { PdfIssue } from "@/types/economist";

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

type R2ObjectLike = {
  key: string;
  size?: number;
  lastModified?: Date | string;
};

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
    downloadCount: 0,
  };
};

export const withDownloadCount = <T extends PdfIssue>(
  issue: T,
  downloadCounts: Record<string, number>
): T => ({
  ...issue,
  downloadCount: Math.max(0, Math.trunc(downloadCounts[issue.key] ?? 0)),
});

export const withDownloadCounts = <T extends PdfIssue>(
  issues: T[],
  downloadCounts: Record<string, number>
) => issues.map((issue) => withDownloadCount(issue, downloadCounts));

export const formatDownloadCount = (count: number) => {
  const normalizedCount = Math.max(0, Math.trunc(count));

  return `${new Intl.NumberFormat("en").format(normalizedCount)} ${
    normalizedCount === 1 ? "download" : "downloads"
  }`;
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

const MONTH_INDEXES = new Map(
  MONTHS.flatMap((month, index) => [
    [month.toLowerCase(), index] as const,
    [month.slice(0, 3).toLowerCase(), index] as const,
  ])
);

MONTH_INDEXES.set("sept", 8);

const MONTH_PATTERN = Array.from(MONTH_INDEXES.keys())
  .sort((left, right) => right.length - left.length)
  .join("|");
const ISSUE_START_DATE_PATTERN = new RegExp(
  `\\b(${MONTH_PATTERN})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`,
  "i"
);

const getIssueStartTime = (issue: PdfIssue) => {
  const dateSource = `${issue.title} ${issue.fileName}`.replace(/[_+]+/g, " ");
  const match = dateSource.match(ISSUE_START_DATE_PATTERN);

  if (!match) {
    return null;
  }

  const monthIndex = MONTH_INDEXES.get(match[1].toLowerCase());
  const day = Number(match[2]);
  const year = Number(issue.year);

  if (monthIndex === undefined || !Number.isInteger(year)) {
    return null;
  }

  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  if (!Number.isInteger(day) || day < 1 || day > daysInMonth) {
    return null;
  }

  return Date.UTC(year, monthIndex, day);
};

export const sortIssues = (issues: PdfIssue[]) =>
  [...issues].sort((left, right) => {
    const leftIssueDate = getIssueStartTime(left);
    const rightIssueDate = getIssueStartTime(right);

    if (leftIssueDate !== null || rightIssueDate !== null) {
      if (leftIssueDate === null) {
        return 1;
      }

      if (rightIssueDate === null) {
        return -1;
      }

      if (leftIssueDate !== rightIssueDate) {
        return leftIssueDate - rightIssueDate;
      }
    }

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

export const getPreviewHref = (key: string) =>
  `/economist/preview/${encodeObjectKeyForPath(key)}`;

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
