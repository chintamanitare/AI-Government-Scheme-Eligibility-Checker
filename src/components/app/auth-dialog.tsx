'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { ChromeIcon } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.05 1.67-4.7 0-8.53-3.84-8.53-8.53s3.84-8.53 8.53-8.53c2.6 0 4.53 1.02 5.9 2.33l-2.5 2.5c-.8-.74-1.96-1.28-3.38-1.28-2.9 0-5.34 2.44-5.34 5.4 0 2.96 2.44 5.4 5.34 5.4 3.2 0 4.8-2.4 5.05-3.64h-5.05z"
      ></path>
    </svg>
);


export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setOpen(false);
      toast({
        title: 'Signed in successfully!',
        description: 'Welcome back.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Sign In</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome</DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create an account to save your results.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
