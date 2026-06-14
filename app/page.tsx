import AppChrome from "@/components/economist/AppChrome";
import FolderGrid from "@/components/economist/FolderGrid";
import PageFrame from "@/components/economist/PageFrame";
import { LIBRARY_YEARS } from "@/lib/economist";

const yearFolders = LIBRARY_YEARS.map((year) => ({
  href: `/economist/${year}`,
  label: year,
}));

const Home = () => (
  <AppChrome>
    <PageFrame
      title="Archive Library"
      description="Choose a year folder first. Month folders and PDF files are loaded securely from private paths."
    >
      <FolderGrid items={yearFolders} />
      
      <div className="mt-20 border-t border-border pt-8 text-center max-w-2xl mx-auto">
        <p className="text-xl font-serif italic text-muted-foreground leading-relaxed">
          <strong>Important Notice:</strong> This archive is compiled strictly for personal, academic learning purposes. It is not intended for commercial use or broad distribution. Please respect the intellectual property of the original publishers.
        </p>
      </div>
    </PageFrame>
  </AppChrome>
);

export default Home;
