"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Download,
  Eye,
  FileText,
  Search,
} from "lucide-react";

import {
  bookmarkIssueAction,
  removeBookmarkAction,
  setReadingStatusAction,
} from "@/actions/economist-actions";
import ReadingStatusSelect from "@/components/economist/ReadingStatusSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_READING_STATUS,
  formatBytes,
  formatDate,
  getDownloadHref,
  getReadHref,
} from "@/lib/economist";
import type {
  BookmarkRecord,
  LibraryStore,
  PdfIssue,
  ReadingStatus,
} from "@/types/economist";

type IssueFileListProps = {
  issues: PdfIssue[];
  initialStore: LibraryStore;
  emptyMessage: string;
};

const applyStatus = (
  statuses: Record<string, ReadingStatus>,
  key: string,
  status: ReadingStatus
) => {
  const nextStatuses = { ...statuses };

  if (status === DEFAULT_READING_STATUS) {
    delete nextStatuses[key];
  } else {
    nextStatuses[key] = status;
  }

  return nextStatuses;
};

const createOptimisticBookmark = (issue: PdfIssue): BookmarkRecord => ({
  ...issue,
  bookmarkedAt: new Date().toISOString(),
});

const IssueFileList = ({
  issues,
  initialStore,
  emptyMessage,
}: IssueFileListProps) => {
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState(initialStore.bookmarks);
  const [readingStatuses, setReadingStatuses] = useState(
    initialStore.readingStatuses
  );
  const [pendingKeys, setPendingKeys] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const visibleIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return issues;
    }

    return issues.filter((issue) =>
      [issue.title, issue.fileName, issue.year, issue.month, issue.key]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [issues, query]);

  const setPending = (key: string, value: boolean) => {
    setPendingKeys((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleBookmarkToggle = (issue: PdfIssue) => {
    const wasBookmarked = Boolean(bookmarks[issue.key]);
    const previousBookmarks = bookmarks;

    setPending(issue.key, true);
    setBookmarks((current) => {
      const nextBookmarks = { ...current };

      if (wasBookmarked) {
        delete nextBookmarks[issue.key];
      } else {
        nextBookmarks[issue.key] = createOptimisticBookmark(issue);
      }

      return nextBookmarks;
    });

    startTransition(() => {
      void (async () => {
        try {
          if (wasBookmarked) {
            await removeBookmarkAction(issue.key);
          } else {
            const savedBookmark = await bookmarkIssueAction(issue.key);
            setBookmarks((current) => ({
              ...current,
              [issue.key]: savedBookmark,
            }));
          }
        } catch {
          setBookmarks(previousBookmarks);
        } finally {
          setPending(issue.key, false);
        }
      })();
    });
  };

  const handleStatusChange = (issue: PdfIssue, nextStatus: ReadingStatus) => {
    const previousStatuses = readingStatuses;

    setPending(issue.key, true);
    setReadingStatuses((current) =>
      applyStatus(current, issue.key, nextStatus)
    );

    startTransition(() => {
      void (async () => {
        try {
          await setReadingStatusAction(issue.key, nextStatus);
        } catch {
          setReadingStatuses(previousStatuses);
        } finally {
          setPending(issue.key, false);
        }
      })();
    });
  };

  if (!issues.length) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section className="w-full mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y-[3px] border-foreground bg-background py-3 mb-10">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">Search issues</span>
          <Search className="pointer-events-none absolute left-2 top-1/2 size-5 -translate-y-1/2 text-foreground" />
          <Input
            value={query}
            placeholder="Search issues..."
            className="pl-10 border-none bg-transparent shadow-none focus-visible:ring-0 rounded-none text-lg font-serif placeholder:text-muted-foreground/70 h-auto py-1"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="text-xs font-bold uppercase tracking-widest text-foreground px-2">
          {visibleIssues.length} of {issues.length} items
        </p>
      </div>

      {visibleIssues.length ? (
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visibleIssues.map((issue) => {
            const isPending = Boolean(pendingKeys[issue.key]);
            const isBookmarked = Boolean(bookmarks[issue.key]);

            return (
              <article
                key={issue.key}
                className="group flex flex-col border-t-2 border-foreground pt-4 relative bg-background transition-all hover:bg-muted/10"
              >
                <div className="absolute top-[-2px] left-0 h-[2px] w-0 bg-[#e3120b] transition-all duration-300 group-hover:w-full" />
                
                <header className="mb-4">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e3120b]">
                    {issue.month} {issue.year}
                  </span>
                  <Link href={getReadHref(issue.key)} className="block">
                    <h2 className="text-3xl font-serif font-bold leading-tight text-foreground transition-colors group-hover:text-[#e3120b] mb-2">
                      {issue.title}
                    </h2>
                  </Link>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {formatBytes(issue.size)} • {formatDate(issue.lastModified)}
                  </p>
                </header>

                <div className="mt-auto pt-6 flex flex-col gap-4 border-t border-border/50">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <Link
                      href={getReadHref(issue.key)}
                      className="hover:text-[#e3120b] transition-colors flex items-center gap-1"
                    >
                      <Eye className="size-3" /> Read
                    </Link>
                    <a
                      href={getDownloadHref(issue.key)}
                      className="hover:text-[#e3120b] transition-colors flex items-center gap-1"
                    >
                      <Download className="size-3" /> Download
                    </a>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleBookmarkToggle(issue)}
                      className={`transition-colors flex items-center gap-1 ${isBookmarked ? "text-[#e3120b]" : "hover:text-[#e3120b]"}`}
                    >
                      {isBookmarked ? <BookmarkCheck className="size-3" /> : <Bookmark className="size-3" />}
                      {isBookmarked ? "Saved" : "Save"}
                    </button>
                  </div>
                  
                  <div className="w-full">
                    <ReadingStatusSelect
                      value={readingStatuses[issue.key] ?? DEFAULT_READING_STATUS}
                      disabled={isPending}
                      onValueChange={(nextStatus) => handleStatusChange(issue, nextStatus)}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-lg font-serif text-muted-foreground">
          No matching issues.
        </div>
      )}
    </section>
  );
};

export default IssueFileList;
