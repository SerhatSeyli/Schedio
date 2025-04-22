"use client"

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
})

const signupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
})

export function AuthForm() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const { login, signUp } = useUserStore()

  // Reset form state when tab changes
  useEffect(() => {
    setAuthError(null)
    setAuthSuccess(null)
    setLoading(false)
  }, [tab])

  // Redirect if login was successful
  useEffect(() => {
    if (authSuccess && tab === 'login') {
      const timer = setTimeout(() => {
        router.push('/')
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [authSuccess, router, tab])

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Signup form
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })

  // Handle login submit
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true)
    setAuthError(null)
    
    try {
      const success = await login({
        email: data.email,
        password: data.password
      })
      
      if (success) {
        setAuthSuccess('Login successful! Redirecting...')
        toast({
          title: "Logged in successfully",
          description: "Welcome back to Schedio",
        })
      } else {
        throw new Error('Login failed. Please check your credentials and try again.')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setAuthError(err.message || 'An unexpected error occurred during login. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle signup submit
  const onSignupSubmit = async (data: z.infer<typeof signupSchema>) => {
    setLoading(true)
    setAuthError(null)
    
    try {
      console.log('Starting signup process in form component')
      
      const success = await signUp({
        name: data.name,
        email: data.email,
        password: data.password
      })
      
      if (success) {
        // Get success message from the user store
        const { successMessage } = useUserStore.getState()
        
        // Display the success message about email confirmation
        setAuthSuccess(successMessage || 'Account created successfully! Please check your email to confirm your account before logging in.')
        
        toast({
          title: "Account Created",
          description: "Please check your email for a confirmation link. You must confirm your email before logging in."
        })
        
        // Redirect to verify-email page
        setTimeout(() => {
          router.push('/login/verify-email')
        }, 1500)
      } else {
        // Get any error from the user store
        const { error } = useUserStore.getState()
        if (error) {
          throw new Error(error)
        } else {
          throw new Error('Signup failed. Please check your information and try again.')
        }
      }
    } catch (err: any) {
      console.error('Signup error in form component:', err)
      
      // Display user-friendly error messages
      if (err.message.includes('already exists')) {
        setAuthError('This email is already registered. Please try logging in instead.')
      } else if (err.message.includes('weak')) {
        setAuthError('Please use a stronger password. It should be at least 6 characters with uppercase letters and numbers.')
      } else {
        setAuthError(err.message || 'An unexpected error occurred during signup. Please try again.')
      }
    } finally {
      setLoading(false)
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
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        {authSuccess && (
          <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{authSuccess}</AlertDescription>
          </Alert>
        )}

        <Tabs value={tab} onValueChange={(value) => setTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
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
                            placeholder="you@example.com" 
                            className="pl-10 py-2 h-11" 
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
                            className="pl-10 py-2 h-11" 
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
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Logging in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{' '}
                  <Button variant="link" className="p-0 font-semibold" onClick={() => setTab('signup')}>
                    Sign Up
                  </Button>
                </p>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="signup">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="John Doe" 
                            className="pl-10 py-2 h-11" 
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
                            placeholder="you@example.com" 
                            className="pl-10 py-2 h-11" 
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
                            className="pl-10 py-2 h-11" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 mr-1 inline" />
                        Password must have 6+ chars with uppercase & number
                      </p>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
                
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Button variant="link" className="p-0 font-semibold" onClick={() => setTab('login')}>
                    Sign In
                  </Button>
                </p>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
