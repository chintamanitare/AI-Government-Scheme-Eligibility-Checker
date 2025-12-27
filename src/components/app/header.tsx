import { cn } from "@/lib/utils";
import Link from "next/link";

const AshokaChakraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      opacity="0.3"
    />
    <path d="M12 4a.999.999 0 0 0-1 1v2.58c-1.33.27-2.54.89-3.54 1.76l-1.83-1.83a.999.999 0 1 0-1.41 1.41l1.83 1.83A5.964 5.964 0 0 0 5.42 11H3a1 1 0 0 0 0 2h2.42c.27 1.33.89 2.54 1.76 3.54l-1.83 1.83a.999.999 0 1 0 1.41 1.41l1.83-1.83c1 .87 2.21 1.49 3.54 1.76V20a1 1 0 0 0 2 0v-2.58c1.33-.27 2.54-.89 3.54-1.76l1.83 1.83a.999.999 0 1 0 1.41-1.41l-1.83-1.83c.87-1 1.49-2.21 1.76-3.54H21a1 1 0 0 0 0-2h-2.58a5.964 5.964 0 0 0-1.76-3.54l1.83-1.83a.999.999 0 1 0-1.41-1.41l-1.83 1.83A5.964 5.964 0 0 0 13 6.58V5a1 1 0 0 0-1-1zm0 2.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
  </svg>
);

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AshokaChakraIcon className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block font-headline text-lg">
            Aadhar Assist AI
          </span>
        </Link>
      </div>
    </header>
  );
}
