
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useUser } from '@/context/UserContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/profile');
      }
    });

    // If user is already authenticated in the context, redirect to profile
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg text-gray-600">
        Completing sign in...
      </div>
    </div>
  );
};

export default AuthCallback;
