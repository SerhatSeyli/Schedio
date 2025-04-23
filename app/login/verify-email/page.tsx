"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useUserStore } from '@/store/user-store'
import { Mail, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { isAuthenticated, loading } = useUserStore()

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error.message)
          router.push('/login')
          return
        }
        
        if (data.session?.user?.email) {
          setEmail(data.session.user.email)
        } else {
          // If no session is found, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user email:', error instanceof Error ? error.message : 'Unknown error')
        router.push('/login')
      }
    }

    getUserEmail()
  }, [router])

  // Check if already verified
  useEffect(() => {
    const checkVerification = async () => {
      setIsChecking(true)
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user data:', error.message)
          setError('Unable to check verification status: ' + error.message)
          return
        }
        
        if (data.user?.email_confirmed_at) {
          setSuccessMessage('Your email has been verified! Redirecting to your profile...')
          setTimeout(() => router.push('/'), 2000)
        }
      } catch (error) {
        console.error('Error checking verification status:', error instanceof Error ? error.message : 'Unknown error')
        setError('Unable to check verification status. Please try again.')
      } finally {
        setIsChecking(false)
      }
    }

    checkVerification()
  }, [router])

  const handleResendVerification = async () => {
    setIsChecking(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      
      if (error) {
        console.error('Error resending verification email:', error.message)
        setError(`Failed to resend verification email: ${error.message}`)
      } else {
        setSuccessMessage('Verification email resent! Please check your inbox.')
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      console.error('Error in resend verification:', errorMessage)
      setError(errorMessage || 'Something went wrong. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-start mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/login')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to login
          </Button>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification email to <span className="font-medium">{email || 'your email address'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert variant="default" className="bg-primary/10 text-primary border-primary/20">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Next steps:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Check your email inbox</li>
                <li>Click the verification link in the email</li>
                <li>You'll be redirected back to Schedio</li>
                <li>Log in with your credentials</li>
              </ol>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive an email? Check your spam folder or click below to resend.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleResendVerification}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
