"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import { ethers } from "ethers"
import { modal } from "@/context"
import { useAccount, useSendTransaction } from "wagmi"
import tokenizationABI from "@/app/abi/tokenizationABI"
import { holesky } from "viem/chains"

type SubscriptionRequest = {
  id: string
  user_id: string
  diamond_id: string
  amount: number
  status: string
  created_at: string
  diamond: {
    name: string
    carat: number
    color: string
    clarity: string
    contract_diamond_id: string
  }
  user: {
    email: string
    wallet_address: string
  }
}

export default function AgentSubscriptionRequests() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<SubscriptionRequest[]>([])
  const [isWhitelisting, setIsWhitelisting] = useState(false)

  const { address, isConnected } = useAccount()
  const { chain } = useAccount()
  const { sendTransaction } = useSendTransaction()

  useEffect(() => {
    if (session?.user?.role === "agent" && address) {
      fetchSubscriptionRequests()
    }
  }, [session, address])

  const fetchSubscriptionRequests = async () => {
    if (!address) {
      console.log("No wallet address available");
      return;
    }
  
    console.log("Fetching subscription requests for address:", address);
  
    const { data, error } = await supabase
      .from("subscription_requests")
      .select(`
        *,
        diamond:diamonds (name, carat, color, clarity, contract_diamond_id, agent),
        user:users (email, wallet_address)
      `)
      .eq("diamond.agent", address)
      .order("created_at", { ascending: false });
  
    console.log("Raw Supabase response:", { data, error });
  
    if (error) {
      console.error("Error fetching subscription requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription requests. Please try again.",
        variant: "destructive",
      });
    } else if (!data || data.length === 0) {
      console.log("No subscription requests found for this agent");
      setRequests([]);
    } else {
      console.log("Subscription requests found:", data.length);
      const validRequests = data.filter(request => request.diamond !== null);
      console.log("Valid requests (with non-null diamond):", validRequests.length);
      setRequests(validRequests);
    }
  };

  const handleWhitelist = async (request: SubscriptionRequest) => {
    setIsWhitelisting(true)
    try {
      if (!isConnected) {
        await modal.open()
        throw new Error("Please connect your wallet")
      }

      if (chain?.id !== SUPPORTED_CHAINS.HOLESKY) {
        await modal.switchNetwork(holesky)
        throw new Error("Please switch to the Holesky network")
      }

      const contractAddress = process.env.NEXT_PUBLIC_TOKENIZATION_CONTRACT_ADDRESS
      if (!contractAddress) {
        throw new Error("Contract address not found")
      }

      const contract = new ethers.Contract(contractAddress, tokenizationABI)
      const whitelistData = contract.interface.encodeFunctionData("whitelistSubscription", [
        request.diamond.contract_diamond_id,
        request.user.wallet_address,
      ])

      const transactionRequest = {
        to: contractAddress,
        data: whitelistData,
      }

      sendTransaction(transactionRequest, {
        onSuccess: async (data) => {
          const hash = data
          console.log("Transaction hash:", hash)

          toast({
            title: "Transaction Sent",
            description: `Transaction hash: ${hash}`,
          })

          // Wait for the transaction to be mined
          const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
          await provider.waitForTransaction(hash)

          // Update the request status in the database
          const { error } = await supabase
            .from("subscription_requests")
            .update({ status: "approved" })
            .eq("id", request.id)

          if (error) {
            throw error
          }

          toast({
            title: "Success",
            description: "Subscription request whitelisted successfully.",
          })

          // Refresh the subscription requests
          fetchSubscriptionRequests()
        },
        onError: (error) => {
          console.error("Transaction error:", error)
          toast({
            title: "Error",
            description: "Failed to send transaction. Please try again.",
            variant: "destructive",
          })
        },
      })
    } catch (error) {
      console.error("Error whitelisting subscription:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to whitelist subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsWhitelisting(false)
    }
  }

  if (session?.user?.role !== "agent") {
    return <div>Access denied. You must be an agent to view this page.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Subscription Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Diamond</th>
              <th className="py-2 px-4 text-left">Investor</th>
              <th className="py-2 px-4 text-left">Amount</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t">
                <td className="py-2 px-4">
                  {request?.diamond?.name} - {request?.diamond?.carat} carats, {request?.diamond?.color},{" "}
                  {request?.diamond?.clarity}
                </td>
                <td className="py-2 px-4">{request.user.email}</td>
                <td className="py-2 px-4">{request.amount}</td>
                <td className="py-2 px-4">{request.status}</td>
                <td className="py-2 px-4">
                  {request.status === "pending" && (
                    <Button onClick={() => handleWhitelist(request)} disabled={isWhitelisting || !isConnected}>
                      {isWhitelisting ? "Whitelisting..." : "Whitelist"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

