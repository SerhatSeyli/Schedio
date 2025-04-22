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
  successMessage?: string | null
  initializeAuth: () => Promise<(() => void) | undefined>
  updateProfile: (profile: Partial<UserProfile>) => void
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<boolean>
  logout: () => Promise<void>
  syncUserWithSupabase: (user: SupabaseUser | null) => Promise<void>
}

// Initial user data - completely empty for fresh start
const initialUser: UserProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  avatar: "",
  joinDate: "",
  employeeId: "", // Empty by default - users should add their own ID
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
      
      login: async (credentials: { email: string; password: string }) => {
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
          
          // Check if email is confirmed
          if (!user.email_confirmed_at && !user.confirmed_at) {
            set({
              loading: false,
              error: 'Email not confirmed. Please check your inbox and confirm your email before logging in.'
            });
            return false;
          }
          
          // Clear any local storage items from previous sessions
          localStorage.removeItem('schedioUserSession');
          localStorage.removeItem('schedioUserProfile');
          localStorage.removeItem('profileSetupComplete');
          localStorage.removeItem('tempUserCredentials');
          
          // Create a clean user profile with no pre-filled data
          const newUser: UserProfile = {
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email || '',
            phone: '',
            position: '',
            department: '',
            avatar: '',
            joinDate: new Date().toISOString().split('T')[0],
            // Empty employee ID by default
            employeeId: '',
            // Set profile_complete to false for new users so they'll be directed to profile setup
            profile_complete: user.user_metadata?.profile_complete ?? false,
            center: '',
            hourlyWage: '',
            employmentStatus: '',
            unit: ''
          };
          
          set({ user: newUser, isAuthenticated: true, loading: false });
          return true;
        } catch (err: any) {
          set({ loading: false, error: err.message || 'Failed to login' });
          return false;
        }
      },
      
      signUp: async (credentials: { email: string; password: string; name: string }) => {
        const supabase = getSupabaseClient();
        set({ loading: true, error: null });
        
        console.log('Starting signup process with:', credentials.email);
        
        try {
          // Standard Supabase signup with email confirmation required
          console.log('Proceeding with Supabase signup');
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: { name: credentials.name },
              emailRedirectTo: `${window.location.origin}/login`
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
          
          console.log('Signup successful, email confirmation required');
          
          // Clear any previously stored session data
          localStorage.removeItem('schedioUserSession');
          localStorage.removeItem('schedioUserProfile');
          localStorage.removeItem('profileSetupComplete');
          localStorage.removeItem('tempUserCredentials');
          // For signup, we no longer create a user profile in the store
          // The user will need to confirm their email first, then log in
          // After login, the profile setup page will handle creating the user profile
          
          // Set error to null and loading to false, but do not set the user or auth state
          set({ 
            loading: false, 
            error: null,
            // New success message to indicate email confirmation is required
            successMessage: 'Account created! Please check your email to confirm your account before logging in.'
          });
          
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
      
      syncUserWithSupabase: async (supabaseUser: SupabaseUser | null) => {
        const supabase = getSupabaseClient();
        
        // Check if the Supabase user exists
        if (!supabaseUser) {
          console.log('No Supabase user, clearing current user data');
          set({ isAuthenticated: false, loading: false, error: null, user: initialUser });
          return;
        }

        try {
          console.log('Syncing user profile with Supabase user ID:', supabaseUser.id);
          // Get the profile from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 means no rows returned - that's OK for new users
            console.error('Error fetching profile:', profileError);
            set({ error: `Failed to fetch profile: ${profileError.message}` });
          }

          // Update our state with this data
          set({
            user: {
              ...initialUser,
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.user_metadata?.name || profileData?.name || '',
              position: profileData?.position || '',
              department: profileData?.department || '',
              phone: profileData?.phone || '',
              avatar: profileData?.avatar_url || '',
              joinDate: profileData?.join_date || '',
              employeeId: profileData?.employee_id || '', // Empty by default, user must provide their own ID
              profile_complete: profileData?.profile_complete || false,
              center: profileData?.center || '',
              hourlyWage: profileData?.hourly_wage || '',
              employmentStatus: profileData?.employment_status || '',
              unit: profileData?.unit || ''
            },
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Error syncing user with Supabase:', error);
          set({ loading: false, error: error.message || 'Error syncing profile' });
        }
      },
    }),
    {
      name: "user-storage"
    }
  )
)
