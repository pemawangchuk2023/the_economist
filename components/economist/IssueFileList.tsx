"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Eye, Search } from "lucide-react";
import { toast } from "sonner";

import {
  bookmarkIssueAction,
  removeBookmarkAction,
} from "@/actions/economist-actions";
import DownloadIssueAction from "@/components/economist/DownloadIssueAction";
import { Input } from "@/components/ui/input";
import {
  formatBytes,
  formatDate,
  formatDownloadCount,
  getReadHref,
} from "@/lib/economist";
import type { BookmarkRecord, LibraryStore, PdfIssue } from "@/types/economist";

type IssueFileListProps = {
  issues: PdfIssue[];
  initialStore: LibraryStore;
  emptyMessage: string;
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
  const [pendingKeys, setPendingKeys] = useState<Record<string, boolean>>({});
  const pendingKeySetRef = useRef(new Set<string>());

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
    if (pendingKeySetRef.current.has(issue.key)) {
      return;
    }

    const wasBookmarked = Boolean(bookmarks[issue.key]);
    const previousBookmark = bookmarks[issue.key];

    pendingKeySetRef.current.add(issue.key);
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

    void (async () => {
      try {
        if (wasBookmarked) {
          await removeBookmarkAction(issue.key);
          toast.success("Removed from bookmarks", {
            description: issue.title,
          });
        } else {
          const savedBookmark = await bookmarkIssueAction(issue.key);
          setBookmarks((current) => ({
            ...current,
            [issue.key]: savedBookmark,
          }));
          toast.success("Bookmarked successfully", {
            description: issue.title,
          });
        }
      } catch (error) {
        setBookmarks((current) => {
          const nextBookmarks = { ...current };

          if (previousBookmark) {
            nextBookmarks[issue.key] = previousBookmark;
          } else {
            delete nextBookmarks[issue.key];
          }

          return nextBookmarks;
        });
        toast.error("Bookmark update failed", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        pendingKeySetRef.current.delete(issue.key);
        setPending(issue.key, false);
      }
    })();
  };

  if (!issues.length) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section className="mb-10 w-full">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-y-[3px] border-foreground bg-background py-3">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">Search issues</span>
          <Search className="pointer-events-none absolute left-2 top-1/2 size-5 -translate-y-1/2 text-foreground" />
          <Input
            value={query}
            placeholder="Search issues..."
            className="h-auto rounded-none border-none bg-transparent py-1 pl-10 font-serif text-lg shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="px-2 text-xs font-bold uppercase tracking-widest text-foreground">
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
                className="group relative flex flex-col border-t-2 border-foreground bg-background pt-4 transition-all hover:bg-muted/10"
              >
                <div className="absolute left-0 top-[-2px] h-[2px] w-0 bg-[#e3120b] transition-all duration-300 group-hover:w-full" />

                <header className="mb-4">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e3120b]">
                    {issue.month} {issue.year}
                  </span>
                  <Link href={getReadHref(issue.key)} className="block">
                    <h2 className="mb-2 text-3xl font-bold leading-tight text-foreground transition-colors group-hover:text-[#e3120b]">
                      {issue.title}
                    </h2>
                  </Link>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {formatBytes(issue.size)} / {formatDate(issue.lastModified)}{" "}
                    / {formatDownloadCount(issue.downloadCount)}
                  </p>
                </header>

                <div className="mt-auto flex flex-col gap-4 border-t border-border/50 pt-6">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <Link
                      href={getReadHref(issue.key)}
                      className="flex items-center gap-1 transition-colors hover:text-[#e3120b]"
                    >
                      <Eye className="size-3" /> Read
                    </Link>
                    <DownloadIssueAction issue={issue} />
                    <button
                      type="button"
                      aria-pressed={isBookmarked}
                      disabled={isPending}
                      onClick={() => handleBookmarkToggle(issue)}
                      className={`flex items-center gap-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isBookmarked
                          ? "text-[#e3120b]"
                          : "hover:text-[#e3120b]"
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="size-3" />
                      ) : (
                        <Bookmark className="size-3" />
                      )}
                      {isBookmarked ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center font-serif text-lg text-muted-foreground">
          No matching issues.
        </div>
      )}
    </section>
  );
};

export default IssueFileList;
