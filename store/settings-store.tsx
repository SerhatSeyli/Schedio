import { create } from "zustand"
import { persist } from "zustand/middleware"
import { RecurringEvent } from "@/lib/recurring-dates"

export interface NotificationSettings {
  beforeShift: boolean
  shiftChanges: boolean
  recurringEvents: boolean
  systemAnnouncements: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  compactView: boolean
  colorScheme: "default" | "blue" | "green" | "purple"
}

export interface ShiftPreferences {
  preferredShiftType: "day" | "night" | "any"
  preferredLocations: string[]
  maxShiftsPerWeek: number
  minRestHours: number
}

export interface FinancialSettings {
  hourlyRate: number
  overtimeRate: number
  overtimeMultiplier: 1.5 | 2 // Saskatchewan overtime multiplier: time-and-a-half (1.5) or double-time (2)
  defaultPayAmount: number
  payFrequency: "weekly" | "biweekly" | "monthly"
  payCardSubmissionDay: number // 0-6 for day of week
  taxProvince: "SK" // Saskatchewan as default
}

export interface SettingsState {
  notifications: NotificationSettings
  appearance: AppearanceSettings
  shiftPreferences: ShiftPreferences
  financialSettings: FinancialSettings
  recurringEvents: RecurringEvent[]
  updateNotifications: (settings: Partial<NotificationSettings>) => void
  updateAppearance: (settings: Partial<AppearanceSettings>) => void
  updateShiftPreferences: (preferences: Partial<ShiftPreferences>) => void
  updateFinancialSettings: (settings: Partial<FinancialSettings>) => void
  updateRecurringEvents: (events: RecurringEvent[]) => void
  addRecurringEvent: (event: RecurringEvent) => void
  removeRecurringEvent: (id: string) => void
}

// Default recurring events
const defaultRecurringEvents: RecurringEvent[] = [
  {
    id: "payday-1",
    title: "Pay Day",
    type: "payday",
    firstDate: new Date(2025, 3, 25), // April 25, 2025
    interval: 2, // biweekly
    amount: "2,500.00"
  },
  {
    id: "paycard-1",
    title: "Submit Pay Card",
    type: "paycard",
    firstDate: new Date(2025, 3, 18), // April 18, 2025
    interval: 2, // biweekly
    destination: "HR Department"
  }
]

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        beforeShift: true,
        shiftChanges: true,
        recurringEvents: true,
        systemAnnouncements: true,
        emailNotifications: false,
        pushNotifications: true
      },
      appearance: {
        theme: "system",
        compactView: false,
        colorScheme: "default"
      },
      shiftPreferences: {
        preferredShiftType: "any",
        preferredLocations: [],
        maxShiftsPerWeek: 5,
        minRestHours: 10
      },
      financialSettings: {
        hourlyRate: 25,
        overtimeRate: 37.5,
        overtimeMultiplier: 1.5,
        defaultPayAmount: 1000,
        payFrequency: "biweekly",
        payCardSubmissionDay: 5, // Friday
        taxProvince: "SK" // Saskatchewan
      },
      recurringEvents: defaultRecurringEvents,
      
      updateNotifications: (settings) => 
        set((state) => ({
          notifications: { ...state.notifications, ...settings }
        })),
      
      updateAppearance: (settings) => 
        set((state) => ({
          appearance: { ...state.appearance, ...settings }
        })),
      
      updateShiftPreferences: (preferences) => 
        set((state) => ({
          shiftPreferences: { ...state.shiftPreferences, ...preferences }
        })),
      
      updateFinancialSettings: (settings) => 
        set((state) => ({
          financialSettings: { ...state.financialSettings, ...settings }
        })),
      
      updateRecurringEvents: (events) => 
        set(() => ({
          recurringEvents: events
        })),
      
      addRecurringEvent: (event) => 
        set((state) => ({
          recurringEvents: [...state.recurringEvents, event]
        })),
      
      removeRecurringEvent: (id) => 
        set((state) => ({
          recurringEvents: state.recurringEvents.filter(event => event.id !== id)
        }))
    }),
    {
      name: "settings-storage",
    }
  )
)
