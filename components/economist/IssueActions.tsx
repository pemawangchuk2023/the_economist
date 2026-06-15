"use client";

import { useRef, useState } from "react";

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
        } else {
          setBookmark(await bookmarkIssueAction(issue.key));
        }
      } catch {
        setBookmark(previousBookmark);
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
