"use client"

import { useEffect } from 'react'
import { useUserStore } from '@/store/user-store'

/**
 * AuthInitializer component
 * 
 * This component initializes the authentication system when the app loads.
 * It calls the initializeAuth function from the user store, which:
 * 1. Checks for an existing session
 * 2. Sets up auth state change listeners
 * 3. Syncs the user data with Supabase if logged in
 */
export function AuthInitializer() {
  const { initializeAuth } = useUserStore()
  
  useEffect(() => {
    // Initialize auth system on app mount
    const cleanup = initializeAuth()
    
    // Return cleanup function if provided
    return typeof cleanup === 'function' ? cleanup : undefined
  }, [initializeAuth])
  
  // This component doesn't render anything
  return null
}
