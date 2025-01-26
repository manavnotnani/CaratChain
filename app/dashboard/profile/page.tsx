"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAccount } from "wagmi"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConnectButton } from "@/app/components/ConnectButton"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { address, isConnected } = useAccount()
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (address) {
      setWalletAddress(address)
    }
  }, [address])

  useEffect(() => {
    if (session?.user?.supabaseUserId) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    if (!session?.user?.supabaseUserId) return

    const { data, error } = await supabase
      .from("users")
      .select("wallet_address")
      .eq("id", session.user.supabaseUserId)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)
    } else if (data) {
      setWalletAddress(data.wallet_address || "")
    }
  }

  const handleSaveWalletAddress = async () => {
    if (!session?.user?.supabaseUserId) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase
        .from("users")
        .update({ wallet_address: walletAddress })
        .eq("id", session.user.supabaseUserId)

      if (error) throw error

      setSuccess("Wallet address saved successfully!")
    } catch (error) {
      console.error("Error saving wallet address:", error)
      setError("Failed to save wallet address. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") return <div>Loading...</div>
  if (status === "unauthenticated") return <div>Please sign in to view this page.</div>

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Profile</h1>
      <div className="space-y-4">
        {!isConnected ? (
          <div>
            <p>Connect your wallet to view and update your wallet address.</p>
            <ConnectButton />
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <Button onClick={handleSaveWalletAddress} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Wallet Address"}
            </Button>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>
    </div>
  )
}

