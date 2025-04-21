import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseInit } from "@/components/firebase-init"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Schedio | Smart Scheduling",
  description: "Professional scheduling solution for correctional officers",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <AuthRedirect />
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ThemeProvider>
          <Toaster />
          <FirebaseInit />
        </AuthProvider>
      </body>
    </html>
  )
}
