import { create } from "zustand"
import { persist } from "zustand/middleware"
// TODO: Integrate with Supabase for cloud sync
// import { supabase } from "@/lib/supabase"
// All Firebase imports removed
import { useUserStore } from "./user-store"
import { RecurringEvent } from "@/lib/recurring-dates"

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
  notify?: boolean
  isPayDay?: boolean
  isSubmitPayCard?: boolean
  payAmount?: string
  payCardNotes?: string
}

interface ShiftState {
  shifts: Shift[]
  recurringEvents: RecurringEvent[]
  loading: boolean
  error: string | null
  addShift: (shift: Omit<Shift, "id">) => Promise<number>
  updateShift: (id: number, shift: Partial<Shift>) => Promise<void>
  deleteShift: (id: number) => Promise<void>
  toggleCompleted: (id: number) => Promise<void>
  fetchShifts: () => Promise<void>
  syncShiftsToCloud: () => Promise<void> // TODO: Implement with Supabase
  clearAllShifts: () => void // Function to clear all shifts on logout
  addRecurringEvent: (event: Omit<RecurringEvent, "id">) => void
  updateRecurringEvent: (id: string, event: Partial<RecurringEvent>) => void
  deleteRecurringEvent: (id: string) => void
}

// Initialize with empty arrays for new users
const initialShifts: Shift[] = [];
const initialRecurringEvents: RecurringEvent[] = [];

// Clear shifts function to be called on logout
export const clearShifts = () => {
  useShiftStore.getState().clearAllShifts();
};

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      shifts: initialShifts,
      recurringEvents: initialRecurringEvents,
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
        set({ shifts: [], recurringEvents: [] });
      },
      
      addRecurringEvent: (event) =>
        set((state) => ({
          recurringEvents: [
            ...state.recurringEvents,
            {
              ...event,
              id: String(Date.now()),
            },
          ],
        })),
        
      updateRecurringEvent: (id, updatedEvent) =>
        set((state) => ({
          recurringEvents: state.recurringEvents.map((event) =>
            event.id === id ? { ...event, ...updatedEvent } : event
          ),
        })),
        
      deleteRecurringEvent: (id) =>
        set((state) => ({
          recurringEvents: state.recurringEvents.filter((event) => event.id !== id),
        })),
    }),
    {
      name: "shift-storage",
    },
  ),
)
