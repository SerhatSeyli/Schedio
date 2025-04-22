"use client"

import { Shield } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Schedio</h2>
        <p className="text-sm text-muted-foreground">Loading your shifts...</p>
      </div>
    </div>
  )
}
