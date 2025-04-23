"use client"

import { useState, useEffect } from "react"
import { format, addWeeks, parseISO } from "date-fns"
import { CalendarIcon, Clock, MapPin, AlertCircle, DollarSign, FileText, Briefcase, Binary, CreditCard, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useShiftStore, type ShiftType } from "@/store/shift-store"
import { RecurringEvent, getNextOccurrence } from "@/lib/recurring-dates"

interface AddShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  editingShiftId?: number | null
  onClose?: () => void
}

export function AddShiftDialog({
  open,
  onOpenChange,
  selectedDate,
  editingShiftId = null,
  onClose,
}: AddShiftDialogProps) {
  const { shifts, addShift, updateShift, recurringEvents, addRecurringEvent } = useShiftStore()
  const [date, setDate] = useState<Date | undefined>(selectedDate)
  const [shiftType, setShiftType] = useState<ShiftType>("day")
  const [startTime, setStartTime] = useState<string>("07:00")
  const [endTime, setEndTime] = useState<string>("19:00")
  const [location, setLocation] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [notify, setNotify] = useState<boolean>(true)
  const [isEditing, setIsEditing] = useState(false)
  // Pay Day and Submit Pay Card features moved to sidebar/settings
  
  // Pay Day and Submit Pay Card features moved to sidebar/settings

  // Load shift data if editing
  useEffect(() => {
    if (editingShiftId !== null && open) {
      const shiftToEdit = shifts.find((s) => s.id === editingShiftId)
      if (shiftToEdit) {
        setIsEditing(true)
        setDate(new Date(shiftToEdit.date))
        setShiftType(shiftToEdit.type)
        setStartTime(shiftToEdit.startTime)
        setEndTime(shiftToEdit.endTime)
        setLocation(shiftToEdit.location)
        setNotes(shiftToEdit.notes)
        setNotify(shiftToEdit.notify ?? true)
      }
    } else {
      // Reset form when opening for a new shift
      if (open && !isEditing) {
        resetForm()
      }
    }
  }, [editingShiftId, open, shifts])

  // Reset form fields after dialog is closed
  useEffect(() => {
    if (!open) {
      setDate(selectedDate)
      setShiftType("day")
      setStartTime("07:00")
      setEndTime("19:00")
      setLocation("")
      setNotes("")
      setNotify(true)
      setIsEditing(false)
    }
  }, [open, selectedDate])

  const resetForm = () => {
    setDate(selectedDate)
    setShiftType("day")
    setStartTime("07:00")
    setEndTime("19:00")
    setLocation("")
    setNotes("")
    setNotify(true)
    setIsEditing(false)
  }

  const handleSubmit = () => {
    if (!date) return

    const shiftData = {
      type: shiftType,
      date: date!.toISOString(),
      startTime,
      endTime,
      location,
      notes,
      notify,
      completed: false,
    }

    if (isEditing && editingShiftId !== null) {
      updateShift(editingShiftId, shiftData)
    } else {
      addShift(shiftData)
    }
    
    // Pay Day and Submit Pay Card features moved to sidebar/settings

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
    if (onClose) onClose()
  }

  const handleDialogClose = (open: boolean) => {
    if (!open && onClose) {
      onClose()
    }
    onOpenChange(open)
  }

  const getShiftTypeColor = (type: ShiftType) => {
    switch (type) {
      case "day":
        return "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "night":
        return "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case "overtime":
        return "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
      case "sick":
        return "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      case "vacation":
        return "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
      case "meeting":
        return "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl">
        {/* Add DialogTitle as a direct child of DialogContent for accessibility */}
        <DialogTitle className="sr-only">
          {isEditing ? "Edit Shift" : "Add New Shift"}
        </DialogTitle>
        
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-2 rounded-lg">
              <Briefcase className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {isEditing ? "Edit Shift" : "Add New Shift"}
            </h2>
          </div>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? "Update shift details" : "Create a new shift in your schedule."}
          </DialogDescription>
        </DialogHeader>

        {/* Shift Type Selection */}
        <div className="px-6 pt-4 pb-2">
          <Label className="text-sm font-medium mb-2 block">Shift Type</Label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button
              type="button"
              variant={shiftType === "day" ? "default" : "outline"}
              onClick={() => setShiftType("day")}
              className={cn(
                "h-auto py-2 px-1 flex flex-col items-center gap-1 rounded-lg border transition-all",
                shiftType === "day" ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" : "hover:border-yellow-300 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10"
              )}
            >
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded-full">
                <span className="text-base">☀️</span>
              </div>
              <span className="text-sm">Day</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "night" ? "default" : "outline"}
              onClick={() => setShiftType("night")}
              className={cn(
                "h-auto py-2 px-1 flex flex-col items-center gap-1 rounded-lg border transition-all",
                shiftType === "night" ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
              )}
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                <span className="text-base">🌙</span>
              </div>
              <span className="text-sm">Night</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "overtime" ? "default" : "outline"}
              onClick={() => setShiftType("overtime")}
              className={cn(
                "h-auto py-2 px-1 flex flex-col items-center gap-1 rounded-lg border transition-all",
                shiftType === "overtime" ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" : "hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"
              )}
            >
              <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full">
                <span className="text-base">⏱️</span>
              </div>
              <span className="text-sm">Overtime</span>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Button
              type="button"
              variant={shiftType === "sick" ? "default" : "outline"}
              onClick={() => setShiftType("sick")}
              className={cn(
                "h-auto py-2 px-1 flex flex-col items-center gap-1 rounded-lg border transition-all",
                shiftType === "sick" ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/10"
              )}
            >
              <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded-full">
                <span className="text-base">🤒</span>
              </div>
              <span className="text-sm">Sick</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "vacation" ? "default" : "outline"}
              onClick={() => setShiftType("vacation")}
              className={cn(
                "h-auto py-2 px-1 flex flex-col items-center gap-1 rounded-lg border transition-all",
                shiftType === "vacation" ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-900/10"
              )}
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                <span className="text-base">🏖️</span>
              </div>
              <span className="text-sm">Vacation</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "meeting" ? "default" : "outline"}
              onClick={() => setShiftType("meeting")}
              className={cn(
                "h-auto py-2 px-1 flex flex-col items-center gap-1 rounded-lg border transition-all",
                shiftType === "meeting" ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" : "hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
              )}
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full">
                <span className="text-base">📋</span>
              </div>
              <span className="text-sm">Meeting</span>
            </Button>
          </div>
        </div>

        <div className="px-6 space-y-4 mt-1">
          {/* Date Picker */}
          <div className="grid gap-2">
            <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>Date</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !date && "text-muted-foreground",
                    "border-2 rounded-xl h-12 shadow-sm hover:shadow-md transition-shadow",
                    "bg-white dark:bg-gray-800"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                  {date ? format(date, "EEEE, MMMM do, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                  mode="single" 
                  selected={date} 
                  onSelect={setDate} 
                  initialFocus 
                  className="rounded-xl border-2 shadow-lg"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection (only for work shifts) */}
          {shiftType !== "sick" && shiftType !== "vacation" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Start Time</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 h-5 w-5 text-primary/70" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10 border-2 rounded-xl h-12 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>End Time</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 h-5 w-5 text-primary/70" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10 border-2 rounded-xl h-12 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="grid gap-2">
            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Location</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-primary/70" />
              <Input
                id="location"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 border-2 rounded-xl h-12 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>{shiftType === "sick" ? "Medical Notes" : "Notes"}</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-primary/70" />
              <Textarea
                id="notes"
                placeholder={shiftType === "sick" ? "e.g., Migraine, Flu" : "Any additional information"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pl-10 border-2 rounded-xl min-h-[100px] shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 p-2 rounded-lg bg-primary/5 border border-primary/10">
            <Switch 
              id="notify" 
              checked={notify} 
              onCheckedChange={setNotify} 
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
            />
            <Label htmlFor="notify" className="flex items-center gap-2 cursor-pointer text-sm">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span>Notify me before shift</span>
            </Label>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 mt-4 border-t border-gray-100 dark:border-gray-800 gap-3">
          <Button 
            variant="outline" 
            onClick={onClose || (() => onOpenChange(false))}
            className="rounded-lg h-10 border hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105 min-w-[100px]"
          >
            {isEditing ? "Update Shift" : "Save Shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
