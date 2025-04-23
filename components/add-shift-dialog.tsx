"use client"

import { useState, useEffect } from "react"
import { format, addWeeks, parseISO } from "date-fns"
import { CalendarIcon, Clock, MapPin, AlertCircle, DollarSign, FileText, Briefcase, Plus, Thermometer, CircleDollarSign, PalmtreeIcon } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [overtimeRate, setOvertimeRate] = useState<string>("1.5")
  const [sicknessType, setSicknessType] = useState<string>("")
  
  // Pay Day and Submit Pay Card features moved to sidebar/settings

  // Load shift data if editing
  useEffect(() => {
    if (editingShiftId !== null) {
      const shift = shifts.find(s => s.id === editingShiftId)
      if (shift) {
        setShiftType(shift.type)
        setDate(typeof shift.date === 'string' ? new Date(shift.date) : shift.date)
        setStartTime(shift.startTime)
        setEndTime(shift.endTime)
        setLocation(shift.location || "")
        setNotes(shift.notes || "")
        setNotify(shift.notify ?? true)
        setIsEditing(true)
        
        // Set overtime rate if applicable
        if (shift.type === "overtime" && shift.notes) {
          const rateMatch = shift.notes.match(/rate: (\d\.\d)/)
          if (rateMatch && rateMatch[1]) {
            setOvertimeRate(rateMatch[1])
          }
        }
        
        // Set sickness type if applicable
        if (shift.type === "sick" && shift.notes) {
          setSicknessType(shift.notes)
        }
      }
    } else {
      // Reset for new shift
      setIsEditing(false)
      setDate(selectedDate)
      // Don't reset everything else to allow for quick repeated entries
    }
  }, [editingShiftId, shifts, selectedDate])

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

  const handleSubmit = () => {
    // Basic validation
    if (!date) {
      alert("Please select a date")
      return
    }

    if (["day", "night", "overtime", "meeting"].includes(shiftType) && (!startTime || !endTime)) {
      alert("Please set both start and end time")
      return
    }
    
    // Format notes based on shift type
    let formattedNotes = notes;
    
    // Add overtime rate to notes
    if (shiftType === "overtime") {
      formattedNotes = `${notes ? notes + "\n" : ""}(rate: ${overtimeRate})`;
    }
    
    // For sick time, use the sickness type
    if (shiftType === "sick" && sicknessType) {
      formattedNotes = sicknessType + (notes ? "\n" + notes : "");
    }

    // Create a formatted shift object
    const newShift = {
      id: isEditing && editingShiftId ? editingShiftId : Date.now(),
      type: shiftType,
      date: date!,
      startTime: shiftType === "sick" || shiftType === "vacation" ? "" : startTime,
      endTime: shiftType === "sick" || shiftType === "vacation" ? "" : endTime,
      location: shiftType === "sick" || shiftType === "vacation" ? "" : location,
      notes: formattedNotes,
      notify: notify,
      completed: false
    }

    // Add/update the shift in store
    if (isEditing && editingShiftId) {
      updateShift(editingShiftId, newShift)
    } else {
      addShift(newShift)
    }

    // Close the dialog
    if (onClose) {
      onClose()
    } else {
      onOpenChange(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open && onClose) {
      onClose()
    }
    onOpenChange(open)
  }

  const handleShiftTypeChange = (type: ShiftType) => {
    setShiftType(type)
    
    // Auto-set times for night shift
    if (type === "night") {
      setStartTime("19:00")
      setEndTime("07:00")
    } else if (type === "day" && startTime === "19:00" && endTime === "07:00") {
      // Reset to day shift default times if coming from night shift
      setStartTime("07:00")
      setEndTime("19:00")
    }
    
    // For sick or vacation, clear location since it's not needed
    if (type === "sick" || type === "vacation") {
      setLocation("")
    }
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
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl">
        {/* Add DialogTitle as a direct child of DialogContent for accessibility */}
        <DialogTitle className="sr-only">
          {isEditing ? "Edit Shift" : "Add New Shift"}
        </DialogTitle>
        
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-1.5 rounded-lg">
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {isEditing ? "Edit Shift" : "Add Shift"}
            </h2>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEditing ? "Update shift details" : "Add to your schedule"}
          </DialogDescription>
        </DialogHeader>

        {/* Shift Type Selection */}
        <div className="px-5 pt-3 pb-1">
          <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Shift Type</Label>
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            <Button
              type="button"
              variant={shiftType === "day" ? "default" : "outline"}
              onClick={() => handleShiftTypeChange("day")}
              className={cn(
                "h-auto py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg border transition-all text-xs",
                shiftType === "day" ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" : "hover:border-yellow-300 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10"
              )}
            >
              <span className="text-sm">☀️</span>
              <span className="text-xs">Day</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "night" ? "default" : "outline"}
              onClick={() => handleShiftTypeChange("night")}
              className={cn(
                "h-auto py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg border transition-all text-xs",
                shiftType === "night" ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
              )}
            >
              <span className="text-sm">🌙</span>
              <span className="text-xs">Night</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "overtime" ? "default" : "outline"}
              onClick={() => handleShiftTypeChange("overtime")}
              className={cn(
                "h-auto py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg border transition-all text-xs",
                shiftType === "overtime" ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" : "hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"
              )}
            >
              <span className="text-sm">⏱️</span>
              <span className="text-xs">OT</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "sick" ? "default" : "outline"}
              onClick={() => handleShiftTypeChange("sick")}
              className={cn(
                "h-auto py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg border transition-all text-xs",
                shiftType === "sick" ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/10"
              )}
            >
              <span className="text-sm">🤒</span>
              <span className="text-xs">Sick</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "vacation" ? "default" : "outline"}
              onClick={() => handleShiftTypeChange("vacation")}
              className={cn(
                "h-auto py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg border transition-all text-xs",
                shiftType === "vacation" ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-900/10"
              )}
            >
              <span className="text-sm">🏖️</span>
              <span className="text-xs">Vac</span>
            </Button>
            <Button
              type="button"
              variant={shiftType === "meeting" ? "default" : "outline"}
              onClick={() => handleShiftTypeChange("meeting")}
              className={cn(
                "h-auto py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg border transition-all text-xs",
                shiftType === "meeting" ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" : "hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
              )}
            >
              <span className="text-sm">📋</span>
              <span className="text-xs">Meet</span>
            </Button>
          </div>
        </div>

        <div className="px-5 space-y-3 mt-1 pb-2">
          {/* Date Picker */}
          <div className="grid gap-1.5">
            <Label htmlFor="date" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              <span>Date</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full text-sm",
                    !date && "text-muted-foreground",
                    "border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow",
                    "bg-white dark:bg-gray-800"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date ? format(date, "EEE, MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                  mode="single" 
                  selected={date} 
                  onSelect={setDate} 
                  initialFocus 
                  className="rounded-lg border shadow-md"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Shift-specific fields */}
          {(shiftType === "day" || shiftType === "night" || shiftType === "meeting") && (
            <>
              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="startTime" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Start Time</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-8 border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="endTime" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>End Time</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-8 border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="grid gap-1.5">
                <Label htmlFor="location" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Location</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-8 border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Overtime specific fields */}
          {shiftType === "overtime" && (
            <>
              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="startTime" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Start Time</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-8 border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="endTime" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>End Time</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-8 border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Overtime Rate */}
              <div className="grid gap-1.5">
                <Label htmlFor="overtimeRate" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
                  <span>Overtime Rate</span>
                </Label>
                <Select value={overtimeRate} onValueChange={setOvertimeRate}>
                  <SelectTrigger className="border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm">
                    <SelectValue placeholder="Select rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.5">x1.5 (Time and a half)</SelectItem>
                    <SelectItem value="2.0">x2.0 (Double time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="grid gap-1.5">
                <Label htmlFor="location" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Location</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-8 border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Sick time specific fields */}
          {shiftType === "sick" && (
            <>
              {/* Sickness Type */}
              <div className="grid gap-1.5">
                <Label htmlFor="sicknessType" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <Thermometer className="h-3.5 w-3.5 text-primary" />
                  <span>Sickness Type</span>
                </Label>
                <Select value={sicknessType} onValueChange={setSicknessType}>
                  <SelectTrigger className="border rounded-lg h-9 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Common Cold">Common Cold</SelectItem>
                    <SelectItem value="Flu">Flu</SelectItem>
                    <SelectItem value="Migraine">Migraine</SelectItem>
                    <SelectItem value="Fever">Fever</SelectItem>
                    <SelectItem value="Stomach Issues">Stomach Issues</SelectItem>
                    <SelectItem value="Medical Appointment">Medical Appointment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Vacation - only needs date field which is already shown above */}

          {/* Notes - not shown for vacation */}
          {shiftType !== "vacation" && (
            <div className="grid gap-1.5">
              <Label htmlFor="notes" className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Notes</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/70" />
                <Textarea
                  id="notes"
                  placeholder="Any additional information"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="pl-8 border rounded-lg min-h-[60px] shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 p-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <Switch 
              id="notify" 
              checked={notify} 
              onCheckedChange={setNotify} 
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
            />
            <Label htmlFor="notify" className="flex items-center gap-1.5 cursor-pointer text-xs">
              <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
              <span>Notify me before {shiftType}</span>
            </Label>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 gap-2">
          <Button 
            variant="outline" 
            onClick={onClose || (() => onOpenChange(false))}
            className="rounded-lg h-8 border hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all text-sm"
          >
            {isEditing ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
