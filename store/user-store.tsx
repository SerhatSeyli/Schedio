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
  saveUserToLocalStorage: (userData: UserProfile) => void
  loadUserFromLocalStorage: () => UserProfile | null
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
      
      saveUserToLocalStorage: (userData: UserProfile) => {
        try {
          localStorage.setItem('schedio_user_data', JSON.stringify(userData));
          localStorage.setItem('schedio_last_updated', new Date().toISOString());
          console.log('User data saved to localStorage for offline use');
        } catch (err) {
          console.error('Error saving to localStorage:', err);
        }
      },
      
      loadUserFromLocalStorage: (): UserProfile | null => {
        try {
          const userData = localStorage.getItem('schedio_user_data');
          if (!userData) return null;
          return JSON.parse(userData) as UserProfile;
        } catch (err) {
          console.error('Error loading from localStorage:', err);
          return null;
        }
      },
      
      updateProfile: async (data: Partial<UserProfile>) => {
        const supabase = getSupabaseClient();
        set({ loading: true, error: null });
        
        try {
          // Always mark profile as complete when updating profile
          const updatedData = {
            ...data,
            profile_complete: true
          };
          
          // Save to localStorage first for offline reliability
          const currentState = get();
          const updatedUser = { ...currentState.user, ...updatedData };
          get().saveUserToLocalStorage(updatedUser);
          
          // Update user metadata in Supabase with profile_complete flag
          const { error: updateError } = await supabase.auth.updateUser({
            data: updatedData,
          });
          
          if (updateError) {
            console.warn('Error updating Supabase, but changes saved locally:', updateError);
            // Don't throw error here - we've saved to localStorage
            set(state => ({
              user: updatedUser,
              loading: false,
              error: 'Changes saved locally but not synced to cloud. Will sync when online.'
            }));
            return true; // Still return success since we saved locally
          }
          
          // Update local state
          set(state => ({
            user: updatedUser,
            loading: false,
            error: null
          }));
          
          console.log('Profile updated successfully with profile_complete flag:', updatedData);
          return true;
        } catch (error: any) {
          console.error('Error updating profile:', error);
          
          // Try to save locally even if Supabase update fails
          try {
            const currentState = get();
            const updatedUser = { ...currentState.user, ...data, profile_complete: true };
            get().saveUserToLocalStorage(updatedUser);
            
            set({
              user: updatedUser,
              loading: false,
              error: 'Changes saved locally but not synced to cloud due to connectivity issues.'
            });
            return true; // Still return success
          } catch (localError) {
            set({ loading: false, error: error.message || 'Failed to update profile' });
            return false;
          }
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
        
        // First check for network connectivity
        if (!navigator.onLine) {
          console.log('Device is offline - using cached user data if available');
          
          // Try to load user data from localStorage
          const cachedUserData = get().loadUserFromLocalStorage();
          if (cachedUserData && cachedUserData.id) {
            console.log('Found cached user data, using that while offline');
            set({
              user: cachedUserData,
              isAuthenticated: true, // Keep user logged in with cached data
              loading: false,
              error: 'You appear to be offline. Using locally saved data.'
            });
            return;
          }
          
          // Keep the current user state but mark as offline
          set(state => ({
            ...state,
            loading: false,
            error: 'You appear to be offline. Some features may be limited.'
          }));
          return;
        }
        
        // Check if the Supabase user exists
        if (!supabaseUser) {
          console.log('No Supabase user, clearing current user data');
          set({ isAuthenticated: false, loading: false, error: null, user: initialUser });
          return;
        }

        try {
          console.log('Syncing user profile with Supabase user ID:', supabaseUser.id);
          
          // Implement retry logic for network connectivity issues
          let retryCount = 0;
          const maxRetries = 3;
          let succeeded = false;
          
          while (!succeeded && retryCount < maxRetries) {
            try {
              // Verify connectivity with a lightweight ping request
              await supabase.from('_pgrst_reserved_dummy').select('count', { count: 'exact', head: true });
              succeeded = true;
            } catch (pingError) {
              retryCount++;
              console.warn(`Network check attempt ${retryCount} failed, retrying...`);
              // Add exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
            }
          }
          
          if (!succeeded) {
            throw new Error('Network connectivity issues detected. Please check your connection.');
          }
          
          // Skip fetching profile from database and use the auth data
          // This prevents errors when the profiles table doesn't exist yet
          
          // In a production environment, you would create the profiles table
          // in Supabase and uncomment the code below
          
          // const { data: profileData, error: profileError } = await supabase
          //   .from('profiles')
          //   .select('*')
          //   .eq('id', supabaseUser.id)
          //   .single();
          
          // if (profileError && profileError.code !== 'PGRST116') {
          //   // PGRST116 means no rows returned - that's OK for new users
          //   console.error('Error fetching profile:', profileError);
          //   set({ error: `Failed to fetch profile: ${profileError.message}` });
          // }
          
          // Use empty profile data object - will be populated from user metadata
          const profileData = {
            name: '',
            position: '',
            department: '',
            phone: '',
            avatar_url: '',
            join_date: '',
            employee_id: '',
            profile_complete: false,
            center: '',
            hourly_wage: '',
            employment_status: '',
            unit: ''
          };

          // Check if the user has user_metadata and any profile fields filled
          const hasUserMetadata = !!supabaseUser.user_metadata;
          const hasProfileFields = hasUserMetadata && (
            supabaseUser.user_metadata?.name ||
            supabaseUser.user_metadata?.position ||
            supabaseUser.user_metadata?.employeeId ||
            supabaseUser.user_metadata?.center
          );
          
          // Explicitly check for profile_complete in metadata, or infer from profile fields
          const isProfileComplete = 
            supabaseUser.user_metadata?.profile_complete === true || 
            hasProfileFields;
          
          console.log('Profile complete status:', isProfileComplete, 'User metadata:', supabaseUser.user_metadata);
          
          // Create the updated user object
          const updatedUser = {
            ...initialUser,
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || profileData?.name || '',
            position: supabaseUser.user_metadata?.position || profileData?.position || '',
            department: supabaseUser.user_metadata?.department || profileData?.department || '',
            phone: supabaseUser.user_metadata?.phone || profileData?.phone || '',
            avatar: supabaseUser.user_metadata?.avatar || profileData?.avatar_url || '',
            joinDate: supabaseUser.user_metadata?.joinDate || profileData?.join_date || '',
            employeeId: supabaseUser.user_metadata?.employeeId || profileData?.employee_id || '', 
            profile_complete: isProfileComplete,
            center: supabaseUser.user_metadata?.center || profileData?.center || '',
            hourlyWage: supabaseUser.user_metadata?.hourlyWage || profileData?.hourly_wage || '',
            employmentStatus: supabaseUser.user_metadata?.employmentStatus || profileData?.employment_status || '',
            unit: supabaseUser.user_metadata?.unit || profileData?.unit || ''
          };
          
          // Save to localStorage for offline support
          get().saveUserToLocalStorage(updatedUser);
          
          // Update our state with this data
          set({
            user: updatedUser,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Error syncing user with Supabase:', error);
          // Determine if this is a network error and provide a more helpful message
          const errorMessage = error.message?.includes('NetworkError') || error.message?.includes('network') 
            ? 'Network connection issue detected. Please check your internet connection.'
            : error.message || 'Error syncing profile';
          
          // Try to load user data from localStorage as fallback
          const cachedUserData = useUserStore.getState().loadUserFromLocalStorage();
          if (cachedUserData && cachedUserData.id) {
            console.log('Found cached user data, using that while having connectivity issues');
            set({
              user: cachedUserData,
              loading: false, 
              error: 'Using locally saved data due to connectivity issues.',
              isAuthenticated: true
            });
            return;
          }
            
          set({ 
            loading: false, 
            error: errorMessage,
            // Keep authentication state to prevent unnecessary logouts during temporary network issues
            isAuthenticated: supabaseUser ? true : false 
          });
        }
      },
    }),
    {
      name: "user-storage"
    }
  )
)
