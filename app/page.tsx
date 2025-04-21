"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { HomeScreen } from "@/components/home-screen"
import { useUserStore } from "@/store/user-store"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeScreen />
    </ProtectedRoute>
  )
}
