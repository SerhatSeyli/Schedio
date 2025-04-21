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

// Initial recurring events
const initialRecurringEvents: RecurringEvent[] = [
  {
    id: '1',
    title: 'Pay Day',
    type: 'payday',
    firstDate: new Date('2025-04-26'),  // April 26, 2025
    interval: 2, // every 2 weeks
    amount: '2500.00'
  },
  {
    id: '2',
    title: 'Submit Pay Card',
    type: 'paycard',
    firstDate: new Date('2025-04-18'),  // April 18, 2025
    interval: 2, // every 2 weeks
    destination: 'PSCClient',
    notes: 'Submit to https://pscclient.saskatchewan.ca'
  }
]

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
