"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  bookmarkIssueAction,
  removeBookmarkAction,
} from "@/actions/economist-actions";
import BookmarkButton from "@/components/economist/BookmarkButton";
import type { BookmarkRecord, PdfIssue } from "@/types/economist";

type IssueActionsProps = {
  issue: PdfIssue;
  initialBookmark?: BookmarkRecord;
};

const IssueActions = ({
  issue,
  initialBookmark,
}: IssueActionsProps) => {
  const [bookmark, setBookmark] = useState(initialBookmark);
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);

  const handleBookmarkToggle = () => {
    if (pendingRef.current) {
      return;
    }

    const previousBookmark = bookmark;
    pendingRef.current = true;
    setIsPending(true);
    setBookmark(
      previousBookmark
        ? undefined
        : {
            ...issue,
            bookmarkedAt: new Date().toISOString(),
          }
    );

    void (async () => {
      try {
        if (previousBookmark) {
          await removeBookmarkAction(issue.key);
          toast.success("Removed from bookmarks", {
            description: issue.title,
          });
        } else {
          setBookmark(await bookmarkIssueAction(issue.key));
          toast.success("Bookmarked successfully", {
            description: issue.title,
          });
        }
      } catch (error) {
        setBookmark(previousBookmark);
        toast.error("Bookmark update failed", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    })();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <BookmarkButton
        bookmarked={Boolean(bookmark)}
        disabled={isPending}
        onToggle={handleBookmarkToggle}
      />
    </div>
  );
};

export default IssueActions;
