"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

type TokenizationRequest = {
  id: string
  diamond_id: string
  total_supply: number
  price_per_token: number
  status: string
  diamond: {
    name: string
    carat: number
    color: string
    clarity: string
  }
}

export default function TokenizationRequests() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<TokenizationRequest[]>([])

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchTokenizationRequests()
    }
  }, [session])

  const fetchTokenizationRequests = async () => {
    const { data, error } = await supabase
      .from("tokenization_requests")
      .select(`
        *,
        diamond:diamonds (*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tokenization requests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tokenization requests. Please try again.",
        variant: "destructive",
      })
    } else {
      setRequests(data)
    }
  }

  const handleApprove = async (requestId: string) => {
    // Here you would implement the logic to approve the request and tokenize the diamond
    // This might involve interacting with a smart contract
    console.log("Approving request:", requestId)
    toast({
      title: "Success",
      description: "Tokenization request approved. Implement on-chain logic here.",
    })
  }

  if (session?.user?.role !== "admin") {
    return <div>Access denied. You must be an admin to view this page.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Tokenization Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Diamond</th>
              <th className="py-2 px-4 text-left">Total Supply</th>
              <th className="py-2 px-4 text-left">Price per Token</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t">
                <td className="py-2 px-4">
                  {request.diamond.name} - {request.diamond.carat} carats, {request.diamond.color},{" "}
                  {request.diamond.clarity}
                </td>
                <td className="py-2 px-4">{request.total_supply}</td>
                <td className="py-2 px-4">{request.price_per_token} ETH</td>
                <td className="py-2 px-4">{request.status}</td>
                <td className="py-2 px-4">
                  {request.status === "pending" && <Button onClick={() => handleApprove(request.id)}>Approve</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

