
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { supabase } from "@/integrations/supabase/client";

interface AuthDialogProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
}

const AuthDialog = ({ mode, onSuccess }: AuthDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error logging in with Google:', error.message);
    }
    setIsLoading(false);
  };

  const handleLinkedInLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error logging in with LinkedIn:', error.message);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'signin' ? 'default' : 'outline'}>
          {mode === 'signin' ? (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' 
              ? 'Sign in to your account using your preferred method'
              : 'Create a new account using your preferred method'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 pt-4">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            <img 
              src="https://authjs.dev/img/providers/google.svg" 
              alt="Google" 
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </Button>
          <Button 
            onClick={handleLinkedInLogin} 
            disabled={isLoading}
            className="w-full bg-[#0077B5] hover:bg-[#006399] text-white"
          >
            <img 
              src="https://authjs.dev/img/providers/linkedin.svg" 
              alt="LinkedIn" 
              className="w-5 h-5 mr-2"
            />
            Continue with LinkedIn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
