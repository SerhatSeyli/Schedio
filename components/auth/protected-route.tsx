import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useUserStore()
  const router = useRouter()
  const [showLoading, setShowLoading] = useState(true)
  
  // Set a timeout to show loading indicator only if it takes more than 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(loading)
    }, 500)
    
    if (!loading) {
      clearTimeout(timer)
      setShowLoading(false)
    }
    
    return () => clearTimeout(timer)
  }, [loading])

  // Handle authentication redirection
  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Show loading indicator while checking authentication
  if (showLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading ShiftTrac...</p>
        </div>
      </div>
    )
  }

  // If authenticated, show children
  return isAuthenticated ? <>{children}</> : null
}
