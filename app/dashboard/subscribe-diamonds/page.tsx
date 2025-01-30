"use client"

import tokenizationABI from "@/app/abi/tokenizationABI"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { modal } from "@/context"
import { toast } from "@/hooks/use-toast"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import { supabase } from "@/lib/supabase"
import { holesky } from "@reown/appkit/networks"
import { ethers } from "ethers"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAccount, useSendTransaction } from "wagmi"

type TokenizedDiamond = {
  id: string
  contract_diamond_id: string
  name: string
  carat: number
  color: string
  clarity: string
  cut: string
  certificate_number: string
  total_supply: number
  price_per_token: number
}

export default function SubscribeDiamonds() {
  const { data: session } = useSession()
  const router = useRouter()
  const [diamonds, setDiamonds] = useState<TokenizedDiamond[]>([])
  const [subscriptionAmount, setSubscriptionAmount] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { address, isConnected } = useAccount()
  const { chain } = useAccount()
  const { sendTransaction } = useSendTransaction()

  useEffect(() => {
    if (session?.user?.role !== "investor") {
      router.push("/dashboard")
    } else {
      fetchTokenizedDiamonds()
    }
  }, [session, router])

  const fetchTokenizedDiamonds = async () => {
    const { data, error } = await supabase
      .from("diamonds")
      .select("*, contract_diamond_id")
      .eq("is_tokenized", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tokenized diamonds:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tokenized diamonds. Please try again.",
        variant: "destructive",
      })
    } else {
      setDiamonds(data)
    }
  }

  const handleSubscribe = async (diamondId: string) => {
    setIsSubmitting(true)
    try {
      if (!isConnected) {
        await modal.open()
        throw new Error("Please connect your wallet")
      }

      if (chain?.id !== SUPPORTED_CHAINS.HOLESKY) {
        await modal.switchNetwork(holesky)
        throw new Error("Please switch to the Holesky network")
      }

      const amount = Number.parseInt(subscriptionAmount[diamondId])
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid subscription amount")
      }

      const contractAddress = process.env.NEXT_PUBLIC_TOKENIZATION_CONTRACT_ADDRESS
      if (!contractAddress) {
        throw new Error("Contract address not found")
      }

      const diamond = diamonds.find((d) => d.id === diamondId)
      if (!diamond || !diamond.contract_diamond_id) {
        throw new Error("Invalid diamond or missing contract diamond ID")
      }

      const contract = new ethers.Contract(contractAddress, tokenizationABI)
      const subscribeToTokensData = contract.interface.encodeFunctionData("subscribeToTokens", [
        diamond.contract_diamond_id,
        amount,
      ])

      const transactionRequest = {
        to: contractAddress,
        data: subscribeToTokensData,
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

          // Add subscription request to the database
          const { error } = await supabase.from("subscription_requests").insert({
            user_id: session?.user?.supabaseUserId,
            diamond_id: diamondId,
            amount: amount,
            status: "pending",
          })

          if (error) {
            throw error
          }

          toast({
            title: "Success",
            description: "Subscription request submitted successfully.",
          })

          // Clear the subscription amount for this diamond
          setSubscriptionAmount((prev) => ({ ...prev, [diamondId]: "" }))
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
      console.error("Error subscribing to diamond:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (session?.user?.role !== "investor") {
    return null // This will prevent any flash of content before redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscribe to Tokenized Diamonds</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diamonds.map((diamond) => (
          <Card key={diamond.id}>
            <CardHeader>
              <CardTitle>{diamond.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contract Diamond ID: {diamond.contract_diamond_id || "Not assigned"}</p>
              <p>Carat: {diamond.carat}</p>
              <p>Color: {diamond.color}</p>
              <p>Clarity: {diamond.clarity}</p>
              <p>Cut: {diamond.cut}</p>
              <p>Certificate: {diamond.certificate_number}</p>
              <p>Total Supply: {diamond.total_supply}</p>
              <p>Price per Token: {diamond.price_per_token} ETH</p>
              <div className="mt-4">
                <Input
                  type="number"
                  placeholder="Enter subscription amount"
                  value={subscriptionAmount[diamond.id] || ""}
                  onChange={(e) => setSubscriptionAmount((prev) => ({ ...prev, [diamond.id]: e.target.value }))}
                  className="mb-2"
                />
                <Button
                  onClick={() => handleSubscribe(diamond.id)}
                  disabled={isSubmitting || !isConnected}
                  className="w-full"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

