"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { getSupabaseClient } from '@/lib/supabase'

export function AuthRedirect() {
  const { isAuthenticated, loading, user, syncUserWithSupabase } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkingEmailVerification, setCheckingEmailVerification] = useState(false);

  // Check if email is verified when needed
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!isAuthenticated || checkingEmailVerification) return;
      
      setCheckingEmailVerification(true);
      const supabase = getSupabaseClient();
      
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user data:', error.message);
          return;
        }
        
        const supabaseUser = data.user;
        
        if (supabaseUser && !supabaseUser.email_confirmed_at && pathname !== '/login/verify-email') {
          // User is logged in but email not verified
          setIsRedirecting(true);
          router.push('/login/verify-email');
        } else if (supabaseUser && supabaseUser.email_confirmed_at) {
          // Update local user state with confirmed status
          await syncUserWithSupabase(supabaseUser);
        }
      } catch (error) {
        // Use a more structured error object to avoid empty console errors
        console.error('Error checking email verification:', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setCheckingEmailVerification(false);
      }
    };
    
    checkEmailVerification();
  }, [isAuthenticated, pathname, router, syncUserWithSupabase, checkingEmailVerification]);

  useEffect(() => {
    // Don't redirect if still loading or already redirecting
    if (loading || isRedirecting || checkingEmailVerification) return;
    
    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/profile/setup', '/login/verify-email'];
    const isPublicPath = publicPaths.includes(pathname);
    
    // Debug information in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state:', {
        isAuthenticated,
        profileComplete: user?.profile_complete,
        currentPath: pathname,
        isPublicPath
      });
    }

    // CASE 1: Not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicPath) {
      console.log('Redirecting unauthenticated user to login');
      setIsRedirecting(true);
      router.push('/login');
      return;
    }
    
    // CASE 2: Authenticated but profile incomplete and not on setup page
    if (isAuthenticated && 
        user && 
        !user.profile_complete && 
        pathname !== '/profile/setup') {
      console.log('Redirecting to profile setup - profile incomplete');
      setIsRedirecting(true);
      router.push('/profile/setup');
      return;
    }
    
    // CASE 3: Fully authenticated but trying to access login/setup pages
    if (isAuthenticated && 
        user && 
        user.profile_complete && 
        isPublicPath) {
      console.log('Redirecting authenticated user to dashboard');
      setIsRedirecting(true);
      router.push('/');
      return;
    }
    
    // Reset redirection state if no redirect happened
    setIsRedirecting(false);
  }, [isAuthenticated, loading, pathname, router, user]);
  
  // Adding a second useEffect to reset the isRedirecting state after navigation completes
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false);
      }, 500); // Short timeout to ensure navigation has started
      
      return () => clearTimeout(timer);
    }
  }, [isRedirecting, pathname]);

  return null;
}
