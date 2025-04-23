"use client"

import { useState } from "react"
import { format, isSameDay } from "date-fns"
import { Check, Clock, X, Calendar, AlertCircle, Trash2, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShiftTypeIcon } from "@/components/shift-type-icon"
import { useShiftStore } from "@/store/shift-store"
import { AddShiftDialog } from "@/components/add-shift-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ShiftListProps {
  date: Date
}

export function ShiftList({ date }: ShiftListProps) {
  const { shifts, toggleCompleted, deleteShift } = useShiftStore()
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<number | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null)

  // Filter shifts for the selected date
  const filteredShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date)
    return isSameDay(shiftDate, date)
  })

  const handleEditShift = (id: number) => {
    setEditingShift(id)
    setIsAddShiftOpen(true)
  }

  const handleDeleteShift = (id: number) => {
    setShiftToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (shiftToDelete !== null) {
      deleteShift(shiftToDelete)
      setShiftToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  if (filteredShifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-6">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No shifts scheduled</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
          You don't have any shifts scheduled for this day. Tap the + button to add a new shift.
        </p>
        <Button variant="outline" className="gap-2" onClick={() => setIsAddShiftOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Shift
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredShifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
          >
            <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <ShiftTypeIcon type={shift.type} className="mr-3 h-5 w-5" />
              <div className="flex-1">
                <h3 className="font-medium capitalize flex items-center gap-2">
                  {shift.type} {shift.type !== "sick" && shift.type !== "vacation" && "Shift"}
                  {shift.completed ? (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    >
                      Completed
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                    >
                      Scheduled
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(shift.date), "EEEE, MMMM d")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500"
                  onClick={() => handleEditShift(shift.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  onClick={() => handleDeleteShift(shift.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleCompleted(shift.id)}
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    shift.completed
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                  )}
                >
                  {shift.completed ? (
                    <Check className="h-5 w-5" />
                  ) : shift.type === "sick" ? (
                    <X className="h-5 w-5 text-red-500" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4">
              {shift.startTime && shift.endTime ? (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>
              ) : null}

              {shift.location && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{shift.location}</span>
                </div>
              )}

              {shift.notes && (
                <div className="mt-3 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <span>{shift.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Shift Dialog */}
      <AddShiftDialog
        open={isAddShiftOpen}
        onOpenChange={setIsAddShiftOpen}
        selectedDate={date}
        editingShiftId={editingShift}
        onClose={() => setEditingShift(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this shift. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Plus({ className }: { className?: string }) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function MapPin({ className }: { className?: string }) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
