import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full bg-[#e3120b]" />
      
      {/* Header */}
      <div className="flex items-center justify-center py-8 px-4">
        <Link href="/" className="group flex items-center justify-center">
          <span className="bg-[#e3120b] text-white font-serif text-3xl font-bold px-3 py-1 tracking-tight">
            The Economist
          </span>
          <span className="ml-3 text-lg font-semibold tracking-widest text-foreground uppercase pt-1">
            Study Library
          </span>
        </Link>
      </div>

      {/* Sign In Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
            <p className="text-muted-foreground text-sm">
              Access your study library and bookmarks
            </p>
          </div>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
