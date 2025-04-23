import { create } from "zustand"
import { persist } from "zustand/middleware"
import { addDays, format } from "date-fns"
import { RecurringEvent } from "./recurring-dates"

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
  addShift: (shift: Omit<Shift, "id">) => void
  updateShift: (id: number, shift: Partial<Shift>) => void
  deleteShift: (id: number) => void
  toggleCompleted: (id: number) => void
  addRecurringEvent: (event: Omit<RecurringEvent, "id">) => void
  updateRecurringEvent: (id: string, event: Partial<RecurringEvent>) => void
  deleteRecurringEvent: (id: string) => void
}

// Empty initial recurring events for fresh accounts
const initialRecurringEvents: RecurringEvent[] = []

// Empty initial shifts for fresh accounts
const initialShifts: Shift[] = []

export const useShiftStore = create(
  persist<ShiftState>(
    (set) => ({
      shifts: initialShifts,
      recurringEvents: initialRecurringEvents,
      addShift: (shift) =>
        set((state) => ({
          shifts: [
            ...state.shifts,
            {
              ...shift,
              id: Math.max(0, ...state.shifts.map((s) => s.id)) + 1,
            },
          ],
        })),
      updateShift: (id, updatedShift) =>
        set((state) => ({
          shifts: state.shifts.map((shift) => (shift.id === id ? { ...shift, ...updatedShift } : shift)),
        })),
      deleteShift: (id) =>
        set((state) => ({
          shifts: state.shifts.filter((shift) => shift.id !== id),
        })),
      toggleCompleted: (id: number) =>
        set((state) => ({
          shifts: state.shifts.map((shift) =>
            shift.id === id ? { ...shift, completed: !shift.completed } : shift
          ),
        })),
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
