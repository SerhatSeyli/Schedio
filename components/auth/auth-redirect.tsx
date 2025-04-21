"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserStore } from '@/store/user-store'

export function AuthRedirect() {
  const { isAuthenticated, loading } = useUserStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  useEffect(() => {
    // Skip redirect logic if still loading authentication state or already redirecting
    if (loading || isRedirecting) return
    
    // List of public paths that don't require authentication
    const publicPaths = ['/login']
    const isPublicPath = publicPaths.includes(pathname)
    
    if (!isAuthenticated && !isPublicPath) {
      // User is not authenticated and trying to access a protected route
      setIsRedirecting(true)
      router.push('/login')
    } else if (isAuthenticated && isPublicPath) {
      // User is authenticated but on a public route (like login)
      setIsRedirecting(true)
      router.push('/')
    }
  }, [isAuthenticated, loading, pathname, router, isRedirecting])
  
  return null
}
