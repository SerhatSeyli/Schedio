import { create } from "zustand"
import { persist } from "zustand/middleware"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
  Auth,
  GoogleAuthProvider
} from "firebase/auth"
import { auth, db, googleProvider } from "@/lib/firebase"

// No need for declaration as db is imported
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Firestore 
} from "firebase/firestore"

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
  firebaseUser?: FirebaseUser | null
}

export interface UserState {
  user: UserProfile
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  updateProfile: (profile: Partial<UserProfile>) => void
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<boolean>
  googleLogin: () => Promise<boolean>
  logout: () => Promise<void>
  syncUserWithFirebase: (firebaseUser: FirebaseUser | null) => Promise<void>
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
  firebaseUser: null
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: initialUser,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      updateProfile: async (profile) => {
        set((state) => ({
          user: { ...state.user, ...profile }
        }))
        
        // If user is authenticated, update Firestore profile
        const { user, isAuthenticated } = get()
        if (isAuthenticated && user.id) {
          try {
            await updateDoc(doc(db, 'users', user.id), profile)
            
            // If name is being updated and we have a Firebase user, update display name
            if (profile.name && user.firebaseUser) {
              await updateFirebaseProfile(user.firebaseUser, {
                displayName: profile.name
              })
            }
          } catch (error) {
            console.error('Error updating profile:', error)
          }
        }
      },
      
