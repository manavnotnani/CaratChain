"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"

export default function KycKybPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    idNumber: "",
    companyName: "",
    registrationNumber: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [kycType, setKycType] = useState<"kyc" | "kyb">("kyc")
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    async function fetchKycStatus() {
      if (session?.user?.supabaseUserId) {
        const { data, error } = await supabase
          .from("kyc_kyb_status")
          .select("status, type")
          .eq("user_id", session.user.supabaseUserId)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("Error fetching KYC/KYB status:", error)
        } else {
          setKycStatus(data?.status)
          setKycType(data?.type || "kyc")
        }
      }
    }

    fetchKycStatus()
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "loading") {
      setError("Session is still loading. Please wait...")
      return
    }
    if (status === "unauthenticated" || !session) {
      setError("You are not authenticated. Please log in again.")
      router.push("/login")
      return
    }
    if (!session.user?.supabaseUserId) {
      setError("User ID not found in session. Please log in again.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const { data: existingKyc, error: fetchError } = await supabase
        .from("kyc_kyb_status")
        .select("id")
        .eq("user_id", session.user.supabaseUserId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      const kycData = {
        user_id: session.user.supabaseUserId,
        status: "submitted",
        type: kycType,
        submitted_at: new Date().toISOString(),
        full_name: formData.fullName,
        address: formData.address,
        ...(kycType === "kyb"
          ? {
              company_name: formData.companyName,
              registration_number: formData.registrationNumber,
            }
          : {
              date_of_birth: formData.dateOfBirth || null,
              id_number: formData.idNumber,
            }),
      }

      let upsertError

      if (existingKyc) {
        const { error } = await supabase.from("kyc_kyb_status").update(kycData).eq("id", existingKyc.id)
        upsertError = error
      } else {
        const { error } = await supabase.from("kyc_kyb_status").insert([kycData])
        upsertError = error
      }

      if (upsertError) throw upsertError

      console.log(`${kycType.toUpperCase()} data submitted:`, formData)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push("/dashboard")
    } catch (error) {
      console.error(`Error submitting ${kycType.toUpperCase()}:`, error)
      setError(`An error occurred while submitting your ${kycType.toUpperCase()}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (kycStatus === "approved") {
    return (
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-5">{kycType === "kyb" ? "KYB" : "KYC"} Status</h1>
        <p className="text-green-600">
          Your {kycType === "kyb" ? "KYB" : "KYC"} has been approved. Thank you for completing the process.
        </p>
      </div>
    )
  }

  if ( kycStatus === "submitted") {
    return (
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-5">{kycType === "kyb" ? "KYB" : "KYC"} Status</h1>
        <p className="text-yellow-600">
          {kycStatus === "submitted"
            ? `Your ${kycType.toUpperCase()} is currently under review. We'll notify you once it's approved.`
            : `Your ${kycType.toUpperCase()} has been submitted and is awaiting review.`}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Complete Your {kycType === "kyb" ? "KYB" : "KYC"}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block mb-1">
            {kycType === "kyb" ? "Company Representative Full Name" : "Full Name"}
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {kycType === "kyc" && (
          <div>
            <label htmlFor="dateOfBirth" className="block mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        <div>
          <label htmlFor="address" className="block mb-1">
            {kycType === "kyb" ? "Company Address" : "Address"}
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {kycType === "kyc" ? (
          <div>
            <label htmlFor="idNumber" className="block mb-1">
              ID Number (e.g., Passport, Driver's License)
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="companyName" className="block mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="registrationNumber" className="block mb-1">
                Company Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={isSubmitting || status !== "authenticated"}
        >
          {isSubmitting ? "Submitting..." : `Submit ${kycType.toUpperCase()}`}
        </button>
      </form>
    </div>
  )
}

