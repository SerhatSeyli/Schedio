"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, isSameWeek, addWeeks } from "date-fns"
import { cn } from "@/lib/utils"
import { useShiftStore, Shift } from "@/lib/store"
import { DollarSign, FileText } from "lucide-react"
import { getNextOccurrence, RecurringEvent } from "@/lib/recurring-dates"

// Calendar view event types
interface CalendarEvent {
  id: string | number;
  date: Date | string;
  type: string;
  eventType?: 'shift' | 'payday' | 'paycard';
  title?: string;
  iconColor?: string;
  icon?: React.ReactNode;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
}

interface CalendarViewProps {
  selectedDate: Date
  currentMonth: Date
  onDateSelect: (date: Date) => void
  onMonthChange: (date: Date) => void
}

export function CalendarView({ selectedDate, currentMonth, onDateSelect, onMonthChange }: CalendarViewProps) {
  const { shifts, recurringEvents } = useShiftStore()
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })
  
  // Generate events for Pay Day and Submit Pay Card for the month being viewed
  const getRecurringEvents = () => {
    const events: CalendarEvent[] = []
    
    // Get all Pay Day events for the current month view
    const payDayEvent = recurringEvents.find(e => e.type === 'payday')
    if (payDayEvent) {
      // Calculate all occurrences for the month being viewed
      const occurrences = getAllOccurrencesInMonth(payDayEvent, currentMonth)
      
      // Add each occurrence to events
      occurrences.forEach(date => {
        events.push({
          id: `payday-${date.toISOString()}`,
          date,
          type: 'payday',
          eventType: 'payday',
          title: 'Pay Day',
          iconColor: 'text-green-600 dark:text-green-400',
          icon: <DollarSign className="h-4 w-4" />
        })
      })
    }
    
    // Get all Submit Pay Card events for the current month view
    const payCardEvent = recurringEvents.find(e => e.type === 'paycard')
    if (payCardEvent) {
      // Calculate all occurrences for the month being viewed
      const occurrences = getAllOccurrencesInMonth(payCardEvent, currentMonth)
      
      // Add each occurrence to events
      occurrences.forEach(date => {
        events.push({
          id: `paycard-${date.toISOString()}`,
          date,
          type: 'paycard',
          eventType: 'paycard',
          title: 'Submit Pay Card',
          iconColor: 'text-blue-600 dark:text-blue-400',
          icon: <FileText className="h-4 w-4" />
        })
      })
    }
    
    return events
  }
  
  // Helper function to calculate all occurrences of a recurring event within a specific month
  const getAllOccurrencesInMonth = (event: RecurringEvent, month: Date): Date[] => {
    const occurrences: Date[] = []
    const startOfMonthDate = startOfMonth(month)
    const endOfMonthDate = endOfMonth(month)
    
    // Start from the event's first date
    let currentDate = new Date(event.firstDate)
    
    // If the first occurrence is in the future compared to the month we're viewing,
    // then there are no occurrences in this month
    if (currentDate > endOfMonthDate) {
      return []
    }
    
    // Move forward until we reach the month we're viewing
    // Using a weekly interval (event.interval is in weeks)
    const intervalMs = event.interval * 7 * 24 * 60 * 60 * 1000
    
    // Find the first occurrence that's before or in our target month
    while (currentDate < startOfMonthDate) {
      // Add weeks based on interval
      const nextDate = new Date(currentDate.getTime() + intervalMs)
      currentDate = nextDate
    }
    
    // Now collect all occurrences within the month
    while (currentDate <= endOfMonthDate) {
      if (currentDate >= startOfMonthDate) {
        occurrences.push(new Date(currentDate))
      }
      
      // Move to next occurrence based on interval
      const nextDate = new Date(currentDate.getTime() + intervalMs)
      currentDate = nextDate
    }
    
    return occurrences
  }
  
  // Get all events for each day (shifts + pay day + pay card)
  const getEventsForDay = (day: Date) => {
    // Get regular shifts
    const shiftEvents = shifts
      .filter((shift: Shift) => isSameDay(new Date(shift.date), day))
      .map((shift: Shift) => ({
        ...shift,
        eventType: 'shift' as const
      }))
    
    // Get recurring events (pay day and pay card)
    const recurringEventsForDay = getRecurringEvents()
      .filter((event: CalendarEvent) => isSameDay(new Date(event.date), day))
    
    return [...shiftEvents, ...recurringEventsForDay]
  }

  // Get day cell class based on shifts
  const getDayClass = (day: Date) => {
    const isSelected = isSameDay(day, selectedDate)
    const isCurrentMonth = isSameMonth(day, currentMonth)
    const today = isSameDay(day, new Date())

    if (!isCurrentMonth) {
      return "text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    }

    if (isSelected) {
      return "bg-primary/10 text-primary border-primary font-medium"
    }

    if (today) {
      return "border-primary/30 text-gray-900 dark:text-gray-100 font-medium"
    }

    return "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Map through all days of the month */}
        {days.map((day) => {
          const eventsForDay = getEventsForDay(day)
          
          // Skip days with no events
          if (eventsForDay.length === 0) return null
          
          return (
            <div 
              key={day.toString()} 
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                isSameDay(day, selectedDate) && "ring-2 ring-primary/50",
                !isSameMonth(day, currentMonth) && "opacity-60"
              )}
              onClick={() => onDateSelect(day)}
            >
              <div className="font-medium text-sm mb-2">{format(day, "EEEE, MMMM d")}</div>
              
              {/* Display all events for this day */}
              <div className="space-y-2 mt-2">
                {eventsForDay.map((event) => {
                  if (event.eventType === 'payday') {
                    return (
                      <div 
                        key={event.id.toString()} 
                        className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Pay Day</p>
                          <p className="text-xs text-muted-foreground">Bi-weekly payment</p>
                        </div>
                      </div>
                    )
                  } else if (event.eventType === 'paycard') {
                    return (
                      <div 
                        key={event.id.toString()} 
                        className="flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Submit Pay Card</p>
                          <p className="text-xs text-muted-foreground">PSCClient submission due</p>
                        </div>
                      </div>
                    )
                  } else {
                    // Regular shift
                    const shift = event as any
                    return (
                      <div 
                        key={shift.id.toString()} 
                        className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                      >
                        <div 
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            shift.type === "day" && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
                            shift.type === "night" && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                            shift.type === "overtime" && "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
                            shift.type === "sick" && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                            shift.type === "vacation" && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                            shift.type === "meeting" && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          )}
                        >
                          {/* We could use ShiftTypeIcon here */}
                          {shift.type.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {shift.type} {shift.type !== "sick" && shift.type !== "vacation" && "Shift"}
                          </p>
                          {shift.startTime && shift.endTime && (
                            <p className="text-xs text-muted-foreground">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          )}
                          {shift.location && (
                            <p className="text-xs text-muted-foreground">{shift.location}</p>
                          )}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          )
        }).filter(Boolean)}
      </div>
    </div>
  )
}
