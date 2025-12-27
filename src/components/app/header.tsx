
'use client';

import Link from "next/link";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { GraduationCap, LayoutDashboard, LogOut, Building2 } from "lucide-react";
import AuthDialog from "./auth-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuth, signOut } from "firebase/auth";

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
    <path d="M12 4a.999.999 0 0 0-1 1v2.58c-1.33.27-2.54.89-3.54 1.76l-1.83-1.83a.999.999 0 1 0-1.41 1.41l1.83 1.83A5.964 5.964 0 0 0 5.42 11H3a1 1 0 0 0 0 2h2.42c.27 1.33.89 2.54 1.76 3.54l-1.83 1.83a.999.99-9 0 1 0 1.41-1.41l-1.83-1.83c1 .87 2.21 1.49 3.54 1.76V20a1 1 0 0 0 2 0v-2.58c1.33-.27 2.54-.89 3.54-1.76l1.83 1.83a.999.999 0 1 0 1.41-1.41l-1.83-1.83c.87-1 1.49-2.21 1.76-3.54H21a1 1 0 0 0 0-2h-2.58a5.964 5.964 0 0 0-1.76-3.54l1.83-1.83a.999.999 0 1 0-1.41-1.41l-1.83 1.83c-1-.87-2.21-1.49-3.54-1.76V5a1 1 0 0 0-1-1zM11 11h2v2h-2v-2zm-3.5-2.09l1.41 1.41L7.5 13H10v-2H7.5l2.09-2.09zM12.91 14.5l1.41-1.41L16.5 11H14v2h2.5l-2.09 2.09z" />
  </svg>
);


export default function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <header className="py-4 md:px-8 border-b">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <AshokaChakraIcon className="h-8 w-8 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-base font-bold font-headline leading-tight">Government Scheme &</span>
              <span className="text-base font-bold font-headline leading-tight">Scholarship Checker</span>
            </div>
        </Link>
        
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/schemes">
                <Building2 className="mr-2 h-4 w-4" />
                Schemes
              </Link>
            </Button>
           <Button variant="ghost" asChild>
              <Link href="/scholarships">
                <GraduationCap className="mr-2 h-4 w-4" />
                Scholarships
              </Link>
            </Button>
          {isUserLoading ? (
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName ?? 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthDialog />
          )}
        </div>
      </div>
    </header>
  );
}
