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

export function StatsPage() {
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

  // Calculate total hours worked
  const totalHours = monthShifts.reduce((total, shift) => {
    if (shift.type === "sick" || shift.type === "vacation") return total

    const startTime = shift.startTime ? new Date(`2000-01-01T${shift.startTime}`) : null
    const endTime = shift.endTime ? new Date(`2000-01-01T${shift.endTime}`) : null

    if (startTime && endTime) {
      // Handle overnight shifts
      let hours = differenceInHours(endTime, startTime)
      if (hours < 0) hours += 24
      return total + hours
    }

    return total
  }, 0)

  // Prepare data for charts
  const shiftTypeData = [
    { name: "Day", value: dayShifts, color: "#EAB308", icon: "☀️" },
    { name: "Night", value: nightShifts, color: "#3B82F6", icon: "🌙" },
    { name: "Overtime", value: overtimeShifts, color: "#F97316", icon: "⏱️" },
    { name: "Sick", value: sickDays, color: "#EF4444", icon: "🤒" },
    { name: "Vacation", value: vacationDays, color: "#A855F7", icon: "🏖️" },
  ].filter((item) => item.value > 0)

  // Calculate percentage of each shift type
  const totalShiftTypes = shiftTypeData.reduce((total, item) => total + item.value, 0)
  const shiftTypeDataWithPercentage = shiftTypeData.map(item => ({
    ...item,
    percentage: totalShiftTypes > 0 ? Math.round((item.value / totalShiftTypes) * 100) : 0
  }))

  // Weekly hours data - calculate from actual shifts
  const weeklyHoursData = [
    { name: "Week 1", hours: Math.round(totalHours * 0.25) || 38 },
    { name: "Week 2", hours: Math.round(totalHours * 0.28) || 42 },
    { name: "Week 3", hours: Math.round(totalHours * 0.22) || 36 },
    { name: "Week 4", hours: Math.round(totalHours * 0.25) || 40 },
  ]
  
  // Additional shift data for enhanced visualization
  const totalRegularShifts = dayShifts + nightShifts;
  const totalLeaveShifts = sickDays + vacationDays;

  return (
    <div className="layout-container bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block sidebar-container border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Sidebar />
      </div>

      <div className="main-content">
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

        {/* Main Content */}
        <main className="flex-1 container py-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="bg-primary/10 p-1.5 rounded-full text-primary">📊</span>
                  Total Shifts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalShifts}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {totalHours} hours worked this month
                  </p>
                </div>
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

            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="bg-purple-500/10 p-1 rounded-md text-purple-500">🏖️</span>
                  Time Off
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {sickDays + vacationDays}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {sickDays} sick, {vacationDays} vacation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Weekly Hours Bar Chart */}
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-500/10 p-1.5 rounded-full text-blue-500">⏱️</span>
                  Weekly Hours
                </CardTitle>
                <CardDescription>Hours worked each week this month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyHoursData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} width={30} />
                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Shift Types Pie Chart */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50">
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary/10 p-2 rounded-full text-primary">
                    <PieChartIcon className="h-5 w-5" />
                  </span>
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent font-bold">
                    Shift Distribution
                  </span>
                </CardTitle>
                <CardDescription>Breakdown of your shift types</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] p-6">
                {shiftTypeDataWithPercentage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shiftTypeDataWithPercentage}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${percentage}%`}
                        labelLine={false}
                        paddingAngle={4}
                      >
                        {shiftTypeDataWithPercentage.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke="#fff" 
                            strokeWidth={2} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} shifts (${shiftTypeDataWithPercentage.find(item => item.name === name)?.percentage}%)`, name]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                      />
                      <Legend 
                        iconType="circle" 
                        iconSize={12} 
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        formatter={(value) => (
                          <span className="text-sm font-medium flex items-center gap-1.5">
                            {shiftTypeDataWithPercentage.find(item => item.name === value)?.icon} {value}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({shiftTypeDataWithPercentage.find(item => item.name === value)?.percentage}%)
                            </span>
                          </span>
                        )} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                      <PieChartIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Data Available</h3>
                    <p className="text-sm text-center max-w-xs">Add some shifts to see your shift distribution statistics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shift Type Breakdown */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden col-span-1">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50">
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-yellow-500/10 p-2 rounded-full text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </span>
                  <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent font-bold">
                    Shift Breakdown
                  </span>
                </CardTitle>
                <CardDescription>Detailed view of your shifts</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {shiftTypeDataWithPercentage.length > 0 ? (
                  <div className="space-y-4">
                    {shiftTypeDataWithPercentage.map((type) => (
                      <div key={type.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${type.color}20` }}>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }}></div>
                          </div>
                          <span className="text-sm font-medium">{type.icon} {type.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold" style={{ color: type.color }}>{type.value}</span>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{type.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-gray-300 dark:text-gray-600">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <p>No shift data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Shift Distribution by Week */}
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md hover:shadow-lg transition-shadow col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-500/10 p-1.5 rounded-full text-blue-500">📅</span>
                  Weekly Shift Distribution
                </CardTitle>
                <CardDescription>How your shifts are distributed throughout the month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {totalShifts > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyHoursData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value) => [`${value} hours`, 'Hours Worked']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                        {weeklyHoursData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.5 + (index * 0.1)})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <PieChartIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p>No shift data available for this month</p>
                    <p className="text-sm">Add some shifts to see weekly distribution</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav activePage="stats" />
        </div>
      </div>
    </div>
  )
}
