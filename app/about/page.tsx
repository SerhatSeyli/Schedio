"use client"

import React from "react"
import { PageHeader } from "@/components/page-header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button" 
import { useRouter } from "next/navigation"
import { ChevronLeft, CalendarClock, ShieldCheck, Building2, Users, BarChart4, Clock, Mail, GitBranch } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const router = useRouter()
  
  return (
    <ProtectedRoute>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <PageHeader 
          title="About Schedio" 
          description="Smart scheduling solution for correctional officers" 
        />
        
        {/* Hero Section */}
        <div className="mt-6 mb-10 relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 p-8 flex flex-col md:flex-row items-center">
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold mb-4">Simplifying Shift Management</h2>
            <p className="text-lg">
              Built specifically for correctional facilities, Schedio transforms
              how officers manage schedules, trade shifts, and maintain work-life balance.
            </p>
            <div className="mt-6 flex space-x-3">
              <Button
                onClick={() => router.push('/calendar')}
                className="bg-primary hover:bg-primary/90"
              >
                <CalendarClock className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/stats')}
              >
                <BarChart4 className="h-4 w-4 mr-2" />
                View Stats
              </Button>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center mt-6 md:mt-0">
            <div className="w-32 h-32 md:w-40 md:h-40 relative bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl">
              <CalendarClock className="w-16 h-16 md:w-20 md:h-20 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-8 text-lg">
          <section className="bg-card rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-primary/10 mr-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            
            <p className="mb-4 leading-relaxed">
              Schedio was created with a clear purpose: to simplify and streamline shift management for correctional officers.
              We understand the critical nature of staffing in correctional facilities and the impact proper scheduling has on safety, 
              morale, and operational efficiency.
            </p>
            <p className="leading-relaxed">
              Our platform helps correctional officers efficiently set up, manage, and trade shifts, reducing administrative 
              burden while ensuring proper staffing levels are maintained at all times. With Schedio, scheduling becomes 
              simpler, more transparent, and adaptable to the dynamic needs of correctional facilities.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <Clock className="h-6 w-6 mb-2 text-primary" />
                <h3 className="text-base font-medium mb-2">Time Saving</h3>
                <p className="text-sm">Reduce administrative overhead with automated scheduling tools</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <Users className="h-6 w-6 mb-2 text-primary" />
                <h3 className="text-base font-medium mb-2">Staff Satisfaction</h3>
                <p className="text-sm">Improve work-life balance with transparent shift management</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <Building2 className="h-6 w-6 mb-2 text-primary" />
                <h3 className="text-base font-medium mb-2">Facility Security</h3>
                <p className="text-sm">Maintain proper staffing levels for safer facilities</p>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-primary/10 mr-4">
                <GitBranch className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Key Features</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <CalendarClock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-1">Interactive Calendar</h3>
                    <p className="text-sm text-muted-foreground">Intuitive drag-and-drop interface for shift planning with color-coded visualization</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-1">Shift Trading</h3>
                    <p className="text-sm text-muted-foreground">Simple process for officers to request and approve shift trades</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-1">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Real-time alerts for schedule changes and shift updates</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <BarChart4 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-1">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive reporting on staffing patterns, overtime, and scheduling efficiency</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-1">Overtime Management</h3>
                    <p className="text-sm text-muted-foreground">Track and manage overtime hours to optimize staffing costs</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-1">Secure & Compliant</h3>
                    <p className="text-sm text-muted-foreground">End-to-end security with role-based access control and data protection</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-primary/10 mr-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Our Story</h2>
            </div>
            
            <div className="md:flex md:space-x-8">
              <div className="md:w-2/3">
                <p className="mb-4 leading-relaxed">
                  Schedio was developed by Serhat Seyli after identifying a significant gap in the correctional facilities sector. 
                  Through extensive research and interviews with officers across multiple facilities, it became evident that 
                  existing scheduling solutions weren't addressing the unique operational challenges of correctional environments.
                </p>
                <p className="mb-4 leading-relaxed">
                  What began as a solution for a single facility has evolved into a comprehensive platform that serves 
                  correctional officers throughout the country. By focusing exclusively on the needs of correctional staff,
                  we've been able to create features specifically tailored to their workflow and operational requirements.
                </p>
                <p className="leading-relaxed">
                  The name "Schedio" originates from the Greek word meaning "to design or plan with intention" - reflecting our 
                  commitment to thoughtful, purposeful scheduling that improves working conditions for officers and enhances 
                  the safety and efficiency of correctional facilities.
                </p>
              </div>
              <div className="mt-6 md:mt-0 md:w-1/3 flex justify-center items-center">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-3">2023</p>
                    <p className="text-sm">Year Founded</p>
                  </div>
                  <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-3">24/7</p>
                    <p className="text-sm">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-primary/10 mr-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Contact Us</h2>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="mb-4 leading-relaxed">
                Have questions, suggestions, or need assistance? Our team is ready to help you make the most of Schedio.
                We value your feedback as it helps us continuously improve our platform for correctional officers.
              </p>
              <div className="flex flex-col sm:flex-row sm:space-x-8 mt-6">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-base font-medium mb-2">Email Us</h3>
                  <a href="mailto:schedioshift@gmail.com" className="text-primary hover:underline flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    schedioshift@gmail.com
                  </a>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-2">Support Hours</h3>
                  <p className="text-sm">Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                  <p className="text-sm">Weekend: 10:00 AM - 6:00 PM EST</p>
                </div>
              </div>
            </div>
          </section>

          <div className="text-center text-muted-foreground pt-8 pb-4 border-t border-gray-200 dark:border-gray-800">
            <p className="mb-2">© {new Date().getFullYear()} Schedio | Smart Scheduling for Correctional Officers</p>
            <p className="text-sm">Created and maintained by Serhat Seyli</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
