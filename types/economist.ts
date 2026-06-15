export type PdfIssue = {
  key: string;
  fileName: string;
  title: string;
  year: string;
  month: string;
  size?: number;
  lastModified?: string;
  downloadCount: number;
};

export type BookmarkRecord = PdfIssue & {
  bookmarkedAt: string;
};

export type LibraryStore = {
  bookmarks: Record<string, BookmarkRecord>;
  downloadCounts: Record<string, number>;
};

export type PdfIssueResult = {
  issues: PdfIssue[];
  error?: string;
  missingConfig?: string[];
};

export type PdfReaderResult = {
  issue?: PdfIssue;
  previewUrl?: string;
  error?: string;
};
