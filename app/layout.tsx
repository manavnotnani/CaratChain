import "./globals.css"
import { Poppins } from "next/font/google"
import ContextProvider from "@/context"
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata = {
  title: "CaratChain - Tokenize Diamonds on the Blockchain",
  description: "Invest in fractional ownership of high-quality diamonds through blockchain technology.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <ContextProvider>
          {children}
          <Toaster />
        </ContextProvider>
      </body>
    </html>
  )
}

