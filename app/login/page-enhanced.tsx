"use client"

import { useState, useEffect } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { 
  Calendar, 
  Bell, 
  Download, 
  CalendarCheck, 
  ShieldCheck, 
  BarChart3,
  Clock,
  CalendarDays
} from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren", 
        staggerChildren: 0.1 
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const featureCardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }
  }

  if (!mounted) {
    return null // Avoids hydration mismatch
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex flex-col md:flex-row">
      {/* Left side - Branding and features */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-10 text-white flex-col justify-center items-center relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          <motion.div variants={itemVariants} className="flex items-center mb-12">
            <div className="bg-white p-3 rounded-full mr-5 flex items-center justify-center shadow-lg">
              <CalendarCheck className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Schedio</h1>
              <p className="text-sm text-white/90">Schedule with confidence</p>
            </div>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-2xl font-semibold mb-6">
            Smart Scheduling for Professionals
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg mb-12 leading-relaxed">
            Designed for correctional officers to track shifts, manage schedules, and streamline payroll processes with ease.
          </motion.p>
          
          <motion.div variants={containerVariants} className="space-y-6">
            <motion.div 
              variants={featureCardVariants}
              whileHover="hover"
              className="flex items-start bg-white/10 p-5 rounded-xl backdrop-blur-sm"
            >
              <div className="bg-white/20 p-2 rounded-full mr-4 flex-shrink-0">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Smart Scheduling</h3>
                <p className="text-white/80 mt-1">Track your shifts with ease and manage your work schedule efficiently</p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={featureCardVariants}
              whileHover="hover"
              className="flex items-start bg-white/10 p-5 rounded-xl backdrop-blur-sm"
            >
              <div className="bg-white/20 p-2 rounded-full mr-4 flex-shrink-0">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Statistics & Reports</h3>
                <p className="text-white/80 mt-1">Get detailed insights on your work hours, pay, and shift patterns</p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={featureCardVariants}
              whileHover="hover"
              className="flex items-start bg-white/10 p-5 rounded-xl backdrop-blur-sm"
            >
              <div className="bg-white/20 p-2 rounded-full mr-4 flex-shrink-0">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Export Options</h3>
                <p className="text-white/80 mt-1">Download your schedule as PDF or CSV for easy sharing</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Testimonial/Trust element */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 bg-white/10 p-6 rounded-xl backdrop-blur-sm max-w-md"
        >
          <p className="italic text-white/90 mb-4">
            "Schedio has transformed how our team manages shifts. The tax calculator and overtime features save us countless hours each month."
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <span className="font-semibold text-primary">JD</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-white/70">Shift Manager</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Right side - Auth form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16"
      >
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="md:hidden flex flex-col items-center mb-10"
          >
            <div className="bg-primary p-4 rounded-full mb-4 flex items-center justify-center shadow-lg">
              <CalendarCheck className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              Schedio
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Schedule with confidence
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white dark:bg-gray-800/60 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-muted-foreground mb-8">
                Please sign in to access your schedule and shift information
              </p>
              <AuthForm />
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
              <div className="flex items-center justify-center mt-4 space-x-4">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Secure login and data encryption</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
