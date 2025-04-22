"use client"

import { useState, useEffect, useMemo } from "react"
import { format, startOfMonth, endOfMonth, subMonths, addMonths, differenceInHours } from "date-fns"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"
import { 
  ChevronLeft, 
  ChevronRight, 
  PieChartIcon, 
  Menu, 
  DollarSign, 
  Clock, 
  CalendarDays,
  TrendingUp,
  BarChart3,
  Calendar,
  Activity,
  FileBarChart,
  CloudSun,
  MoonStar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { useShiftStore } from "@/lib/store"
import { useSettingsStore } from "@/store/settings-store"
import { useUserStore } from "@/store/user-store"
import { TaxBreakdown } from "./tax-breakdown"
import { OvertimeCalculator } from "./overtime-calculator"
import { formatCurrency } from "@/lib/tax-calculator"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StatsPageEnhanced() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [activeTab, setActiveTab] = useState<"summary" | "earnings" | "taxes">("summary")
  const { shifts } = useShiftStore()
  const { user } = useUserStore()
  const { financialSettings } = useSettingsStore()

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

  // Calculate hours and pay
  const shiftHoursData = useMemo(() => {
    const hourlyRate = parseFloat(user.hourlyWage) || financialSettings.hourlyRate || 25
    const overtimeMultiplier = financialSettings.overtimeMultiplier || 1.5
    
    const regularHours = monthShifts
      .filter(s => s.type !== "overtime")
      .reduce((total, shift) => {
        return total + (shift.endTime && shift.startTime 
          ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
          : 0)
      }, 0)
    
    const overtimeHours = monthShifts
      .filter(s => s.type === "overtime")
      .reduce((total, shift) => {
        return total + (shift.endTime && shift.startTime 
          ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
          : 0)
      }, 0)
    
    const totalHours = regularHours + overtimeHours
    
    const regularPay = regularHours * hourlyRate
    const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier
    const totalPay = regularPay + overtimePay
    
    return {
      regularHours,
      overtimeHours,
      totalHours,
      regularPay,
      overtimePay,
      totalPay,
      hourlyRate
    }
  }, [monthShifts, user.hourlyWage, financialSettings.hourlyRate, financialSettings.overtimeMultiplier])

  // Generate modern color palette
  const COLORS = {
    primary: "#3b82f6",     // Blue
    secondary: "#8b5cf6",   // Purple
    success: "#10b981",     // Green
    warning: "#f59e0b",     // Orange
    danger: "#ef4444",      // Red
    info: "#06b6d4",        // Cyan
    day: "#0ea5e9",         // Sky blue
    night: "#6366f1",       // Indigo
    overtime: "#f97316",    // Orange
    sick: "#f43f5e",        // Rose
    vacation: "#14b8a6"     // Teal
  }

  // Data for pie chart
  const shiftTypeData = [
    { name: "Day", value: dayShifts, color: COLORS.day },
    { name: "Night", value: nightShifts, color: COLORS.night },
    { name: "Overtime", value: overtimeShifts, color: COLORS.overtime },
    { name: "Sick", value: sickDays, color: COLORS.sick },
    { name: "Vacation", value: vacationDays, color: COLORS.vacation },
  ].filter(item => item.value > 0)

  // Data for hours by shift type
  const hoursData = [
    { 
      name: "Regular", 
      hours: shiftHoursData.regularHours,
      color: COLORS.primary
    },
    { 
      name: "Overtime", 
      hours: shiftHoursData.overtimeHours,
      color: COLORS.warning
    }
  ].filter(item => item.hours > 0)
  
  // Data for historical earnings
  const monthlyEarningsData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(currentMonth, 5 - i)
    const monthShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date)
      return shiftDate.getMonth() === month.getMonth() && 
             shiftDate.getFullYear() === month.getFullYear()
    })
    
    const earnings = monthShifts.reduce((total, shift) => {
      const hours = shift.endTime && shift.startTime
        ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
        : 0
      
      const rate = shift.type === "overtime"
        ? shiftHoursData.hourlyRate * financialSettings.overtimeMultiplier
        : shiftHoursData.hourlyRate
      
      return total + (hours * rate)
    }, 0)
    
    return {
      name: format(month, "MMM"),
      earnings,
      date: format(month, "MMM yyyy")
    }
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
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
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Statistics
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium px-2 min-w-24 text-center">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Select
                value={timeRange}
                onValueChange={(value: "week" | "month" | "year") => setTimeRange(value)}
              >
                <SelectTrigger className="w-[110px] h-8">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs navigation */}
          <div className="container pb-1">
            <Tabs 
              defaultValue="summary" 
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "summary" | "earnings" | "taxes")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="summary" className="rounded-md">
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="earnings" className="rounded-md">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Earnings
                </TabsTrigger>
                <TabsTrigger value="taxes" className="rounded-md">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Tax & Finance
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container overflow-y-auto pb-20 pt-4 md:px-6">
          <Tabs value={activeTab} className="w-full">
            {/* SUMMARY TAB */}
            <TabsContent value="summary" className="mt-0">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border-0">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Shifts</p>
                      <p className="text-2xl font-bold">{totalShifts}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border-0">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                      <p className="text-2xl font-bold">{shiftHoursData.totalHours}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                      <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border-0">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Day / Night</p>
                      <p className="text-2xl font-bold">{dayShifts}/{nightShifts}</p>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                      <div className="flex">
                        <CloudSun className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        <MoonStar className="h-5 w-5 ml-[-10px] text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border-0">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Est. Earnings</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(shiftHoursData.totalPay)}
                      </p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Shift Distribution */}
                <Card className="shadow-lg bg-white dark:bg-gray-800 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Shift Distribution</CardTitle>
                    <CardDescription>Breakdown of shift types</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    {shiftTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={shiftTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {shiftTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} shifts`, 'Count']}
                          />
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

                {/* Hours by Type */}
                <Card className="shadow-lg bg-white dark:bg-gray-800 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Hours by Type</CardTitle>
                    <CardDescription>Regular vs. overtime hours</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    {hoursData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hoursData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${value} hours`, 'Hours']}
                          />
                          <Legend />
                          <Bar 
                            dataKey="hours" 
                            name="Hours" 
                            radius={[4, 4, 0, 0]}
                          >
                            {hoursData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Activity className="h-20 w-20 mb-4 opacity-10" />
                        <p className="text-center">No hours data available</p>
                        <p className="text-sm text-center">Add shifts with start/end times</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Monthly Earnings Trend */}
              <Card className="shadow-lg bg-white dark:bg-gray-800 border-0 mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Earnings Trend</CardTitle>
                  <CardDescription>6-month earnings history</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyEarningsData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value).replace('.00', '')
                        } 
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), "Earnings"]}
                        labelFormatter={(label) => monthlyEarningsData.find(item => item.name === label)?.date || label}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorEarnings)" 
                        name="Earnings"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* EARNINGS TAB */}
            <TabsContent value="earnings" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                {/* Overtime Calculator */}
                <OvertimeCalculator 
                  regularHours={shiftHoursData.regularHours} 
                  overtimeHours={shiftHoursData.overtimeHours} 
                />
                
                {/* Earnings by Shift Type */}
                <Card className="shadow-lg bg-white dark:bg-gray-800 border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
                    <CardDescription>Earnings by shift type</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Day",
                            earnings: monthShifts
                              .filter(s => s.type === "day")
                              .reduce((total, shift) => {
                                const hours = shift.endTime && shift.startTime
                                  ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
                                  : 0
                                return total + (hours * shiftHoursData.hourlyRate)
                              }, 0)
                          },
                          {
                            name: "Night",
                            earnings: monthShifts
                              .filter(s => s.type === "night")
                              .reduce((total, shift) => {
                                const hours = shift.endTime && shift.startTime
                                  ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
                                  : 0
                                return total + (hours * shiftHoursData.hourlyRate)
                              }, 0)
                          },
                          {
                            name: "Overtime",
                            earnings: monthShifts
                              .filter(s => s.type === "overtime")
                              .reduce((total, shift) => {
                                const hours = shift.endTime && shift.startTime
                                  ? differenceInHours(new Date(shift.endTime), new Date(shift.startTime))
                                  : 0
                                return total + (hours * shiftHoursData.hourlyRate * financialSettings.overtimeMultiplier)
                              }, 0)
                          }
                        ].filter(item => item.earnings > 0)}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis
                          tickFormatter={(value) => 
                            formatCurrency(value).replace('.00', '')
                          }
                        />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number), "Earnings"]}
                        />
                        <Legend />
                        <Bar 
                          dataKey="earnings" 
                          name="Earnings" 
                          fill="#8884d8" 
                          radius={[4, 4, 0, 0]}
                        >
                          <Cell fill={COLORS.day} />
                          <Cell fill={COLORS.night} />
                          <Cell fill={COLORS.overtime} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* TAXES TAB */}
            <TabsContent value="taxes" className="mt-0">
              {/* Tax Breakdown */}
              <div className="grid grid-cols-1 gap-6">
                <TaxBreakdown grossIncome={shiftHoursData.totalPay} />
              </div>
            </TabsContent>
          </Tabs>
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
