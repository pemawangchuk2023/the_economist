"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createDownloadUrlAction } from "@/actions/economist-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PdfIssue } from "@/types/economist";

type DownloadIssueActionProps = {
  issue: Pick<PdfIssue, "key" | "title">;
  className?: string;
  mode?: "button" | "link";
};

const startBrowserDownload = (url: string, fileName: string) => {
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noreferrer";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
};

const DownloadIssueAction = ({
  issue,
  className,
  mode = "link",
}: DownloadIssueActionProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleDownload = () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    const toastId = toast.loading("Preparing download", {
      description: issue.title,
    });

    void (async () => {
      try {
        const download = await createDownloadUrlAction(issue.key);
        startBrowserDownload(download.url, download.fileName);
        toast.success("Download started successfully", {
          id: toastId,
          description: issue.title,
        });
      } catch (error) {
        toast.error("Download failed", {
          id: toastId,
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setIsPending(false);
      }
    })();
  };

  if (mode === "button") {
    return (
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        className={className}
        onClick={handleDownload}
      >
        <Download />
        <span>{isPending ? "Preparing" : "Download"}</span>
      </Button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      className={cn(
        "flex items-center gap-1 transition-colors hover:text-[#e3120b] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      onClick={handleDownload}
    >
      <Download className="size-3" />
      <span>{isPending ? "Preparing" : "Download"}</span>
    </button>
  );
};

export default DownloadIssueAction;
