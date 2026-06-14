import Link from "next/link";
import { BookOpen, Library } from "lucide-react";

import ThemeToggle from "@/components/theme/theme-toggle";

type AppChromeProps = {
  children: React.ReactNode;
};

const AppChrome = ({ children }: AppChromeProps) => (
  <div className="min-h-screen bg-[#f3f3f3] dark:bg-background text-foreground font-sans">
    <div className="h-1 w-full bg-[#e3120b]" />
    <header className="sticky top-0 z-40 bg-background border-b border-border/60">
      {/* Top Utilities Bar */}
      <div className="mx-auto flex h-10 w-full max-w-5xl items-center justify-end px-4 md:px-6">
        <ThemeToggle />
      </div>

      {/* Main Branding & Nav Bar */}
      <div className="mx-auto flex flex-col items-center justify-center gap-6 pb-6 pt-2 w-full max-w-5xl px-4 md:px-6">
        <Link href="/" className="group flex items-center justify-center">
          <span className="bg-[#e3120b] text-white font-serif text-3xl font-bold px-3 py-1 tracking-tight">
            The Economist
          </span>
          <span className="ml-3 text-lg font-semibold tracking-widest text-foreground uppercase pt-1">
            Study Library
          </span>
        </Link>

        <nav className="flex items-center gap-8 border-y border-border/60 py-3 w-full justify-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#e3120b] transition-colors relative after:absolute after:bottom-[-13px] after:left-0 after:h-[2px] after:w-0 after:bg-[#e3120b] hover:after:w-full after:transition-all"
          >
            <Library className="size-4" />
            <span>Library</span>
          </Link>
          <Link 
            href="/economist/bookmarks" 
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#e3120b] transition-colors relative after:absolute after:bottom-[-13px] after:left-0 after:h-[2px] after:w-0 after:bg-[#e3120b] hover:after:w-full after:transition-all"
          >
            <BookOpen className="size-4" />
            <span>Bookmarks</span>
          </Link>
        </nav>
      </div>
    </header>
    <main className="relative pt-6">{children}</main>
  </div>
);

export default AppChrome;