      login: async (credentials) => {
        try {
          set({ loading: true, error: null })
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )
          
          // User is now logged in via Firebase
          // The onAuthStateChanged listener will handle updating the store
          set({ loading: false })
          return true
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to login' 
          })
          return false
        }
      },
      
      signUp: async (credentials) => {
        try {
          set({ loading: true, error: null })
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )
          
          // Set display name
          await updateFirebaseProfile(userCredential.user, {
            displayName: credentials.name
          })
          
          // Create user document in Firestore
          const newUser: UserProfile = {
            id: userCredential.user.uid,
            name: credentials.name,
            email: credentials.email,
            phone: "",
            position: "",
            department: "",
            avatar: userCredential.user.photoURL || "",
            joinDate: new Date().toISOString().split('T')[0],
            employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
            firebaseUser: userCredential.user
          }
          
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            ...newUser,
            firebaseUser: null // Don't store Firebase user object in Firestore
          })
          
          set({ 
            user: newUser,
            isAuthenticated: true,
            loading: false 
          })
          
          return true
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to sign up' 
          })
          return false
        }
      },
      
      googleLogin: async () => {
        try {
          console.log('Starting Google login process...');
          set({ loading: true, error: null });
          
          // Try a different approach for Google authentication
          try {
            // Using signInWithPopup as the primary method
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google sign-in successful:', result.user.uid);
            
            // Get the user token for additional verification
            const token = await result.user.getIdToken();
            console.log('User token obtained successfully');
            
            // Check if this is a new user (first time Google sign-in)
            const isNewUser = (result as any)._tokenResponse?.isNewUser;
            console.log('Is new Google user:', isNewUser);
            
            if (isNewUser) {
              console.log('Creating new user profile in Firestore...');
              // Create a new user profile in Firestore for first-time Google users
              const newUser: UserProfile = {
                id: result.user.uid,
                name: result.user.displayName || '',
                email: result.user.email || '',
                phone: '',
                position: '',
                department: '',
                avatar: result.user.photoURL || '',
                joinDate: new Date().toISOString().split('T')[0],
                employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
                firebaseUser: result.user
              }
              
              try {
                await setDoc(doc(db, 'users', result.user.uid), {
                  ...newUser,
                  firebaseUser: null // Don't store Firebase user object in Firestore
                });
                console.log('User profile created successfully in Firestore');
              } catch (firestoreError) {
                console.error('Error creating user profile in Firestore:', firestoreError);
                // Continue even if Firestore fails - we still have the authenticated user
              }
              
              set({ 
                user: newUser,
                isAuthenticated: true,
                loading: false 
              });
            } else {
              console.log('Existing Google user, fetching profile...');
              // Existing Google user, set authentication state directly
              set({
                user: {
                  ...get().user,
                  id: result.user.uid,
                  name: result.user.displayName || '',
                  email: result.user.email || '',
                  avatar: result.user.photoURL || '',
                  firebaseUser: result.user
                },
                isAuthenticated: true,
                loading: false
              });
            }
            
            return true;
          } catch (authError: any) {
            console.log('Google authentication error:', authError);
            throw authError; // Re-throw to be caught by the outer catch block
          }
        } catch (error: any) {
          console.error('Google login error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // Handle specific Google sign-in errors with better messages
          let errorMessage = 'Failed to login with Google';
          
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Google sign-in was cancelled. Please try again.';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Google sign-in popup was blocked. Please enable popups for this site.';
          } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
          } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'This domain is not authorized for OAuth operations. Please add "localhost" to authorized domains in the Firebase console.';
          } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Google sign-in is not enabled. Please enable it in the Firebase console.';
          } else {
            // If we have a specific error message, use it
            errorMessage = `Google login failed: ${error.message || 'Unknown error'}`;
          }
          
          set({ 
            loading: false, 
            error: errorMessage
          });
          return false;
        }
      },
      
      logout: async () => {
        try {
          // First update the local state to prevent flashing of authenticated content
          set({ 
            loading: true
          })
          
          // Then sign out from Firebase
          await signOut(auth)
          
          // Finally update the complete state
          set({ 
            user: initialUser,
            isAuthenticated: false,
            loading: false
          })
          
          // Force redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        } catch (error) {
          console.error('Error signing out:', error)
          set({ loading: false })
        }
      },
      
      syncUserWithFirebase: async (firebaseUser) => {
        if (!firebaseUser) {
          console.log('No Firebase user provided for sync');
          set({ 
            user: initialUser,
            isAuthenticated: false 
          })
          return
        }
        
        // Always set the user as authenticated first to prevent logout on sync failure
        // Create a basic user profile from Firebase user data
        const basicUser: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          position: '',
          department: '',
          avatar: firebaseUser.photoURL || '',
          joinDate: new Date().toISOString().split('T')[0],
          employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
          firebaseUser
        }
        
        // Set basic authentication immediately
        set({
          user: basicUser,
          isAuthenticated: true,
          error: null
        })
        
        console.log('User authenticated with basic profile, attempting cloud sync...');
        
        try {
          console.log('Starting user sync with Firebase for user:', firebaseUser.uid);
          
          // Get user data from Firestore
          try {
            console.log('Attempting to fetch user document from Firestore...');
            // Add timeout to Firestore operations to prevent hanging
            const userDocPromise = getDoc(doc(db, 'users', firebaseUser.uid));
            
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Firestore operation timed out')), 10000); // 10 second timeout
            });
            
            // Race the promises
            const userDoc = await Promise.race([userDocPromise, timeoutPromise]) as any;
            
            if (userDoc.exists()) {
              console.log('User document found in Firestore');
              // User exists in Firestore, use that data
              const userData = userDoc.data() as UserProfile
              set({ 
                user: { ...userData, firebaseUser, id: firebaseUser.uid },
                isAuthenticated: true,
                error: null
              })
              console.log('User data synced successfully from Firestore');
            } else {
              console.log('User document not found in Firestore, creating new profile');
              // First time login or user doesn't exist in Firestore yet
              // Create a new user profile
              const newUser: UserProfile = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                phone: firebaseUser.phoneNumber || '',
                position: '',
                department: '',
                avatar: firebaseUser.photoURL || '',
                joinDate: new Date().toISOString().split('T')[0],
                employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
                firebaseUser
              }
              
              // Save to Firestore
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  ...newUser,
                  firebaseUser: null // Don't store Firebase user object in Firestore
                })
                console.log('New user profile created in Firestore');
                
                set({ 
                  user: newUser,
                  isAuthenticated: true,
                  error: null
                })
              } catch (firestoreError) {
                console.error('Error creating new user in Firestore:', firestoreError);
                // Still set the user as authenticated even if Firestore fails
                set({ 
                  user: { ...newUser, firebaseUser },
                  isAuthenticated: true,
                  error: 'Profile created but not saved to cloud'
                })
              }
            }
          } catch (firestoreError) {
            console.error('Error accessing Firestore during sync:', firestoreError);
            // If Firestore fails but we have a Firebase user, we're already authenticated with the basic profile
            // Just update the error message but don't change authentication state
            set(state => ({ 
              ...state, // Keep existing state including user data
              error: 'Connected but cloud sync failed. Your data will be saved locally.'
            }))
          }
        } catch (error) {
          console.error('Fatal error syncing with Firebase:', error);
          // Set more detailed error message but keep user logged in
          let errorMessage = 'Failed to sync user data';
          if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
          }
          // Only update the error message, don't change authentication state
          set(state => ({
            ...state, // Keep existing state including user data and authentication
            error: errorMessage
          }));
        }
      }
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        // Don't persist these fields to localStorage
        user: {
          ...state.user,
          firebaseUser: null
        },
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
