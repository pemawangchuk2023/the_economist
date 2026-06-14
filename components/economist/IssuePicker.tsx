"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReadHref } from "@/lib/economist";
import type { PdfIssue } from "@/types/economist";

type IssuePickerProps = {
  issues: PdfIssue[];
};

const IssuePicker = ({ issues }: IssuePickerProps) => {
  const router = useRouter();

  return (
    <Select onValueChange={(key) => router.push(getReadHref(key))}>
      <SelectTrigger className="w-full sm:w-[340px]" aria-label="Select PDF file">
        <SelectValue placeholder="Select file" />
      </SelectTrigger>
      <SelectContent>
        {issues.map((issue) => (
          <SelectItem key={issue.key} value={issue.key}>
            {issue.fileName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IssuePicker;
