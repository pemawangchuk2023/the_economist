import AppChrome from "@/components/economist/AppChrome";
import FolderGrid from "@/components/economist/FolderGrid";
import PageFrame from "@/components/economist/PageFrame";
import { LIBRARY_YEARS } from "@/lib/economist";
import { Show, SignUpButton, SignInButton } from "@clerk/nextjs";

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
      <Show when="signed-in">
        <FolderGrid items={yearFolders} />
      </Show>

      <Show when="signed-out">
        <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
          <div className="border-2 border-[#e3120b]/20 rounded-lg p-8 bg-muted/50">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Welcome to The Economist Study Library
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Sign in or create an account to access The Economist's archive library. 
              Browse, bookmark, and read articles from your personal study collection.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-[#e3120b] text-white font-bold rounded hover:bg-[#c20a08] transition-colors">
                  Create Account
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-6 py-2 border-2 border-foreground font-bold rounded hover:bg-muted transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </Show>
      
      <div className="mt-20 border-t border-border pt-8 text-center max-w-2xl mx-auto">
        <p className="text-xl font-serif italic text-muted-foreground leading-relaxed">
          <strong>Important Notice:</strong> This archive is compiled strictly for personal, academic learning purposes. It is not intended for commercial use or broad distribution. Please respect the intellectual property of the original publishers.
        </p>
      </div>
    </PageFrame>
  </AppChrome>
);

export default Home;
