import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useUserStore } from '@/store/user-store'
import { Loader2, AlertCircle, CheckCircle2, Mail, Lock, User, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Form schemas
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
})

const signupSchema = z.object({
  name: z.string()
    .min(1, { message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
})

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

export function AuthForm() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  const { login, signUp, googleLogin, loading, error } = useUserStore()
  const router = useRouter()
  const { toast } = useToast()
  
  // Clear errors when tab changes
  useEffect(() => {
    setAuthError(null)
    setAuthSuccess(null)
  }, [tab])
  
  // Update local error state when store error changes
  useEffect(() => {
    if (error) {
      setAuthError(error)
    }
  }, [error])

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    setAuthError(null)
    setAuthSuccess(null)
    
    try {
      const success = await login(data)
      if (success) {
        setAuthSuccess('Login successful! Redirecting...')
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        })
        // Use window.location for more reliable navigation in production
        setTimeout(() => {
          window.location.href = '/' // Redirect to dashboard using direct navigation
        }, 1000)
      } else {
        setAuthError(error || 'Invalid email or password. Please try again.')
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred')
    }
  }

  // Handle signup form submission
  const onSignupSubmit = async (data: SignupFormValues) => {
    setAuthError(null)
    setAuthSuccess(null)
    
    try {
      const success = await signUp(data)
      if (success) {
        setAuthSuccess('Account created successfully! Redirecting...')
        toast({
          title: 'Account created!',
          description: 'Your account has been created successfully.',
        })
        // Use window.location for more reliable navigation in production
        setTimeout(() => {
          window.location.href = '/' // Redirect to dashboard using direct navigation
        }, 1000)
      } else {
        setAuthError(error || 'Failed to create account. Please try again.')
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred')
    }
  }

  // Handle Google login
  const handleGoogleLogin = async () => {
    setAuthError(null)
    setAuthSuccess(null)
    
    try {
      const success = await googleLogin()
      if (success) {
        setAuthSuccess('Google login successful! Redirecting...')
        toast({
          title: 'Welcome!',
          description: 'You have successfully logged in with Google.',
        })
        // Use window.location for more reliable navigation in production
        setTimeout(() => {
          window.location.href = '/' // Redirect to dashboard using direct navigation
        }, 1000)
      } else {
        setAuthError(error || 'Failed to login with Google. Please try again.')
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {tab === 'login' ? 'Welcome to Schedio' : 'Join Schedio Today'}
        </CardTitle>
        <CardDescription className="text-center">
          {tab === 'login' 
            ? 'Enter your credentials to access your schedules' 
            : 'Create your account to start managing your shifts'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {authError.includes('unauthorized-domain') ? (
                <>
                  <p className="font-medium">Google login not available in development mode</p>
                  <p className="text-sm mt-2">Please use email/password authentication for now. Google login will work when deployed to production.</p>
                  <p className="text-sm mt-2 font-medium">For development testing:</p>
                  <ol className="text-xs list-disc pl-5 mt-1 space-y-1 text-red-700/80">
                    <li>Go to Firebase Console → Authentication → Settings</li>
                    <li>Add the <strong>exact</strong> domain: <code className="bg-red-100 px-1 py-0.5 rounded">http://localhost:3003</code></li>
                    <li>Or switch to email authentication below</li>
                  </ol>
                </>
              ) : (
                authError
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {authSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{authSuccess}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="email@example.com" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="******" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full font-semibold py-2 h-11" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Sign In
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="John Doe" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="email@example.com" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="******" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Password must have 6+ chars with uppercase & number
                      </div>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full font-semibold py-2 h-11" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Create Account
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-center text-muted-foreground">Join Schedio with your Google account (works in production environment)</p>
          <Button 
            variant="outline" 
            className="w-full h-11 font-medium border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
          )}
          Continue with Google
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground border-t pt-6">
        {tab === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Button variant="link" className="p-0 font-semibold" onClick={() => setTab('signup')}>
              Sign up
            </Button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Button variant="link" className="p-0 font-semibold" onClick={() => setTab('login')}>
              Sign in
            </Button>
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
