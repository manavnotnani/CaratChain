"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { ethers } from "ethers"
import type { Token } from "@/lib/supabase"

// This is a placeholder ABI. You'll need to replace it with your actual smart contract ABI
const ABI = [
  "function buyTokens(uint256 tokenId, uint256 amount) public payable",
  "function balanceOf(address account, uint256 id) public view returns (uint256)",
]

export default function BuyTokens() {
  const { data: session } = useSession()
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState("")

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("tokens")
      .select("*, diamonds(*)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tokenized diamonds:", error)
    } else {
      setTokens(data)
    }
  }

  const handleBuyTokens = async () => {
    if (!selectedToken || !amount) return

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()

      const contract = new ethers.Contract(selectedToken.contract_address, ABI, signer)

      const value = ethers.utils.parseEther((Number.parseFloat(amount) * selectedToken.price_per_token).toString())
      const tx = await contract.buyTokens(selectedToken.id, ethers.utils.parseEther(amount), { value })
      await tx.wait()

      // You might want to update the user's token balance in your database here

      setSelectedToken(null)
      setAmount("")
      alert("Tokens purchased successfully!")
    } catch (error) {
      console.error("Error buying tokens:", error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Buy Tokens</h1>
      <div className="space-y-4">
        <select
          value={selectedToken?.id || ""}
          onChange={(e) => setSelectedToken(tokens.find((t) => t.id === e.target.value) || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a tokenized diamond</option>
          {tokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token?.diamonds?.name} - {token.price_per_token} ETH per token
            </option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount of tokens"
          className="w-full p-2 border rounded"
          step="0.01"
        />
        <button
          onClick={handleBuyTokens}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Buy Tokens
        </button>
      </div>
    </div>
  )
}

