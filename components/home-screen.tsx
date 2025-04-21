"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, isSameDay, addMonths, subMonths } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Menu, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShiftList } from "@/components/shift-list"
import { AddShiftDialog } from "@/components/add-shift-dialog"
import { BottomNav } from "@/components/bottom-nav"
import { CalendarView } from "@/components/calendar-view"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { useShiftStore } from "@/store/shift-store"
import { ShiftTypeIcon } from "@/components/shift-type-icon"
import { NotificationsPopover } from "@/components/notifications"
import { ProfileMenu } from "@/components/profile-menu"

export function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [view, setView] = useState<"today" | "week" | "month">("today")
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false)

  // Generate week days starting from current week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

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
                  ShiftTrac
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationsPopover />
              <ProfileMenu />
            </div>
          </div>

          {/* View Selector */}
          <div className="container pb-2">
            <Tabs defaultValue="today" value={view} onValueChange={(v) => setView(v as any)} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {view === "month"
                    ? format(currentMonth, "MMMM yyyy")
                    : view === "week"
                      ? `Week of ${format(weekStart, "MMM d")}`
                      : format(selectedDate, "EEEE, MMMM d")}
                </h2>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      if (view === "month") handlePreviousMonth()
                      else setSelectedDate(addDays(selectedDate, view === "week" ? -7 : -1))
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      if (view === "month") handleNextMonth()
                      else setSelectedDate(addDays(selectedDate, view === "week" ? 7 : 1))
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="today" className="rounded-md">
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="rounded-md">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="rounded-md">
                  Month
                </TabsTrigger>
              </TabsList>

              {/* Week Slider (visible in week view) */}
              {view === "week" && (
                <div className="overflow-x-auto pb-2 mt-2">
                  <div className="flex gap-2 py-2">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mx-auto">
                      {weekDays.map((day) => (
                        <button
                          key={day.toString()}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-xl w-12 h-16 shrink-0 transition-all",
                            isSameDay(day, selectedDate)
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
                          )}
                          onClick={() => setSelectedDate(day)}
                        >
                          <span className="text-xs font-medium">{format(day, "EEE")}</span>
                          <span className="text-lg font-bold">{format(day, "d")}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <TabsContent value="today" className="mt-4">
                <ShiftList date={selectedDate} />
              </TabsContent>

              <TabsContent value="week" className="mt-4">
                <ShiftList date={selectedDate} />
              </TabsContent>

              <TabsContent value="month" className="mt-4">
                <CalendarView
                  selectedDate={selectedDate}
                  currentMonth={currentMonth}
                  onDateSelect={setSelectedDate}
                  onMonthChange={setCurrentMonth}
                />
              </TabsContent>
            </Tabs>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container py-4"></main>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          onClick={() => setIsAddShiftOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Bottom Navigation - Only visible on mobile */}
        <div className="md:hidden">
          <BottomNav activePage="home" />
        </div>

        {/* Add Shift Dialog */}
        <AddShiftDialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen} selectedDate={selectedDate} />
      </div>
    </div>
  )
}
