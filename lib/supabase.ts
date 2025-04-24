import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Flag to enable mock mode when Supabase is unavailable
let useMockSupabase = false;

// Try to get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey;

// Create the real client only if we have valid credentials
let supabaseInstance: SupabaseClient | null = null;

if (hasValidCredentials) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized with URL:', supabaseUrl);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    useMockSupabase = true;
  }
} else {
  console.warn('Missing Supabase credentials, using mock mode');
  useMockSupabase = true;
}

export const supabase = supabaseInstance || createClient('https://example.com', 'mock-key');

// Mock response type for better typing
type MockResponse<T = any> = { data: T, error: null } | { data?: undefined, error: Error };

// Define interfaces for MockSupabase methods to ensure proper typing
type MockAuthMethods = {
  getUser(): Promise<{ data: { user: null | { id: string; email: string; user_metadata: any } }, error: null }>;
  getSession(): Promise<{ data: { session: null | { user: { id: string; email: string; user_metadata: any } } }, error: null }>;
  signInWithPassword(credentials: { email: string; password: string }): Promise<MockResponse>;
  signUp(credentials: { email: string; password: string; options?: any }): Promise<MockResponse>;
  signOut(): Promise<{ error: null }>;
  onAuthStateChange(callback: Function): { data: { subscription: { unsubscribe: () => void } } };
  updateUser(params: { data: any }): Promise<MockResponse>;
  resend(params: { type: string; email: string }): Promise<{ data: {}, error: null }>;
}

// Mock Supabase implementation for offline/development use
class MockSupabase {
  private userData: any = null;
  private mockUserMetadata: any = {};
  private isAuthenticated = false;
  
  constructor() {
    console.log('Using MockSupabase client for development/offline mode');
    // Try to load existing user data from localStorage
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('schedio_user_data');
        if (storedUser) {
          this.userData = JSON.parse(storedUser);
          this.isAuthenticated = true;
          this.mockUserMetadata = {
            name: this.userData.name,
            position: this.userData.position,
            employeeId: this.userData.employeeId,
            center: this.userData.center,
            profile_complete: true
          };
        }
      }
    } catch (e) {
      console.warn('Could not load user from localStorage:', e);
    }
  }
  
  // Private helpers to avoid 'this' context issues
  private saveUserData() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('schedio_user_data', JSON.stringify(this.userData));
    }
  }
  
  // Create auth property with properly bound methods to maintain 'this' context
  auth = {
    getUser: async () => {
      if (!this.isAuthenticated) return { data: { user: null }, error: null };
      
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: this.userData?.email || 'officer@corrections.gov',
            user_metadata: this.mockUserMetadata
          }
        },
        error: null
      };
    },
    
    // Support for email verification - added April 2025
    resend: async (params: { type: string, email: string }) => {
      console.log(`Mock resending ${params.type} email to ${params.email} in offline mode`);
      
      // Simulate successful email resend in offline mode
      return { 
        data: {}, 
        error: null 
      };
    },
    
    getSession: async () => {
      if (!this.isAuthenticated) return { data: { session: null }, error: null };
      
      return {
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: this.userData?.email || 'officer@corrections.gov',
              user_metadata: this.mockUserMetadata
            }
          }
        },
        error: null
      };
    },
    
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      // Mock successful login
      this.isAuthenticated = true;
      this.userData = {
        id: 'mock-user-id',
        email: credentials.email,
        name: 'Officer Demo',
        position: 'Correctional Officer',
        profile_complete: false
      };
      
      this.saveUserData();
      
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            user_metadata: {}
          },
          session: {}
        },
        error: null
      };
    },
    
    signUp: async (params: { email: string; password: string; options?: any }) => {
      // Mock successful signup
      return {
        data: { user: { email: params.email }, session: null },
        error: null
      };
    },
    
    signOut: async () => {
      this.isAuthenticated = false;
      this.userData = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('schedio_user_data');
      }
      return { error: null };
    },
    
    onAuthStateChange: (callback: Function) => {
      // Return mock unsubscribe function
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    
    updateUser: async (params: { data: any }) => {
      if (!this.isAuthenticated) {
        return { error: new Error('Not authenticated') };
      }
      
      // Update mockUserMetadata
      this.mockUserMetadata = {
        ...this.mockUserMetadata,
        ...params.data
      };
      
      // Update userData
      this.userData = {
        ...this.userData,
        ...params.data
      };
      
      // Store in localStorage
      this.saveUserData();
      
      return { data: { user: this.userData }, error: null };
    }
  } as MockAuthMethods;
  
  // Generic method to handle any database table queries
  from = (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: {}, error: null })
      }),
      limit: () => ({
        order: () => ({
          then: (callback: Function) => callback({ data: [] })
        })
      })
    }),
    insert: () => ({ then: (callback: Function) => callback({ data: [] }) }),
    update: () => ({
      eq: () => ({ then: (callback: Function) => callback({ data: {} }) })
    }),
    delete: () => ({
      eq: () => ({ then: (callback: Function) => callback({ data: {} }) })
    })
  });
}

