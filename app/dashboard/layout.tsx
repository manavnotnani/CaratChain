import { ClientWalletConnectButton } from "@/app/components/ClientWalletConnectButton"
import { WalletConnectionBanner } from "@/app/components/WalletConnectionBanner"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { KycReminderBar } from "./components/KycReminderBar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const isCompany = session?.user?.role === "issuer"

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <ClientWalletConnectButton />
        </div>
      </header>
      <KycReminderBar />
      <WalletConnectionBanner />
      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-md">
          <nav className="mt-5">
            <Link href="/dashboard" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Dashboard
            </Link>
            <Link href="/dashboard/profile" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Profile
            </Link>
            {session?.user?.role === "admin" && (
              <>
                <Link href="/dashboard/approve-issuers" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                  Approve Issuers
                </Link>
                <Link href="/dashboard/kyc-status" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                  KYC Status
                </Link>
              </>
            )}
            {session?.user?.role === "issuer" && (
              <>
                <Link href="/dashboard/list-diamonds" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                  List Diamonds
                </Link>
                <Link href="/dashboard/tokenize" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                  Tokenize Diamonds
                </Link>
              </>
            )}
            {session?.user?.role === "investor" && (
              <Link href="/dashboard/buy-tokens" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                Buy Tokens
              </Link>
            )}
            <Link
              href={isCompany ? "/dashboard/kyb" : "/dashboard/kyc"}
              className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
            >
              {isCompany ? "Complete KYB" : "Complete KYC"}
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-10">{children}</main>
      </div>
    </div>
  )
}

