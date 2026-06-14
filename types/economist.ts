export type ReadingStatus = "not-started" | "reading" | "completed";

export type PdfIssue = {
  key: string;
  fileName: string;
  title: string;
  year: string;
  month: string;
  size?: number;
  lastModified?: string;
};

export type BookmarkRecord = PdfIssue & {
  bookmarkedAt: string;
};

export type LibraryStore = {
  bookmarks: Record<string, BookmarkRecord>;
  readingStatuses: Record<string, ReadingStatus>;
};

export type PdfIssueResult = {
  issues: PdfIssue[];
  error?: string;
  missingConfig?: string[];
};

export type PdfReaderResult = {
  issue?: PdfIssue;
  signedUrl?: string;
  error?: string;
};
