import { create } from "zustand"
import { persist } from "zustand/middleware"
// TODO: Integrate with Supabase for cloud sync
// import { supabase } from "@/lib/supabase"
// All Firebase imports removed
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
  syncShiftsToCloud: () => Promise<void>, // TODO: Implement with Supabase
  clearAllShifts: () => void // Function to clear all shifts on logout
}

// Initialize with empty array for new users
const initialShifts: Shift[] = [];

// Clear shifts function to be called on logout
export const clearShifts = () => {
  useShiftStore.getState().clearAllShifts();
};

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      shifts: initialShifts,
      loading: false,
      error: null,
      
      addShift: async (shift) => {
        // TODO: Replace with Supabase insert
        // Local mock: just add to state
        set(state => {
          const newId = Math.max(0, ...state.shifts.map(s => s.id)) + 1;
          const newShift = { ...shift, id: newId };
          return { shifts: [...state.shifts, newShift] };
        });
        return Promise.resolve(Math.max(0, ...get().shifts.map(s => s.id)));
      },
      
      updateShift: async (id, updatedShift) => {
        // TODO: Replace with Supabase update
        set(state => ({
          shifts: state.shifts.map(s => (s.id === id ? { ...s, ...updatedShift } : s)),
        }));
        return Promise.resolve();
      },
      
      deleteShift: async (id) => {
        // TODO: Replace with Supabase delete
        set(state => ({ shifts: state.shifts.filter(s => s.id !== id) }));
        return Promise.resolve();
      },
      
      toggleCompleted: async (id) => {
        const { shifts } = get()
        const shift = shifts.find(s => s.id === id)
        if (!shift) return
        
        const completed = !shift.completed
        
        set(state => ({
          shifts: state.shifts.map(s => (s.id === id ? { ...s, completed } : s)),
        }));
        return Promise.resolve();
      },
      
      fetchShifts: async () => {
        // TODO: Replace with Supabase fetch
        // For now, do nothing (local only)
        return Promise.resolve();
      },
      
      syncShiftsToCloud: async () => {
        // TODO: Implement cloud sync with Supabase
        console.log('Syncing shifts to cloud...');
        // Mock success response
        return Promise.resolve();
      },
      
      clearAllShifts: () => {
        set({ shifts: [] });
      },
    }),
    {
      name: "shift-storage",
    },
  ),
)
