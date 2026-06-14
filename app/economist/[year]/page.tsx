import { notFound } from "next/navigation";

import { listPdfIssuesAction } from "@/actions/economist-actions";
import FolderGrid from "@/components/economist/FolderGrid";
import LibraryNotice from "@/components/economist/LibraryNotice";
import MonthPicker from "@/components/economist/MonthPicker";
import PageFrame from "@/components/economist/PageFrame";
import { MONTHS } from "@/lib/economist";

export const dynamic = "force-dynamic";

type YearPageProps = {
  params: Promise<{
    year: string;
  }>;
};

const YearPage = async ({ params }: YearPageProps) => {
  const { year } = await params;

  if (!/^\d{4}$/.test(year)) {
    notFound();
  }

  const library = await listPdfIssuesAction({ year });
  const monthCounts = new Map<string, number>();

  library.issues.forEach((issue) => {
    monthCounts.set(issue.month, (monthCounts.get(issue.month) ?? 0) + 1);
  });

  const monthFolders = MONTHS.map((month) => ({
    href: `/economist/${year}/${month}`,
    label: month,
    description: "Open month folder",
    count: monthCounts.get(month) ?? 0,
  }));

  return (
    <PageFrame
      title={`${year} Issues`}
      description="Choose a month folder or use the month dropdown. Files stay inside the month view."
      backHref="/"
      backLabel="Years"
      actions={<MonthPicker year={year} />}
    >
      <div className="space-y-5">
        <LibraryNotice
          error={library.error}
          missingConfig={library.missingConfig}
        />
        <FolderGrid items={monthFolders} />
      </div>
    </PageFrame>
  );
};

export default YearPage;
