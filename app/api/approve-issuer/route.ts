import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const session = await getServerSession()

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { issuerId } = await request.json()

  const { error } = await supabase.from("users").update({ approved: true }).eq("id", issuerId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Issuer approved successfully" })
}

