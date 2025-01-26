"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import KycKybPage from "../kyc/page"

export default function KybPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login")
    return null
  }

  return <KycKybPage />
}

