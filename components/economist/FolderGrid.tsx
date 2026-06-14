import Link from "next/link";
import { ArrowRight } from "lucide-react";

type FolderItem = {
  href: string;
  label: string;
  count?: number;
};

type FolderGridProps = {
  items: FolderItem[];
};

const FolderGrid = ({ items }: FolderGridProps) => (
  <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
    {items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className="group flex flex-col border-t-2 border-foreground relative bg-background transition-all hover:bg-muted/10 pt-4 pb-2"
      >
        <div className="absolute top-[-2px] left-0 h-[2px] w-0 bg-[#e3120b] transition-all duration-300 group-hover:w-full" />

        <span className="mb-6 block text-4xl font-serif font-bold text-foreground transition-colors group-hover:text-[#e3120b]">
          {item.label}
        </span>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/60">
          {typeof item.count === "number" ? (
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              {item.count} issues
            </span>
          ) : <span />}
          <ArrowRight className="size-5 text-foreground transition-transform group-hover:translate-x-1 group-hover:text-[#e3120b]" />
        </div>
      </Link>
    ))}
  </div>
);

export default FolderGrid;
