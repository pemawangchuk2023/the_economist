import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type PageFrameProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const PageFrame = ({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  children,
}: PageFrameProps) => (
  <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
    {backHref || actions ? (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        {backHref ? (
          <Button asChild variant="ghost" size="sm" className="rounded-none hover:bg-transparent hover:underline px-0 text-foreground font-semibold uppercase text-xs tracking-wider">
            <Link href={backHref}>
              <ChevronLeft className="size-4 mr-1" />
              <span>{backLabel}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {actions}
      </div>
    ) : null}

    <header className="mb-10 space-y-4 border-t-[6px] border-foreground pt-6">
      <h1 className="text-4xl font-serif font-bold text-foreground md:text-5xl lg:text-6xl tracking-tight">
        {title}
      </h1>
      <p className="text-lg leading-relaxed text-muted-foreground font-serif max-w-3xl">
        {description}
      </p>
    </header>

    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export default PageFrame;
