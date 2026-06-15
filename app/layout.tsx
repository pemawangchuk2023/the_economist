import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthToasts from "@/components/economist/AuthToasts";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Economist for Academic Learning",
  description:
    "The Economist for Academic Learning compiled solely for academic purpose and not for commercial purpose",
  icons: {
    icon: "/assets/logo.png",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "h-full",
          "antialiased",
          inter.variable,
          playfair.variable
        )}
      >
        <body className="flex min-h-full flex-col font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <AuthToasts />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
