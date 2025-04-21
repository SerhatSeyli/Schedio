"use client"

import { useState } from "react"
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ShiftList } from "@/components/shift-list"
import { AddShiftDialog } from "@/components/add-shift-dialog"
import { BottomNav } from "@/components/bottom-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { useShiftStore } from "@/lib/store"
import { NotificationsPopover } from "@/components/notifications"
import { ProfileMenu } from "@/components/profile-menu"

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false)
  const { shifts } = useShiftStore()

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Generate days for the current month view
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    return shifts.filter((shift) => isSameDay(new Date(shift.date), day))
  }

  // Calculate empty cells before the first day of the month
  const firstDayOfMonth = getDay(startOfMonth(currentMonth))

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
          <div className="container flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-1.5 rounded-lg">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Calendar
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationsPopover />
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="p-2 text-center text-sm" />
                ))}

                {days.map((day) => {
                  const dayShifts = getShiftsForDay(day)
                  const isToday = isSameDay(day, new Date())
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentMonth = isSameMonth(day, currentMonth)

                  return (
                    <button
                      key={day.toString()}
                      className={cn(
                        "aspect-square p-1 rounded-lg text-center relative border-2 border-transparent transition-all",
                        !isCurrentMonth &&
                          "text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                        isSelected && "bg-primary/10 text-primary border-primary font-medium",
                        isToday && !isSelected && "border-primary/30 text-gray-900 dark:text-gray-100 font-medium",
                        isCurrentMonth &&
                          !isSelected &&
                          !isToday &&
                          "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50",
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-sm font-medium">{format(day, "d")}</span>

                        {dayShifts.length > 0 && (
                          <div className="flex justify-center gap-1 mt-1">
                            {dayShifts.slice(0, 3).map((shift) => (
                              <div
                                key={shift.id}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  shift.type === "day" && "bg-yellow-500",
                                  shift.type === "night" && "bg-blue-500",
                                  shift.type === "overtime" && "bg-orange-500",
                                  shift.type === "sick" && "bg-red-500",
                                  shift.type === "vacation" && "bg-purple-500",
                                  shift.type === "meeting" && "bg-green-500",
                                )}
                              />
                            ))}
                            {dayShifts.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selected Day Shifts */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
            <ShiftList date={selectedDate} />
          </div>
        </main>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          onClick={() => setIsAddShiftOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav activePage="calendar" />
        </div>

        {/* Add Shift Dialog */}
        <AddShiftDialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen} selectedDate={selectedDate} />
      </div>
    </div>
  )
}

function Menu({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
