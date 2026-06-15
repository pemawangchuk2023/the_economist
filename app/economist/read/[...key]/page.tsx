import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

import {
  getLibraryStateAction,
  getReaderDataAction,
} from "@/actions/economist-actions";
import IssueActions from "@/components/economist/IssueActions";
import PdfReader from "@/components/economist/PdfReader";
import { Button } from "@/components/ui/button";
import {
  formatBytes,
  formatDate,
  formatDownloadCount,
  getDownloadHref,
  normalizeObjectKey,
} from "@/lib/economist";

export const dynamic = "force-dynamic";

type ReaderPageProps = {
  params: Promise<{
    key: string[];
  }>;
};

const ReaderPage = async ({ params }: ReaderPageProps) => {
  const { key: keySegments } = await params;
  const key = normalizeObjectKey(keySegments.join("/"));
  const [reader, store] = await Promise.all([
    getReaderDataAction(key),
    getLibraryStateAction(),
  ]);

  if (!reader.issue || !reader.previewUrl) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/economist">
            <ArrowLeft />
            <span>Library</span>
          </Link>
        </Button>
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {reader.error ?? "This PDF could not be opened."}
        </div>
      </div>
    );
  }

  const issue = reader.issue;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 md:px-6 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/economist/${issue.year}/${issue.month}`}>
            <ArrowLeft />
            <span>{issue.month}</span>
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <a href={getDownloadHref(issue.key)}>
              <Download />
              <span>Download</span>
            </a>
          </Button>
          <IssueActions
            issue={issue}
            initialBookmark={store.bookmarks[issue.key]}
          />
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="break-words text-2xl font-semibold tracking-normal md:text-3xl">
          {issue.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {issue.year} / {issue.month} / {formatBytes(issue.size)} /{" "}
          {formatDate(issue.lastModified)} /{" "}
          {formatDownloadCount(issue.downloadCount)}
        </p>
      </header>

      <PdfReader
        title={issue.title}
        previewUrl={reader.previewUrl}
        downloadHref={getDownloadHref(issue.key)}
      />
    </div>
  );
};

export default ReaderPage;
