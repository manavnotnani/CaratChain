"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import type { Diamond } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { DiamondIcon, Plus, Check, Clock, X } from "lucide-react"

type DiamondWithTokenizationRequest = Diamond & {
  tokenization_requests: {
    id: string
    status: "pending" | "approved" | "rejected"
    total_supply: number
    price_per_token: number
  }[]
}

export default function ListDiamonds() {
  const { data: session } = useSession()
  const [diamonds, setDiamonds] = useState<DiamondWithTokenizationRequest[]>([])
  const [newDiamond, setNewDiamond] = useState({
    name: "",
    carat: "",
    color: "",
    clarity: "",
    cut: "",
    certificate_number: "",
    total_supply: "",
    price_per_token: "",
  })

  useEffect(() => {
    fetchDiamonds()
  }, [])

  const fetchDiamonds = async () => {
    const { data, error } = await supabase
      .from("diamonds")
      .select(`
        *,
        tokenization_requests (
          id,
          status,
          total_supply,
          price_per_token
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching diamonds:", error)
      toast({
        title: "Error",
        description: "Failed to fetch diamonds. Please try again.",
        variant: "destructive",
      })
    } else {
      setDiamonds(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.supabaseUserId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    const { data: diamondData, error: diamondError } = await supabase
      .from("diamonds")
      .insert([
        {
          ...newDiamond,
          user_id: session.user.id,
          carat: Number.parseFloat(newDiamond.carat),
          total_supply: Number.parseInt(newDiamond.total_supply),
          price_per_token: Number.parseFloat(newDiamond.price_per_token),
        },
      ])
      .select()

    if (diamondError) {
      console.error("Error adding diamond:", diamondError)
      toast({
        title: "Error",
        description: "Failed to add diamond. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!diamondData || diamondData.length === 0) {
      console.error("No diamond data returned after insertion")
      toast({
        title: "Error",
        description: "Failed to add diamond. Please try again.",
        variant: "destructive",
      })
      return
    }

    const { error: tokenizationError } = await supabase.from("tokenization_requests").insert([
      {
        diamond_id: diamondData[0].id,
        total_supply: Number.parseInt(newDiamond.total_supply),
        price_per_token: Number.parseFloat(newDiamond.price_per_token),
        status: "pending",
      },
    ])

    if (tokenizationError) {
      console.error("Error adding tokenization request:", tokenizationError)
      toast({
        title: "Error",
        description: "Failed to submit tokenization request. Please try again.",
        variant: "destructive",
      })
      return
    }

    setNewDiamond({
      name: "",
      carat: "",
      color: "",
      clarity: "",
      cut: "",
      certificate_number: "",
      total_supply: "",
      price_per_token: "",
    })
    fetchDiamonds()
    toast({
      title: "Success",
      description: "Your diamond has been submitted for review.",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={16} />
      case "approved":
        return <Check className="text-green-500" size={16} />
      case "rejected":
        return <X className="text-red-500" size={16} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">List Diamonds</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Plus className="mr-2" size={24} />
              Add New Diamond
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Diamond Name</Label>
                  <Input
                    id="name"
                    value={newDiamond.name}
                    onChange={(e) => setNewDiamond({ ...newDiamond, name: e.target.value })}
                    placeholder="Diamond Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carat">Carat</Label>
                  <Input
                    id="carat"
                    type="number"
                    value={newDiamond.carat}
                    onChange={(e) => setNewDiamond({ ...newDiamond, carat: e.target.value })}
                    placeholder="Carat"
                    required
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={newDiamond.color}
                    onChange={(e) => setNewDiamond({ ...newDiamond, color: e.target.value })}
                    placeholder="Color"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clarity">Clarity</Label>
                  <Input
                    id="clarity"
                    value={newDiamond.clarity}
                    onChange={(e) => setNewDiamond({ ...newDiamond, clarity: e.target.value })}
                    placeholder="Clarity"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cut">Cut (optional)</Label>
                  <Input
                    id="cut"
                    value={newDiamond.cut}
                    onChange={(e) => setNewDiamond({ ...newDiamond, cut: e.target.value })}
                    placeholder="Cut"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate_number">Certificate Number (optional)</Label>
                  <Input
                    id="certificate_number"
                    value={newDiamond.certificate_number}
                    onChange={(e) => setNewDiamond({ ...newDiamond, certificate_number: e.target.value })}
                    placeholder="Certificate Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_supply">Total Supply</Label>
                  <Input
                    id="total_supply"
                    type="number"
                    value={newDiamond.total_supply}
                    onChange={(e) => setNewDiamond({ ...newDiamond, total_supply: e.target.value })}
                    placeholder="Total Supply"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_token">Price per Token (ETH)</Label>
                  <Input
                    id="price_per_token"
                    type="number"
                    value={newDiamond.price_per_token}
                    onChange={(e) => setNewDiamond({ ...newDiamond, price_per_token: e.target.value })}
                    placeholder="Price per Token"
                    required
                    step="0.000001"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Add Diamond
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <DiamondIcon className="mr-2" size={24} />
              Your Diamonds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {diamonds.map((diamond) => (
                <Card key={diamond.id} className="bg-white">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{diamond.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <span className="font-semibold">Carat:</span> {diamond.carat}
                      </p>
                      <p>
                        <span className="font-semibold">Color:</span> {diamond.color}
                      </p>
                      <p>
                        <span className="font-semibold">Clarity:</span> {diamond.clarity}
                      </p>
                      {diamond.cut && (
                        <p>
                          <span className="font-semibold">Cut:</span> {diamond.cut}
                        </p>
                      )}
                      {diamond.certificate_number && (
                        <p>
                          <span className="font-semibold">Certificate:</span> {diamond.certificate_number}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Total Supply:</span> {diamond.total_supply}
                      </p>
                      <p>
                        <span className="font-semibold">Price per Token:</span> {diamond.price_per_token} ETH
                      </p>
                      <p className="col-span-2 flex items-center">
                        <span className="font-semibold mr-2">Tokenization Status:</span>
                        {diamond.tokenization_requests && diamond.tokenization_requests.length > 0 ? (
                          <>
                            {getStatusIcon(diamond.tokenization_requests[0].status)}
                            <span className="ml-1 capitalize">{diamond.tokenization_requests[0].status}</span>
                          </>
                        ) : (
                          <span className="text-gray-500">Not requested</span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

