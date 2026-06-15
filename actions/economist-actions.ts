"use server";

import { revalidatePath } from "next/cache";

import {
  createPdfIssue,
  encodeObjectKeyForPath,
  createPrefix,
  getPreviewHref,
  normalizeObjectKey,
  parsePdfKey,
  sortIssues,
  withDownloadCount,
  withDownloadCounts,
} from "@/lib/economist";
import { requireAuthenticatedUserId } from "@/lib/auth";
import { headR2Object, listR2Objects, R2ConfigurationError } from "@/lib/r2";
import {
  getBookmarkedIssues,
  getDownloadCounts,
  getLibraryState,
  removeBookmark,
  saveBookmark,
} from "@/lib/economist-store";
import type {
  BookmarkRecord,
  LibraryStore,
  PdfIssue,
  PdfIssueResult,
  PdfReaderResult,
} from "@/types/economist";

type ListPdfIssuesInput = {
  year?: string;
  month?: string;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof R2ConfigurationError) {
    return "Cloudflare R2 is not fully configured yet.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while reading the PDF library.";
};

const getMissingConfig = (error: unknown) =>
  error instanceof R2ConfigurationError ? error.missingConfig : undefined;

const isPdfIssue = (issue: PdfIssue | null): issue is PdfIssue =>
  Boolean(issue);

const revalidateIssuePaths = (key: string) => {
  const parsed = parsePdfKey(key);

  revalidatePath("/economist");
  revalidatePath("/economist/bookmarks");

  if (parsed) {
    revalidatePath(`/economist/${parsed.year}`);
    revalidatePath(`/economist/${parsed.year}/${parsed.month}`);
    revalidatePath(`/economist/read/${encodeObjectKeyForPath(parsed.key)}`);
  }
};

const getIssueFromR2 = async (key: string) => {
  const object = await headR2Object(normalizeObjectKey(key));
  const issue = createPdfIssue(object);

  if (!issue) {
    throw new Error("The selected object is not a valid magazine PDF.");
  }

  return issue;
};

export const listPdfIssuesAction = async ({
  year,
  month,
}: ListPdfIssuesInput = {}): Promise<PdfIssueResult> => {
  try {
    await requireAuthenticatedUserId();

    const [objects, downloadCounts] = await Promise.all([
      listR2Objects(createPrefix(year, month)),
      getDownloadCounts(),
    ]);
    const issues = objects
      .map((object) => createPdfIssue(object))
      .filter(isPdfIssue);

    return { issues: sortIssues(withDownloadCounts(issues, downloadCounts)) };
  } catch (error) {
    return {
      issues: [],
      error: getErrorMessage(error),
      missingConfig: getMissingConfig(error),
    };
  }
};

export const getReaderDataAction = async (
  key: string
): Promise<PdfReaderResult> => {
  try {
    await requireAuthenticatedUserId();

    const normalizedKey = normalizeObjectKey(key);
    const [issue, downloadCounts] = await Promise.all([
      getIssueFromR2(normalizedKey),
      getDownloadCounts(),
    ]);

    return {
      issue: withDownloadCount(issue, downloadCounts),
      previewUrl: getPreviewHref(normalizedKey),
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
};

export const getLibraryStateAction = async (): Promise<LibraryStore> => {
  const userId = await requireAuthenticatedUserId();

  return getLibraryState(userId);
};

export const getBookmarkedIssuesAction = async () => {
  const userId = await requireAuthenticatedUserId();

  return getBookmarkedIssues(userId);
};

export const bookmarkIssueAction = async (
  key: string
): Promise<BookmarkRecord> => {
  const userId = await requireAuthenticatedUserId();
  const issue = await getIssueFromR2(key);
  const bookmark = await saveBookmark(userId, issue);

  revalidateIssuePaths(issue.key);

  return bookmark;
};

export const removeBookmarkAction = async (key: string) => {
  const userId = await requireAuthenticatedUserId();
  const normalizedKey = normalizeObjectKey(key);
  await removeBookmark(userId, normalizedKey);
  revalidateIssuePaths(normalizedKey);

  return normalizedKey;
};
