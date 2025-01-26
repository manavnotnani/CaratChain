"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
  const { data: session } = useSession()
  const [kycStatus, setKycStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchKycStatus() {
      if (session?.user?.supabaseUserId) {
        const { data, error } = await supabase
          .from("kyc_kyb_status")
          .select("status")
          .eq("user_id", session.user.supabaseUserId)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("Error fetching KYC status:", error)
        } else {
          setKycStatus(data?.status)
        }
      }
    }

    fetchKycStatus()

    // Set up a real-time subscription to listen for changes
    const subscription = supabase
      .channel("kyc_status_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "kyc_kyb_status",
          filter: `user_id=eq.${session?.user?.supabaseUserId}`,
        },
        fetchKycStatus,
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [session])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome, {session?.user?.email}</h1>
      <p>Role: {session?.user?.role}</p>
      {kycStatus && <p>KYC Status: {kycStatus}</p>}
      {session?.user?.role !== "admin" && kycStatus !== "approved" && kycStatus !== "submitted" && (
        <p className="mt-4 text-yellow-600">
          {kycStatus === "submitted"
            ? "Your KYC is under review. We'll notify you once it's approved."
            : "Please complete your KYC to fully access our platform features."}
        </p>
      )}
    </div>
  )
}

