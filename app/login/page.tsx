"use client"

import { AuthForm } from '@/components/auth/auth-form'
import { Calendar, Bell, Download, CalendarClock, CalendarRange, CalendarCheck, CheckSquare } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col md:flex-row">
      {/* Left side - Branding and features */}
      <div className="hidden md:flex md:w-1/2 bg-primary p-8 text-white flex-col justify-center items-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <div className="bg-white p-3 rounded-full mr-4 flex items-center justify-center">
              <CalendarCheck className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Schedio</h1>
              <p className="text-sm text-white/80">Schedule with confidence</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-6">Smart Scheduling for Professionals</h2>
          <p className="text-lg mb-12">Designed for correctional officers to track shifts, manage schedules, and streamline payroll processes with ease.</p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Smart Scheduling</h3>
                <p>Track your shifts with ease and manage your work schedule efficiently</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Notifications</h3>
                <p>Get timely alerts for upcoming shifts and pay day reminders</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Export Options</h3>
                <p>Download your schedule as PDF or CSV for easy sharing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="bg-primary p-3 rounded-full mb-4 flex items-center justify-center">
              <CalendarCheck className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Schedio</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Schedule with confidence
            </p>
          </div>
          
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
