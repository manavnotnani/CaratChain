"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import type { Diamond } from "@/lib/supabase"

export default function ListDiamonds() {
  const { data: session } = useSession()
  const [diamonds, setDiamonds] = useState<Diamond[]>([])
  const [newDiamond, setNewDiamond] = useState({
    name: "",
    carat: "",
    color: "",
    clarity: "",
    cut: "",
    certificate_number: "",
  })

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
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching diamonds:", error)
    } else {
      setDiamonds(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from("diamonds").insert([
      {
        ...newDiamond,
        user_id: session?.user?.id,
        carat: Number.parseFloat(newDiamond.carat),
      },
    ])

    if (error) {
      console.error("Error adding diamond:", error)
    } else {
      setNewDiamond({ name: "", carat: "", color: "", clarity: "", cut: "", certificate_number: "" })
      fetchDiamonds()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">List Diamonds</h1>
      <form onSubmit={handleSubmit} className="mb-4 space-y-4">
        <input
          type="text"
          value={newDiamond.name}
          onChange={(e) => setNewDiamond({ ...newDiamond, name: e.target.value })}
          placeholder="Diamond Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          value={newDiamond.carat}
          onChange={(e) => setNewDiamond({ ...newDiamond, carat: e.target.value })}
          placeholder="Carat"
          className="w-full p-2 border rounded"
          required
          step="0.01"
        />
        <input
          type="text"
          value={newDiamond.color}
          onChange={(e) => setNewDiamond({ ...newDiamond, color: e.target.value })}
          placeholder="Color"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={newDiamond.clarity}
          onChange={(e) => setNewDiamond({ ...newDiamond, clarity: e.target.value })}
          placeholder="Clarity"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={newDiamond.cut}
          onChange={(e) => setNewDiamond({ ...newDiamond, cut: e.target.value })}
          placeholder="Cut (optional)"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={newDiamond.certificate_number}
          onChange={(e) => setNewDiamond({ ...newDiamond, certificate_number: e.target.value })}
          placeholder="Certificate Number (optional)"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Diamond
        </button>
      </form>
      <ul className="space-y-4">
        {diamonds.map((diamond) => (
          <li key={diamond.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{diamond.name}</h3>
            <p>Carat: {diamond.carat}</p>
            <p>Color: {diamond.color}</p>
            <p>Clarity: {diamond.clarity}</p>
            {diamond.cut && <p>Cut: {diamond.cut}</p>}
            {diamond.certificate_number && <p>Certificate: {diamond.certificate_number}</p>}
            <p>Tokenized: {diamond.is_tokenized ? "Yes" : "No"}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

