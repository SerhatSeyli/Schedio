"use client"

import { ReactNode, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useUserStore } from '@/store/user-store'
import { useShiftStore } from '@/store/shift-store'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const syncUserWithFirebase = useUserStore(state => state.syncUserWithFirebase)
  const fetchShifts = useShiftStore(state => state.fetchShifts)
  
  useEffect(() => {
    // Set up the Firebase auth state observer
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await syncUserWithFirebase(firebaseUser)
      
      // If user is authenticated, fetch their shifts
      if (firebaseUser) {
        await fetchShifts()
      }
    })
    
    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [syncUserWithFirebase, fetchShifts])
  
  return <>{children}</>
}
