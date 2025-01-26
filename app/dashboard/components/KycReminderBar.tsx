"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function KycReminderBar() {
  const { data: session } = useSession()
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [kycType, setKycType] = useState<"kyc" | "kyb">("kyc")

  useEffect(() => {
    async function fetchKycStatus() {
      const userId = session?.user?.supabaseUserId
      if (userId) {
        const { data, error } = await supabase
          .from("kyc_kyb_status")
          .select("status, type")
          .eq("user_id", userId)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("Error fetching KYC status:", error)
        } else {
          setKycStatus(data?.status)
          setKycType(data?.type || "kyc")
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

  if (!session || session.user?.role === "admin" || kycStatus === "approved") {
    return null
  }

  return (
    <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-3">
      <div className="flex justify-between items-center">
        <p className="text-yellow-700">
          {
             kycStatus === "submitted"
              ? `Your ${kycType === "kyb" ? "KYB" : "KYC"} has been submitted and is awaiting review.`
              : `Please complete your ${kycType === "kyb" ? "KYB" : "KYC"} to fully access our platform.`}
        </p>
        { kycStatus !== "submitted" && (
          <Link
            href={kycType === "kyb" ? "/dashboard/kyb" : "/dashboard/kyc"}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Complete {kycType === "kyb" ? "KYB" : "KYC"}
          </Link>
        )}
      </div>
    </div>
  )
}

