import { ExportSchedule } from '@/components/export/export-schedule'
// Force Vercel deployment update
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Export Schedule | Schedio',
  description: 'Export your shift schedule as PDF or CSV',
}

export default function ExportPage() {
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Export Schedule</h1>
        <div className="max-w-xl mx-auto">
          <ExportSchedule />
        </div>
      </div>
    </ProtectedRoute>
  )
}
