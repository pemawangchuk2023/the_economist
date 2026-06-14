import { notFound } from "next/navigation";

import {
  getLibraryStateAction,
  listPdfIssuesAction,
} from "@/actions/economist-actions";
import IssueFileList from "@/components/economist/IssueFileList";
import IssuePicker from "@/components/economist/IssuePicker";
import LibraryNotice from "@/components/economist/LibraryNotice";
import MonthPicker from "@/components/economist/MonthPicker";
import PageFrame from "@/components/economist/PageFrame";
import { getMonthFromSlug } from "@/lib/economist";

export const dynamic = "force-dynamic";

type MonthPageProps = {
  params: Promise<{
    year: string;
    month: string;
  }>;
};

const MonthPage = async ({ params }: MonthPageProps) => {
  const { year, month: monthSlug } = await params;
  const month = getMonthFromSlug(monthSlug);

  if (!/^\d{4}$/.test(year) || !month) {
    notFound();
  }

  const [library, store] = await Promise.all([
    listPdfIssuesAction({ year, month }),
    getLibraryStateAction(),
  ]);

  return (
    <PageFrame
      title={`${month} ${year}`}
      description={`Files inside the ${year}/${month}/ R2 folder.`}
      backHref={`/economist/${year}`}
      backLabel={year}
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <MonthPicker year={year} selectedMonth={month} />
          <IssuePicker issues={library.issues} />
        </div>
      }
    >
      <div className="space-y-5">
        <LibraryNotice
          error={library.error}
          missingConfig={library.missingConfig}
        />
        <IssueFileList
          issues={library.issues}
          initialStore={store}
          emptyMessage="No PDF files were found in this month folder."
        />
      </div>
    </PageFrame>
  );
};

export default MonthPage;
