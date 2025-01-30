import { ClientWalletConnectButton } from "@/app/components/ClientWalletConnectButton";
import { WalletConnectionBanner } from "@/app/components/WalletConnectionBanner";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KycReminderBar } from "./components/KycReminderBar";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  console.log("Full session object:", JSON.stringify(session, null, 2));

  let userRole = session?.user?.role;
  let userId = session?.user?.supabaseUserId;

  // If role or userId is missing, fetch it from the database
  if (!userRole || !userId) {
    const { data: userData, error } = await supabase
      .from("users")
      .select("role, id")
      .eq("email", session.user?.email)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      userRole = userData.role;
      userId = userData.id;
    }
  }

  console.log("User role:", userRole);
  console.log("User ID:", userId);

  const isCompany = userRole === "issuer";

  let kycKybStatus = null;
  if (userId) {
    const { data, error } = await supabase
      .from("kyc_kyb_status")
      .select("status, type")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching KYC/KYB status:", error);
    } else {
      kycKybStatus = data;
    }
  }

  console.log("KYC/KYB Status:", kycKybStatus);

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
        <aside className="w-64 bg-white shadow-md flex flex-col relative">
          <nav className="mt-5 flex-grow">
            <Link
              href="/dashboard"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
            >
              Profile
            </Link>
            {userRole === "admin" && (
              <>
                <Link
                  href="/dashboard/approve-issuers"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Approve Issuers
                </Link>

                <Link
                  href="/dashboard/admin/tokenization-requests"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Tokenization Requests
                </Link>
              </>
            )}
            {userRole === "issuer" && (
              <>
                <Link
                  href="/dashboard/list-diamonds"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  List Diamonds
                </Link>
              </>
            )}
            {userRole === "admin" && (
              <>
                <Link
                  href="/dashboard/tokenize"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Tokenize Diamonds
                </Link>
              </>
            )}
            {userRole === "investor" && (
              <>
                <Link
                  href="/dashboard/buy-tokens"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Buy Tokens
                </Link>
                <Link
                  href="/dashboard/subscribe-diamonds"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Subscribe Diamonds
                </Link>
              </>
            )}
            {(!kycKybStatus ||
              (kycKybStatus?.status !== "approved" &&
                kycKybStatus?.status !== "submitted")) &&
              userRole !== "admin" && (
                <Link
                  href={isCompany ? "/dashboard/kyb" : "/dashboard/kyc"}
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Complete {isCompany ? "KYB" : "KYC"}
                </Link>
              )}
          </nav>
          <div className="p-4 sticky bottom-0 bg-white border-t">
            <Button
              asChild
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              <Link href="/api/auth/signout">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Link>
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-10">{children}</main>
      </div>
    </div>
  );
}
