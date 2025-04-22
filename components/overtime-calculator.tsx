"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettingsStore } from "@/store/settings-store"
import { useUserStore } from "@/store/user-store"
import { calculateOvertimePay, formatCurrency } from "@/lib/tax-calculator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoveUpRight, Timer, Clock, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface OvertimeCalculatorProps {
  regularHours: number
  overtimeHours: number
}

export function OvertimeCalculator({ regularHours, overtimeHours }: OvertimeCalculatorProps) {
  const { user } = useUserStore()
  const { financialSettings, updateFinancialSettings } = useSettingsStore()
  
  const [multiplier, setMultiplier] = useState<1.5 | 2>(financialSettings.overtimeMultiplier)
  const [hourlyRate, setHourlyRate] = useState<number>(parseFloat(user.hourlyWage) || financialSettings.hourlyRate)
  const [calculatedPay, setCalculatedPay] = useState(() => 
    calculateOvertimePay(regularHours, overtimeHours, hourlyRate, multiplier)
  )
  
  // Update calculation when inputs change
  useEffect(() => {
    setCalculatedPay(calculateOvertimePay(regularHours, overtimeHours, hourlyRate, multiplier))
    
    // Save multiplier preference
    updateFinancialSettings({
      overtimeMultiplier: multiplier
    })
  }, [regularHours, overtimeHours, hourlyRate, multiplier, updateFinancialSettings])
  
  // Use hourly wage from user profile when available
  useEffect(() => {
    if (user.hourlyWage) {
      const rate = parseFloat(user.hourlyWage)
      if (!isNaN(rate) && rate > 0) {
        setHourlyRate(rate)
      }
    }
  }, [user.hourlyWage])
  
  // Data for bar chart
  const payData = [
    { name: "Regular", pay: calculatedPay.regularPay, color: "#3b82f6" }, // Blue
    { name: "Overtime", pay: calculatedPay.overtimePay, color: "#f59e0b" }, // Orange
  ]
  
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 p-2 rounded-lg">
            <Timer className="h-5 w-5" />
          </div>
          Overtime Calculator
        </CardTitle>
        <CardDescription>
          Calculate earnings with Saskatchewan overtime options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overtime Multiplier Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Overtime Multiplier</h3>
          <RadioGroup
            value={multiplier.toString()}
            onValueChange={(value) => setMultiplier(Number(value) as 1.5 | 2)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1.5" id="r1" />
              <Label htmlFor="r1" className="cursor-pointer">Time and a Half (1.5x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="r2" />
              <Label htmlFor="r2" className="cursor-pointer">Double Time (2x)</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {regularHours + overtimeHours}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {regularHours} regular + {overtimeHours} overtime
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <DollarSign className="h-4 w-4" />
              <span>Hourly Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(hourlyRate)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Overtime rate: {formatCurrency(hourlyRate * multiplier)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MoveUpRight className="h-4 w-4" />
              <span>Total Pay</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(calculatedPay.totalPay)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Before tax deductions
            </div>
          </div>
        </div>
        
        {/* Pay Breakdown */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Pay Breakdown</h3>
          
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value).replace('.00', '')} 
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Pay"]}
                  />
                  <Legend />
                  <Bar dataKey="pay" name="Pay" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-md p-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Regular Hours Pay</span>
                    <span>{formatCurrency(calculatedPay.regularPay)}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {regularHours} hours × {formatCurrency(hourlyRate)}/hour
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-md p-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Overtime Pay ({multiplier}x)</span>
                    <span>{formatCurrency(calculatedPay.overtimePay)}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {overtimeHours} hours × {formatCurrency(hourlyRate * multiplier)}/hour
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/30 rounded-md p-4">
                  <div className="flex justify-between font-bold">
                    <span>Total Pay</span>
                    <span>{formatCurrency(calculatedPay.totalPay)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
        Saskatchewan overtime can be calculated at either 1.5x (time and a half) or 2x (double time) your regular rate.
      </CardFooter>
    </Card>
  )
}