// Function to get appropriate Supabase client (real or mock)
export function getSupabaseClient() {
  // Check if offline mode was previously enabled in localStorage
  try {
    if (typeof window !== 'undefined') {
      const offlineModeEnabled = localStorage.getItem('schedio_offline_mode_enabled') === 'true';
      if (offlineModeEnabled) {
        console.log('Using mock Supabase client due to previously enabled offline mode');
        useMockSupabase = true;
      }
    }
  } catch (e) {
    console.warn('Error checking localStorage for offline mode:', e);
  }

  // Force mock mode if connectivity issues are detected
  if (useMockSupabase) {
    return new MockSupabase() as unknown as typeof supabase;
  }
  
  // Wrap real client with error detection
  try {
    // Create a proxy around the real Supabase client to catch network errors
    return new Proxy(supabase, {
      get(target, prop, receiver) {
        // Get the original property
        const originalValue = Reflect.get(target, prop, receiver);
        
        // If it's a method, wrap it to catch errors
        if (typeof originalValue === 'function') {
          return new Proxy(originalValue, {
            apply: async function(target, thisArg, args) {
              try {
                const result = await Reflect.apply(target, thisArg, args);
                return result;
              } catch (error: any) {
                // Check if this is a network error
                if (error.message && (
                  error.message.includes('Failed to fetch') ||
                  error.message.includes('NetworkError') ||
                  error.message.includes('network')
                )) {
                  console.warn('Network error detected, switching to offline mode');
                  useMockSupabase = true;
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('schedio_offline_mode_enabled', 'true');
                  }
                  
                  // Try the operation again with the mock client
                  const mockClient = new MockSupabase();
                  const mockMethod = Reflect.get(mockClient, prop);
                  if (typeof mockMethod === 'function') {
                    return Reflect.apply(mockMethod, mockClient, args);
                  }
                }
                
                throw error;
              }
            }
          });
        }
        
        // If it's an object (like auth), also wrap it
        if (originalValue && typeof originalValue === 'object') {
          return new Proxy(originalValue, {
            get(obj, prop) {
              const method = obj[prop as keyof typeof obj];
              if (typeof method === 'function') {
                return async function(...args: any[]) {
                  try {
                    return await method.apply(obj, args);
                  } catch (error: any) {
                    // Check if this is a network error
                    if (error.message && (
                      error.message.includes('Failed to fetch') ||
                      error.message.includes('NetworkError') ||
                      error.message.includes('network')
                    )) {
                      console.warn('Network error in auth method, switching to offline mode');
                      useMockSupabase = true;
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('schedio_offline_mode_enabled', 'true');
                      }
                      
                      // Try the operation again with the mock client
                      const mockClient = new MockSupabase();
                      const mockObj = mockClient[prop as keyof MockSupabase];
                      const mockMethod = mockObj && typeof mockObj === 'object' ? 
                                         mockObj[prop as keyof typeof mockObj] : null;
                      
                      if (typeof mockMethod === 'function') {
                        return mockMethod.apply(mockObj, args);
                      }
                    }
                    
                    throw error;
                  }
                };
              }
              return obj[prop as keyof typeof obj];
            }
          });
        }
        
        return originalValue;
      }
    });
  } catch (e) {
    console.error('Error creating Supabase proxy:', e);
    return new MockSupabase() as unknown as typeof supabase;
  }
}

// Function to manually enable mock mode (useful for testing or when connectivity issues are detected)
export function enableMockMode() {
  useMockSupabase = true;
  console.log('Switched to mock Supabase mode');
  return getSupabaseClient();
}
