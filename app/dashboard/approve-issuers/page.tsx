import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"

async function getIssuers() {
  const { data, error } = await supabase.from("users").select("*").eq("role", "issuer").eq("approved", false)

  if (error) throw error
  return data
}

export default async function ApproveIssuers() {
  const session = await getServerSession()

  if (session?.user?.role !== "admin") {
    redirect("/dashboard")
  }

  const issuers = await getIssuers()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Approve Issuers</h1>
      <ul>
        {issuers.map((issuer) => (
          <li key={issuer.id} className="mb-4 p-4 bg-white shadow rounded-lg">
            <p>Email: {issuer.email}</p>
            <p>Company: {issuer.company_name}</p>
            <form action="/api/approve-issuer" method="POST">
              <input type="hidden" name="issuerId" value={issuer.id} />
              <button
                type="submit"
                className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Approve
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}

