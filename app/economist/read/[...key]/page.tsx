import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

import { getReaderDataAction } from "@/actions/economist-actions";
import PdfReader from "@/components/economist/PdfReader";
import { Button } from "@/components/ui/button";
import { getDownloadHref, normalizeObjectKey } from "@/lib/economist";

export const dynamic = "force-dynamic";

type ReaderPageProps = {
  params: Promise<{
    key: string[];
  }>;
};

const ReaderPage = async ({ params }: ReaderPageProps) => {
  const { key: keySegments } = await params;
  const key = normalizeObjectKey(keySegments.join("/"));
  const reader = await getReaderDataAction(key);

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
    <div className="fixed inset-0 z-50 bg-background">
      <Button
        asChild
        variant="secondary"
        size="sm"
        className="absolute right-4 top-4 z-10 shadow-lg"
      >
        <Link href={`/economist/${issue.year}/${issue.month}`}>
          <X className="size-4" />
          <span>Close</span>
        </Link>
      </Button>

      <PdfReader
        title={issue.title}
        previewUrl={reader.previewUrl}
        downloadHref={getDownloadHref(issue.key)}
        className="h-screen min-h-0 w-screen rounded-none border-0"
      />
    </div>
  );
};

export default ReaderPage;
