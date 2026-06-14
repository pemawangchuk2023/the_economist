"use server";

import { revalidatePath } from "next/cache";

import {
  createPdfIssue,
  encodeObjectKeyForPath,
  createPrefix,
  isReadingStatus,
  normalizeObjectKey,
  parsePdfKey,
  sortIssues,
} from "@/lib/economist";
import {
  createR2SignedUrl,
  headR2Object,
  listR2Objects,
  R2ConfigurationError,
} from "@/lib/r2";
import {
  getBookmarkedIssues,
  getLibraryState,
  removeBookmark,
  saveBookmark,
  saveReadingStatus,
} from "@/lib/economist-store";
import type {
  BookmarkRecord,
  LibraryStore,
  PdfIssue,
  PdfIssueResult,
  PdfReaderResult,
  ReadingStatus,
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
    const objects = await listR2Objects(createPrefix(year, month));
    const issues = objects
      .map((object) => createPdfIssue(object))
      .filter(isPdfIssue);

    return { issues: sortIssues(issues) };
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
    const normalizedKey = normalizeObjectKey(key);
    const issue = await getIssueFromR2(normalizedKey);
    const signedUrl = await createR2SignedUrl(normalizedKey, "inline");

    return { issue, signedUrl };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
};

export const getLibraryStateAction = async (): Promise<LibraryStore> =>
  getLibraryState();

export const getBookmarkedIssuesAction = async () => getBookmarkedIssues();

export const bookmarkIssueAction = async (
  key: string
): Promise<BookmarkRecord> => {
  const issue = await getIssueFromR2(key);
  const bookmark = await saveBookmark(issue);

  revalidateIssuePaths(issue.key);

  return bookmark;
};

export const removeBookmarkAction = async (key: string) => {
  const normalizedKey = normalizeObjectKey(key);
  await removeBookmark(normalizedKey);
  revalidateIssuePaths(normalizedKey);

  return normalizedKey;
};

export const setReadingStatusAction = async (
  key: string,
  status: ReadingStatus
) => {
  const normalizedKey = normalizeObjectKey(key);

  if (!parsePdfKey(normalizedKey) || !isReadingStatus(status)) {
    throw new Error("Invalid reading status update.");
  }

  const savedStatus = await saveReadingStatus(normalizedKey, status);
  revalidateIssuePaths(normalizedKey);

  return savedStatus;
};
