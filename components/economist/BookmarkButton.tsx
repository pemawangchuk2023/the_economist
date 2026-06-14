"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

type BookmarkButtonProps = {
  bookmarked: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

const BookmarkButton = ({
  bookmarked,
  disabled,
  onToggle,
}: BookmarkButtonProps) => (
  <Button
    type="button"
    variant={bookmarked ? "secondary" : "outline"}
    size="sm"
    aria-pressed={bookmarked}
    disabled={disabled}
    onClick={onToggle}
  >
    {bookmarked ? <BookmarkCheck /> : <Bookmark />}
    <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
  </Button>
);

export default BookmarkButton;
