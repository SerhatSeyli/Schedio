import { ReactNode } from "react"

export type NotificationType = "upcoming" | "changed" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timeAgo: string
  read: boolean
  link?: string
  icon?: ReactNode
}

// Re-export for convenience
export type { RecurringEvent, RecurringEventType } from "./recurring-dates"
