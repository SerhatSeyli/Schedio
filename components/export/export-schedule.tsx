"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { useShiftStore } from '@/store/shift-store'
import { useToast } from '@/components/ui/use-toast'
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { CSVLink } from 'react-csv'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Loader2, FileText, Download, FileSpreadsheet } from 'lucide-react'

export function ExportSchedule() {
  const [exportType, setExportType] = useState<'pdf' | 'csv'>('pdf')
  const [dateRange, setDateRange] = useState<'all' | 'custom' | 'month'>('month')
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()))
  const [loading, setLoading] = useState(false)
  
  const { shifts } = useShiftStore()
  const { toast } = useToast()
  
  // Filter shifts based on date range
  const getFilteredShifts = () => {
    if (dateRange === 'all') {
      return shifts
    }
    
    // For custom or month range
    return shifts.filter(shift => {
      const shiftDate = shift.date instanceof Date 
        ? shift.date 
        : new Date(shift.date as string)
      
      return isWithinInterval(shiftDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate)
      })
    })
  }
  
  // Format shifts for CSV export
  const getCSVData = () => {
    const filteredShifts = getFilteredShifts()
    
    return filteredShifts.map(shift => ({
      Date: shift.date instanceof Date 
        ? format(shift.date, 'yyyy-MM-dd') 
        : format(new Date(shift.date as string), 'yyyy-MM-dd'),
      Type: shift.type,
      StartTime: shift.startTime,
      EndTime: shift.endTime,
      Location: shift.location,
      Notes: shift.notes,
      Completed: shift.completed ? 'Yes' : 'No'
    }))
  }
  
  // Generate PDF export
  const handlePDFExport = async () => {
    setLoading(true)
    
    try {
      const filteredShifts = getFilteredShifts()
      
      // Create a temporary div to render the shifts table
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '800px'
      
      // Create the table HTML
      tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="text-align: center; margin-bottom: 20px;">Schedio Schedule</h1>
          <p style="text-align: center; margin-bottom: 30px;">
            ${dateRange === 'all' 
              ? 'All Shifts' 
              : `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`}
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Date</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Type</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Time</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Location</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Notes</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredShifts.map(shift => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">
                    ${shift.date instanceof Date 
                      ? format(shift.date, 'MMM dd, yyyy') 
                      : format(new Date(shift.date as string), 'MMM dd, yyyy')}
                  </td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px; text-transform: capitalize;">
                    ${shift.type}
                  </td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">
                    ${shift.startTime && shift.endTime 
                      ? `${shift.startTime} - ${shift.endTime}` 
                      : 'All Day'}
                  </td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">
                    ${shift.location}
                  </td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">
                    ${shift.notes}
                  </td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">
                    ${shift.completed ? 'Completed' : 'Pending'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
      
      document.body.appendChild(tempDiv)
      
      // Use html2canvas to convert the table to an image
      const canvas = await html2canvas(tempDiv, { scale: 2 })
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      
      // Download PDF
      pdf.save(`schedio-schedule-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      
      // Clean up
      document.body.removeChild(tempDiv)
      
      toast({
        title: 'Export Successful',
        description: 'Your schedule has been exported as a PDF.',
      })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'There was an error exporting your schedule.',
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Handle date range changes
  const handleDateRangeChange = (value: string) => {
    setDateRange(value as 'all' | 'custom' | 'month')
    
    if (value === 'month') {
      setStartDate(startOfMonth(new Date()))
      setEndDate(endOfMonth(new Date()))
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Schedule</CardTitle>
        <CardDescription>
          Export your shift schedule as a PDF or CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={exportType} onValueChange={(value) => setExportType(value as 'pdf' | 'csv')}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Document</SelectItem>
              <SelectItem value="csv">CSV Spreadsheet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              <SelectItem value="month">Current Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker date={startDate} setDate={(date: Date | undefined) => date && setStartDate(date)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker date={endDate} setDate={(date: Date | undefined) => date && setEndDate(date)} />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {exportType === 'pdf' ? (
          <Button onClick={handlePDFExport} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Export as PDF
          </Button>
        ) : (
          <CSVLink
            data={getCSVData()}
            filename={`schedio-schedule-${format(new Date(), 'yyyy-MM-dd')}.csv`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </CSVLink>
        )}
      </CardFooter>
    </Card>
  )
}
