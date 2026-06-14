"use client";

import { useState, useTransition } from "react";

import {
  bookmarkIssueAction,
  removeBookmarkAction,
  setReadingStatusAction,
} from "@/actions/economist-actions";
import BookmarkButton from "@/components/economist/BookmarkButton";
import ReadingStatusSelect from "@/components/economist/ReadingStatusSelect";
import { DEFAULT_READING_STATUS } from "@/lib/economist";
import type { BookmarkRecord, PdfIssue, ReadingStatus } from "@/types/economist";

type IssueActionsProps = {
  issue: PdfIssue;
  initialBookmark?: BookmarkRecord;
  initialStatus?: ReadingStatus;
};

const IssueActions = ({
  issue,
  initialBookmark,
  initialStatus = DEFAULT_READING_STATUS,
}: IssueActionsProps) => {
  const [bookmark, setBookmark] = useState(initialBookmark);
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleBookmarkToggle = () => {
    const previousBookmark = bookmark;
    setBookmark(
      previousBookmark
        ? undefined
        : {
            ...issue,
            bookmarkedAt: new Date().toISOString(),
          }
    );

    startTransition(() => {
      void (async () => {
        try {
          if (previousBookmark) {
            await removeBookmarkAction(issue.key);
          } else {
            setBookmark(await bookmarkIssueAction(issue.key));
          }
        } catch {
          setBookmark(previousBookmark);
        }
      })();
    });
  };

  const handleStatusChange = (nextStatus: ReadingStatus) => {
    const previousStatus = status;
    setStatus(nextStatus);

    startTransition(() => {
      void (async () => {
        try {
          await setReadingStatusAction(issue.key, nextStatus);
        } catch {
          setStatus(previousStatus);
        }
      })();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <BookmarkButton
        bookmarked={Boolean(bookmark)}
        disabled={isPending}
        onToggle={handleBookmarkToggle}
      />
      <ReadingStatusSelect
        value={status}
        disabled={isPending}
        onValueChange={handleStatusChange}
      />
    </div>
  );
};

export default IssueActions;
