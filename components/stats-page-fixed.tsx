"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, subMonths, addMonths, differenceInHours } from "date-fns"
import {
  PieChart,
  BarChart,
  Bar,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChevronLeft, ChevronRight, PieChartIcon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { useShiftStore } from "@/lib/store"

export function StatsPageFixed() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const { shifts } = useShiftStore()

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Filter shifts for the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const monthShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date)
    return shiftDate >= monthStart && shiftDate <= monthEnd
  })

  // Calculate statistics
  const totalShifts = monthShifts.length
  const dayShifts = monthShifts.filter((shift) => shift.type === "day").length
  const nightShifts = monthShifts.filter((shift) => shift.type === "night").length
  const overtimeShifts = monthShifts.filter((shift) => shift.type === "overtime").length
  const sickDays = monthShifts.filter((shift) => shift.type === "sick").length
  const vacationDays = monthShifts.filter((shift) => shift.type === "vacation").length

  // Calculate earnings
  const totalEarnings = monthShifts.reduce((total, shift) => {
    const hours = shift.endTime && shift.startTime
      ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
      : 0
    
    let rate = 25 // Default hourly rate
    
    if (shift.type === "overtime") {
      rate = 37.5 // Overtime rate
    } else if (shift.type === "night") {
      rate = 30 // Night differential
    }
    
    return total + (hours * rate)
  }, 0)

  // Calculate total hours worked
  const totalHours = monthShifts.reduce((total, shift) => {
    const hours = shift.endTime && shift.startTime
      ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
      : 0
    return total + hours
  }, 0)

  // Data for pie chart
  const shiftTypeData = [
    { name: "Day", value: dayShifts, color: "#3b82f6" },
    { name: "Night", value: nightShifts, color: "#8b5cf6" },
    { name: "Overtime", value: overtimeShifts, color: "#f59e0b" },
    { name: "Sick", value: sickDays, color: "#ef4444" },
    { name: "Vacation", value: vacationDays, color: "#10b981" },
  ].filter(item => item.value > 0) // Only include non-zero values

  // Data for bar chart - hours by shift type
  const hoursData = [
    { name: "Day", hours: monthShifts.filter(s => s.type === "day").reduce((total, shift) => {
      return total + (shift.endTime && shift.startTime ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime)) : 0)
    }, 0)},
    { name: "Night", hours: monthShifts.filter(s => s.type === "night").reduce((total, shift) => {
      return total + (shift.endTime && shift.startTime ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime)) : 0)
    }, 0)},
    { name: "Overtime", hours: monthShifts.filter(s => s.type === "overtime").reduce((total, shift) => {
      return total + (shift.endTime && shift.startTime ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime)) : 0)
    }, 0)},
  ].filter(item => item.hours > 0)

  // Generate colors for chart
  const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981"];

  return (
    // Fixed layout structure to eliminate whitespace at the top
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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
                  <PieChartIcon className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Statistics
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">{format(currentMonth, "MMMM yyyy")}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="container pb-2">
            <Tabs
              defaultValue="month"
              value={timeRange}
              onValueChange={(v) => setTimeRange(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="week" className="rounded-md">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="rounded-md">
                  Month
                </TabsTrigger>
                <TabsTrigger value="year" className="rounded-md">
                  Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Main Content - Fixed to eliminate whitespace */}
        <main className="flex-1 container overflow-y-auto pb-20 pt-6 md:px-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="bg-blue-500/10 p-1 rounded-md text-blue-500">📊</span>
                  Total Shifts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalShifts > 0 ? (
                  <div className="text-3xl font-bold">{totalShifts}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <PieChartIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p>No shift data available for this month</p>
                    <p className="text-sm">Add some shifts to see statistics</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {sickDays + vacationDays > 0 && `${sickDays} sick days, ${vacationDays} vacation days`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="bg-yellow-500/10 p-1 rounded-md text-yellow-500">☀️ / 🌙</span>
                  Day / Night Split
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayShifts + nightShifts > 0 ? (
                  <div className="text-3xl font-bold">
                    {dayShifts} <span className="text-sm font-normal text-muted-foreground">/</span> {nightShifts}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <PieChartIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p>No shift data available for this month</p>
                    <p className="text-sm">Add some shifts to see statistics</p>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                  <p className="text-xs text-muted-foreground">
                    {overtimeShifts} overtime shifts
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/40 dark:to-teal-950/40 border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="bg-green-500/10 p-1.5 rounded-full text-green-500">⏰</span>
                  Hours Worked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{totalHours}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {Math.round(totalHours / totalShifts || 0)} hours per shift avg.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-lg">Shift Distribution</CardTitle>
                <CardDescription>Breakdown of shift types</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {shiftTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shiftTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {shiftTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <PieChartIcon className="h-20 w-20 mb-4 opacity-10" />
                    <p className="text-center">No shift data available</p>
                    <p className="text-sm text-center">Add some shifts to generate charts</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-lg">Hours by Shift Type</CardTitle>
                <CardDescription>Total hours worked by shift type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {hoursData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hoursData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" name="Hours" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <PieChartIcon className="h-20 w-20 mb-4 opacity-10" />
                    <p className="text-center">No hours data available</p>
                    <p className="text-sm text-center">Add shifts with start/end times</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Earnings Section */}
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border border-green-100 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-green-500">💰</span>
                  Estimated Earnings
                </CardTitle>
                <CardDescription>Based on your shifts and estimated hourly rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Average Per Shift</div>
                    <div className="text-xl font-semibold">
                      ${(totalEarnings / totalShifts || 0).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Average Hourly</div>
                    <div className="text-xl font-semibold">
                      ${totalHours > 0 ? (totalEarnings / totalHours).toFixed(2) : "0.00"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
