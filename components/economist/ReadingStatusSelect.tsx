"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isReadingStatus, READING_STATUS_LABELS } from "@/lib/economist";
import type { ReadingStatus } from "@/types/economist";

type ReadingStatusSelectProps = {
  value: ReadingStatus;
  disabled?: boolean;
  onValueChange: (status: ReadingStatus) => void;
};

const statuses = Object.entries(READING_STATUS_LABELS) as [
  ReadingStatus,
  string,
][];

const ReadingStatusSelect = ({
  value,
  disabled,
  onValueChange,
}: ReadingStatusSelectProps) => (
  <Select
    value={value}
    disabled={disabled}
    onValueChange={(nextValue) => {
      if (isReadingStatus(nextValue)) {
        onValueChange(nextValue);
      }
    }}
  >
    <SelectTrigger aria-label="Reading status" className="w-[132px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {statuses.map(([status, label]) => (
        <SelectItem key={status} value={status}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default ReadingStatusSelect;
