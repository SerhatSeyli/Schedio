import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "@/lib/firebase"
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore"
import { useUserStore } from "./user-store"

export type ShiftType = "day" | "night" | "overtime" | "sick" | "vacation" | "meeting"

export interface Shift {
  id: number
  date: string | Date
  type: ShiftType
  startTime: string
  endTime: string
  notes: string
  completed: boolean
  location: string
}

interface ShiftState {
  shifts: Shift[]
  loading: boolean
  error: string | null
  addShift: (shift: Omit<Shift, "id">) => Promise<number>
  updateShift: (id: number, shift: Partial<Shift>) => Promise<void>
  deleteShift: (id: number) => Promise<void>
  toggleCompleted: (id: number) => Promise<void>
  fetchShifts: () => Promise<void>
  syncShiftsToCloud: () => Promise<void>
}

// Initial mock data
const initialShifts: Shift[] = [
  {
    id: 1,
    date: new Date(),
    type: "day",
    startTime: "07:00",
    endTime: "19:00",
    notes: "",
    completed: true,
    location: "Main Building",
  },
  {
    id: 2,
    date: new Date(),
    type: "overtime",
    startTime: "19:00",
    endTime: "23:00",
    notes: "Emergency coverage",
    completed: true,
    location: "East Wing",
  },
  {
    id: 3,
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    type: "night",
    startTime: "19:00",
    endTime: "07:00",
    notes: "",
    completed: false,
    location: "West Wing",
  },
  {
    id: 4,
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    type: "sick",
    startTime: "",
    endTime: "",
    notes: "Migraine",
    completed: false,
    location: "",
  },
  {
    id: 5,
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    type: "day",
    startTime: "07:00",
    endTime: "19:00",
    notes: "",
    completed: false,
    location: "Main Building",
  },
  {
    id: 6,
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    type: "night",
    startTime: "19:00",
    endTime: "07:00",
    notes: "",
    completed: false,
    location: "East Wing",
  },
  {
    id: 7,
    date: new Date(new Date().setDate(new Date().getDate() + 10)),
    type: "vacation",
    startTime: "",
    endTime: "",
    notes: "Family trip",
    completed: false,
    location: "",
  },
  {
    id: 8,
    date: new Date(new Date().setDate(new Date().getDate() + 14)),
    type: "meeting",
    startTime: "10:00",
    endTime: "11:30",
    notes: "Staff meeting",
    completed: false,
    location: "Conference Room",
  },
]

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      shifts: initialShifts,
      loading: false,
      error: null,
      
      addShift: async (shift) => {
        const { shifts } = get()
        const newId = Math.max(0, ...shifts.map((s) => s.id)) + 1
        const newShift = {
          ...shift,
          id: newId,
        }
        
        set((state) => ({
          shifts: [...state.shifts, newShift],
          loading: true
        }))
        
        // Sync to Firestore if user is authenticated
        const { isAuthenticated, user } = useUserStore.getState()
        if (isAuthenticated && user.id) {
          try {
            const shiftRef = doc(collection(db, 'users', user.id, 'shifts'))
            await setDoc(shiftRef, {
              ...newShift,
              date: newShift.date instanceof Date ? newShift.date.toISOString() : newShift.date,
              userId: user.id
            })
            set({ loading: false })
          } catch (error: any) {
            console.error('Error adding shift to Firestore:', error)
            set({ 
              loading: false,
              error: error.message || 'Failed to save shift to cloud'
            })
          }
        } else {
          set({ loading: false })
        }
        
        return newId
      },
      
      updateShift: async (id, updatedShift) => {
        set((state) => ({
          shifts: state.shifts.map((shift) => (shift.id === id ? { ...shift, ...updatedShift } : shift)),
          loading: true
        }))
        
        // Sync to Firestore if user is authenticated
        const { isAuthenticated, user } = useUserStore.getState()
        if (isAuthenticated && user.id) {
          try {
            // Find the shift in Firestore
            const shiftsRef = collection(db, 'users', user.id, 'shifts')
            const q = query(shiftsRef, where('id', '==', id))
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
              const shiftDoc = querySnapshot.docs[0]
              await updateDoc(shiftDoc.ref, {
                ...updatedShift,
                date: updatedShift.date instanceof Date ? updatedShift.date.toISOString() : updatedShift.date
              })
            }
            set({ loading: false })
          } catch (error: any) {
            console.error('Error updating shift in Firestore:', error)
            set({ 
              loading: false,
              error: error.message || 'Failed to update shift in cloud'
            })
          }
        } else {
          set({ loading: false })
        }
      },
      
      deleteShift: async (id) => {
        set((state) => ({
          shifts: state.shifts.filter((shift) => shift.id !== id),
          loading: true
        }))
        
        // Sync to Firestore if user is authenticated
        const { isAuthenticated, user } = useUserStore.getState()
        if (isAuthenticated && user.id) {
          try {
            // Find the shift in Firestore
            const shiftsRef = collection(db, 'users', user.id, 'shifts')
            const q = query(shiftsRef, where('id', '==', id))
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
              const shiftDoc = querySnapshot.docs[0]
              await deleteDoc(shiftDoc.ref)
            }
            set({ loading: false })
          } catch (error: any) {
            console.error('Error deleting shift from Firestore:', error)
            set({ 
              loading: false,
              error: error.message || 'Failed to delete shift from cloud'
            })
          }
        } else {
          set({ loading: false })
        }
      },
      
      toggleCompleted: async (id) => {
        const { shifts } = get()
        const shift = shifts.find(s => s.id === id)
        if (!shift) return
        
        const completed = !shift.completed
        
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, completed } : s)),
          loading: true
        }))
        
        // Sync to Firestore if user is authenticated
        const { isAuthenticated, user } = useUserStore.getState()
        if (isAuthenticated && user.id) {
          try {
            // Find the shift in Firestore
            const shiftsRef = collection(db, 'users', user.id, 'shifts')
            const q = query(shiftsRef, where('id', '==', id))
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
              const shiftDoc = querySnapshot.docs[0]
              await updateDoc(shiftDoc.ref, { completed })
            }
            set({ loading: false })
          } catch (error: any) {
            console.error('Error updating shift completion in Firestore:', error)
            set({ 
              loading: false,
              error: error.message || 'Failed to update shift in cloud'
            })
          }
        } else {
          set({ loading: false })
        }
      },
      
      fetchShifts: async () => {
        const { isAuthenticated, user } = useUserStore.getState()
        if (!isAuthenticated || !user.id) return
        
        set({ loading: true, error: null })
        
        try {
          const shiftsRef = collection(db, 'users', user.id, 'shifts')
          const q = query(shiftsRef, orderBy('date', 'asc'))
          const querySnapshot = await getDocs(q)
          
          const shifts: Shift[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            shifts.push({
              ...data,
              id: data.id,
              date: data.date ? new Date(data.date) : new Date(),
            } as Shift)
          })
          
          set({ shifts, loading: false })
        } catch (error: any) {
          console.error('Error fetching shifts from Firestore:', error)
          set({ 
            loading: false,
            error: error.message || 'Failed to fetch shifts from cloud'
          })
        }
      },
      
      syncShiftsToCloud: async () => {
        const { isAuthenticated, user } = useUserStore.getState()
        const { shifts } = get()
        
        if (!isAuthenticated || !user.id) return
        
        set({ loading: true, error: null })
        
        try {
          // Get all shifts for this user
          const shiftsRef = collection(db, 'users', user.id, 'shifts')
          const querySnapshot = await getDocs(shiftsRef)
          
          // Delete all existing shifts
          const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
          await Promise.all(deletePromises)
          
          // Add all current shifts
          const addPromises = shifts.map(shift => {
            const shiftRef = doc(collection(db, 'users', user.id, 'shifts'))
            return setDoc(shiftRef, {
              ...shift,
              date: shift.date instanceof Date ? shift.date.toISOString() : shift.date,
              userId: user.id
            })
          })
          
          await Promise.all(addPromises)
          set({ loading: false })
        } catch (error: any) {
          console.error('Error syncing shifts to Firestore:', error)
          set({ 
            loading: false,
            error: error.message || 'Failed to sync shifts to cloud'
          })
        }
      }
    }),
    {
      name: "shift-storage",
    },
  ),
)
