import {
  getBookmarkedIssuesAction,
  getLibraryStateAction,
} from "@/actions/economist-actions";
import IssueFileList from "@/components/economist/IssueFileList";
import PageFrame from "@/components/economist/PageFrame";

export const dynamic = "force-dynamic";

const BookmarksPage = async () => {
  const [issues, store] = await Promise.all([
    getBookmarkedIssuesAction(),
    getLibraryStateAction(),
  ]);

  return (
    <PageFrame
      title="Bookmarked Issues"
      description="Saved files from the server-side private library store."
      backHref="/"
      backLabel="Library"
    >
      <IssueFileList
        issues={issues}
        initialStore={store}
        emptyMessage="No files are bookmarked yet."
      />
    </PageFrame>
  );
};

export default BookmarksPage;
