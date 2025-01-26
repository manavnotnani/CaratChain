"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("investor")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            company_name: companyName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Step 2: Insert user data into the custom users table
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: authData.user.email,
          role,
          full_name: fullName,
          company_name: companyName,
          is_approved: role === "investor", // Automatically approve investors
        })

        if (insertError) throw insertError

        // Step 3: Create KYC/KYB entry
        const { error: kycKybError } = await supabase.from("kyc_kyb_status").insert({
          user_id: authData.user.id,
          status: "pending",
          type: role === "issuer" ? "kyb" : "kyc",
        })

        if (kycKybError) {
          console.error("Error creating KYC/KYB entry:", kycKybError)
        }

        // Step 4: Sign out the user (since we don't want them automatically logged in after registration)
        await supabase.auth.signOut()

        router.push("/login")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An error occurred during registration. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 mb-4 border rounded">
          <option value="investor">Investor</option>
          <option value="issuer">Issuer</option>
          <option value="agent">Agent</option>
        </select>
        {role === "issuer" && (
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company Name"
            className="w-full p-2 mb-4 border rounded"
            required
          />
        )}
        <button type="submit" className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Register
        </button>
      </form>
    </div>
  )
}

