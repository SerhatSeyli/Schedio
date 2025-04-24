'use client';

import { useState, useEffect, useRef } from 'react';
import { enableMockMode } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff } from 'lucide-react';

export default function SupabaseConnectionToggle() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const autoActivated = useRef(false);
  const localStorageKey = 'schedio_offline_mode_enabled';
  
  // Check if offline mode was previously enabled
  useEffect(() => {
    try {
      const offlineModeEnabled = localStorage.getItem(localStorageKey) === 'true';
      if (offlineModeEnabled) {
        console.log('Offline mode was previously enabled, activating it automatically');
        enableMockMode();
        showOfflineModeToast();
      }
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
  }, []);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-enable offline mode after detecting multiple errors
  useEffect(() => {
    if (errorCount >= 3 && !autoActivated.current) {
      console.log('Multiple connectivity errors detected, auto-enabling offline mode');
      autoActivated.current = true;
      enableMockMode();
      localStorage.setItem(localStorageKey, 'true');
      showOfflineModeToast();
      
      // Force page reload to apply the change
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [errorCount]);

  // Check for supabase errors in console
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      // Call the original console.error
      originalConsoleError.apply(console, args);
      
      // Check if error is related to Supabase
      const errorString = args.join(' ');
      if (
        typeof errorString === 'string' && 
        (errorString.includes('Error getting user data') || 
         errorString.includes('Failed to fetch') || 
         errorString.includes('NetworkError'))
      ) {
        // We've detected Supabase connectivity issues
        setIsOnline(false);
        setErrorCount(prev => prev + 1);
      }
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const showOfflineModeToast = () => {
    toast({
      title: 'Offline Mode Enabled',
      description: 'Schedio is now using local storage for user data. Profile changes will still work, but won\'t sync to the cloud until connectivity is restored.',
      duration: 5000,
      variant: 'default',
    });
  };
  
  const handleEnableMockMode = () => {
    enableMockMode();
    localStorage.setItem(localStorageKey, 'true');
    showOfflineModeToast();
    
    // Force page reload to apply the change
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="destructive" 
        size="sm" 
        className="flex items-center gap-2 shadow-lg"
        onClick={handleEnableMockMode}
      >
        <WifiOff className="h-4 w-4" />
        <span>Network Issues Detected - Switch to Offline Mode</span>
      </Button>
    </div>
  );
}
