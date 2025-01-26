"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { ethers } from "ethers"
import { type Diamond, Token } from "@/lib/supabase"

// This is a placeholder ABI. You'll need to replace it with your actual smart contract ABI
const ABI = [
  "function tokenize(uint256 diamondId, uint256 totalSupply, uint256 pricePerToken) public",
  "function balanceOf(address account, uint256 id) public view returns (uint256)",
]

export default function Tokenize() {
  const { data: session } = useSession()
  const [diamonds, setDiamonds] = useState<Diamond[]>([])
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null)
  const [totalSupply, setTotalSupply] = useState("")
  const [pricePerToken, setPricePerToken] = useState("")

  useEffect(() => {
    if (session?.user?.id) {
      fetchDiamonds()
    }
  }, [session])

  const fetchDiamonds = async () => {
    const { data, error } = await supabase
      .from("diamonds")
      .select("*")
      .eq("user_id", session?.user?.id)
      .eq("is_tokenized", false)

    if (error) {
      console.error("Error fetching diamonds:", error)
    } else {
      setDiamonds(data)
    }
  }

  const handleTokenize = async () => {
    if (!selectedDiamond || !totalSupply || !pricePerToken) return

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()

      // Replace with your actual contract address
      const contractAddress = "0x..."
      const contract = new ethers.Contract(contractAddress, ABI, signer)

      const tx = await contract.tokenize(
        selectedDiamond.id,
        ethers.utils.parseEther(totalSupply),
        ethers.utils.parseEther(pricePerToken),
      )
      await tx.wait()

      // Update the diamond status in the database
      const { error: updateError } = await supabase
        .from("diamonds")
        .update({ is_tokenized: true })
        .eq("id", selectedDiamond.id)

      if (updateError) {
        console.error("Error updating diamond status:", updateError)
        return
      }

      // Create a new token entry
      const { error: insertError } = await supabase.from("tokens").insert({
        diamond_id: selectedDiamond.id,
        total_supply: Number.parseInt(totalSupply),
        price_per_token: Number.parseFloat(pricePerToken),
        contract_address: contractAddress,
      })

      if (insertError) {
        console.error("Error creating token entry:", insertError)
        return
      }

      fetchDiamonds()
      setSelectedDiamond(null)
      setTotalSupply("")
      setPricePerToken("")
    } catch (error) {
      console.error("Error tokenizing diamond:", error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tokenize Diamonds</h1>
      <div className="space-y-4">
        <select
          value={selectedDiamond?.id || ""}
          onChange={(e) => setSelectedDiamond(diamonds.find((d) => d.id === e.target.value) || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a diamond</option>
          {diamonds.map((diamond) => (
            <option key={diamond.id} value={diamond.id}>
              {diamond.name} - {diamond.carat} carats
            </option>
          ))}
        </select>
        <input
          type="number"
          value={totalSupply}
          onChange={(e) => setTotalSupply(e.target.value)}
          placeholder="Total Supply"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={pricePerToken}
          onChange={(e) => setPricePerToken(e.target.value)}
          placeholder="Price per Token (ETH)"
          className="w-full p-2 border rounded"
          step="0.000001"
        />
        <button
          onClick={handleTokenize}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Tokenize
        </button>
      </div>
    </div>
  )
}

