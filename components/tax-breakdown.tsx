"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { calculateSaskatchewanTax, formatCurrency, formatPercentage } from "@/lib/tax-calculator"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"
import { InfoIcon, DollarSign, TrendingDown, TrendingUp } from "lucide-react"

interface TaxBreakdownProps {
  grossIncome: number
}

export function TaxBreakdown({ grossIncome }: TaxBreakdownProps) {
  const [taxInfo, setTaxInfo] = useState(() => calculateSaskatchewanTax(grossIncome))
  
  useEffect(() => {
    setTaxInfo(calculateSaskatchewanTax(grossIncome))
  }, [grossIncome])
  
  // Data for pie chart
  const deductionsData = [
    { name: "Federal Tax", value: taxInfo.federalTax, color: "#ef4444" },  // Red
    { name: "Provincial Tax", value: taxInfo.provincialTax, color: "#3b82f6" }, // Blue
    { name: "CPP", value: taxInfo.cpp, color: "#10b981" }, // Green
    { name: "EI", value: taxInfo.ei, color: "#f59e0b" }, // Yellow
    { name: "Net Income", value: taxInfo.netIncome, color: "#8b5cf6" } // Purple
  ]
  
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatPercentage((payload[0].value / grossIncome) * 100)} of gross
          </p>
        </div>
      )
    }
    return null
  }
  
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 p-2 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
          Saskatchewan Tax Breakdown
        </CardTitle>
        <CardDescription>
          Based on your hourly wage and hours worked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Gross Income</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(taxInfo.grossIncome)}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Net Income</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(taxInfo.netIncome)}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Deductions</div>
            <div className="text-2xl font-bold text-red-500 dark:text-red-400">{formatCurrency(taxInfo.totalDeductions)}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Effective Tax Rate</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPercentage(taxInfo.effectiveTaxRate)}</div>
          </div>
        </div>
        
        {/* Detailed Breakdown */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Detailed Breakdown</h3>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="w-3 h-3 inline-block rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm">Federal Tax</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(taxInfo.federalTax)} ({formatPercentage((taxInfo.federalTax / grossIncome) * 100)})</span>
            </div>
            <Progress value={(taxInfo.federalTax / grossIncome) * 100} className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-red-500" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="w-3 h-3 inline-block rounded-full bg-blue-500 mr-2"></span>
                <span className="text-sm">Provincial Tax (SK)</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(taxInfo.provincialTax)} ({formatPercentage((taxInfo.provincialTax / grossIncome) * 100)})</span>
            </div>
            <Progress value={(taxInfo.provincialTax / grossIncome) * 100} className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-blue-500" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="w-3 h-3 inline-block rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm">CPP Contribution</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(taxInfo.cpp)} ({formatPercentage((taxInfo.cpp / grossIncome) * 100)})</span>
            </div>
            <Progress value={(taxInfo.cpp / grossIncome) * 100} className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-green-500" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="w-3 h-3 inline-block rounded-full bg-yellow-500 mr-2"></span>
                <span className="text-sm">EI Contribution</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(taxInfo.ei)} ({formatPercentage((taxInfo.ei / grossIncome) * 100)})</span>
            </div>
            <Progress value={(taxInfo.ei / grossIncome) * 100} className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-yellow-500" />
          </div>
        </div>
        
        {/* Visualization */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deductionsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {deductionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip content={renderCustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Tax Brackets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Federal Tax Bracket</div>
            <div className="text-lg font-semibold">{taxInfo.taxBrackets.federal}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Provincial Tax Bracket</div>
            <div className="text-lg font-semibold">{taxInfo.taxBrackets.provincial}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <InfoIcon className="h-3 w-3" />
        Tax calculations are based on Saskatchewan, Canada 2025 tax rates. This is an estimate only.
      </CardFooter>
    </Card>
  )
}
