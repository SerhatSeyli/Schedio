import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { clearShifts } from './shift-store';

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  avatar?: string
  joinDate: string
  employeeId: string
  profile_complete: boolean
  center: string
  hourlyWage: string
  employmentStatus: string
  unit: string
}

export interface UserState {
  user: UserProfile
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  initializeAuth: () => Promise<(() => void) | undefined>
  updateProfile: (profile: Partial<UserProfile>) => void
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<boolean>
  logout: () => Promise<void>
  syncUserWithSupabase: (user: SupabaseUser | null) => Promise<void>
}

// Initial user data
const initialUser: UserProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  avatar: "",
  joinDate: "",
  employeeId: "",
  profile_complete: false,
  center: '',
  hourlyWage: '',
  employmentStatus: '',
  unit: ''
}

let authListenerInitialized = false;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // --- AUTH STATE LISTENER ---
      // This will run once on module load (client-side)
      initializeAuth: async () => {
        if (authListenerInitialized) return;
        
        const supabase = getSupabaseClient();
        set({ loading: true, error: null });
        
        try {
          // Check if there's an active session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // User is logged in, populate the user data
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
              console.log('User found, syncing with Supabase');
              await get().syncUserWithSupabase(userData.user);
            }
          } else {
            // No active session - clean initialization
            console.log('No active session, initializing with default user');
            set({ user: initialUser, isAuthenticated: false, loading: false, error: null });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: initialUser, isAuthenticated: false, loading: false, error: 'Failed to initialize authentication' });
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && session) {
              // User just signed in
              const { data } = await supabase.auth.getUser();
              if (data?.user) {
                await get().syncUserWithSupabase(data.user);
              }
            } else if (event === 'SIGNED_OUT') {
              // User signed out
              set({ user: initialUser, isAuthenticated: false, loading: false, error: null });
            }
          }
        );
        
        // Set flag to prevent multiple initializations
        authListenerInitialized = true;
        
        return () => {
          subscription.unsubscribe();
        };
      },
      user: initialUser,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      updateProfile: async (data: Partial<UserProfile>) => {
        const supabase = getSupabaseClient();
        set({ loading: true, error: null });
        
        try {
          // Update user metadata in Supabase
          const { error: updateError } = await supabase.auth.updateUser({
            data: data,
          });
          
          if (updateError) throw updateError;
          
          // Update local state
          set(state => ({
            user: { ...state.user, ...data },
            loading: false,
            error: null
          }));
          
          console.log('Profile updated successfully:', data);
          return true;
        } catch (error: any) {
          console.error('Error updating profile:', error);
          set({ loading: false, error: error.message || 'Failed to update profile' });
          return false;
        }
      },
      
      login: async (credentials) => {
        const supabase = getSupabaseClient();
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          });
          if (error || !data.user) {
            set({ loading: false, error: error?.message || 'Failed to login' });
            return false;
          }
          const user = data.user;
          const newUser: UserProfile = {
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email || '',
            phone: '',
            position: '',
            department: '',
            avatar: '',
            joinDate: new Date().toISOString().split('T')[0],
            employeeId: '',
            profile_complete: user.user_metadata?.profile_complete ?? false,
            center: user.user_metadata?.center ?? '',
            hourlyWage: user.user_metadata?.hourlyWage ?? '',
            employmentStatus: user.user_metadata?.employmentStatus ?? '',
            unit: user.user_metadata?.unit ?? ''
          };
          set({ user: newUser, isAuthenticated: true, loading: false });
          return true;
        } catch (err: any) {
          set({ loading: false, error: err.message || 'Failed to login' });
          return false;
        }
      },
      
      signUp: async (credentials) => {
        const supabase = getSupabaseClient();
        set({ loading: true, error: null });
        
        console.log('Starting signup process with:', credentials.email);
        
        try {
          // Sign up with Supabase
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: { name: credentials.name }
            }
          });
          
          console.log('Signup response:', { data, error });
          
          if (error) {
            console.error('Supabase signup error:', error);
            set({ loading: false, error: `Signup error: ${error.message}` });
            return false;
          }
          
          if (!data.user) {
            console.error('Signup failed: No user data returned');
            set({ loading: false, error: 'Signup failed: No user data returned from Supabase' });
            return false;
          }
          
          // Check if email confirmation is required by Supabase settings
          // If email confirmation is required, user will NOT be confirmed yet
          if (data.user.email_confirmed_at || data.user.confirmed_at) {
            console.log('User email already confirmed');
          } else {
            console.log('Email confirmation required');
            // Note: In many Supabase setups, we allow the user to proceed without confirmed email
            // set({ loading: false, error: 'Please check your email to confirm your account before logging in.' });
            // return false;
          }
          const newUser: UserProfile = {
            id: data.user.id,
            name: credentials.name,
            email: credentials.email,
            phone: '',
            position: '',
            department: '',
            avatar: '',
            joinDate: new Date().toISOString().split('T')[0],
            employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
            profile_complete: false,
            center: '',
            hourlyWage: '',
            employmentStatus: '',
            unit: ''
          };
          set({ user: newUser, isAuthenticated: true, loading: false });
          return true;
        } catch (err: any) {
          set({ loading: false, error: err.message || 'Failed to sign up' });
          return false;
        }
      },
      
      logout: async () => {
        const supabase = getSupabaseClient();
        set({ loading: true });
        try {
          await supabase.auth.signOut();
          // Clear user data
          set({ user: initialUser, isAuthenticated: false, loading: false });
          // Clear shifts to ensure new users start fresh
          clearShifts();
        } catch (error) {
          console.error('Error during logout', error);
          set({ loading: false });
        }
      },
      
      syncUserWithSupabase: async (supabaseUser) => {
        if (!supabaseUser) {
          set({ user: initialUser, isAuthenticated: false });
          return;
        }
        const basicUser: UserProfile = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || '',
          email: supabaseUser.email || '',
          phone: '',
          position: '',
          department: '',
          avatar: '',
          joinDate: '',
          employeeId: '',
          profile_complete: supabaseUser.user_metadata?.profile_complete ?? false,
          center: supabaseUser.user_metadata?.center ?? '',
          hourlyWage: supabaseUser.user_metadata?.hourlyWage ?? '',
          employmentStatus: supabaseUser.user_metadata?.employmentStatus ?? '',
          unit: supabaseUser.user_metadata?.unit ?? ''
        };
        set({ user: basicUser, isAuthenticated: true, error: null });
      },
    }),
    {
      name: "user-storage"
    }
  )
)
