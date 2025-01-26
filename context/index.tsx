"use client"

import { wagmiAdapter, config, projectId } from "@/config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppKitOptions, createAppKit } from "@reown/appkit/react"
import { mainnet, polygon } from "@reown/appkit/networks"
import { holesky } from "wagmi/chains"
import React, { type ReactNode } from "react"
import { WagmiProvider } from "wagmi"
import { SessionProvider } from "next-auth/react"

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error("Project ID is not defined")
}

// Add Holesky network configuration for AppKit
const holeskyNetwork = {
  id: holesky.id,
  name: holesky.name,
  network: "holesky",
  nativeCurrency: holesky.nativeCurrency,
  rpcUrls: {
    default: {
      http: ["https://ethereum-holesky.publicnode.com"],
    },
    public: {
      http: ["https://ethereum-holesky.publicnode.com"],
    },
  },
}

const metadata = {
  name: "CaratChain",
  description: "Tokenize Diamonds on the Blockchain",
  url: "https://caratchain.com",
  icons: ["https://caratchain.com/logo.png"],
}

const appKitOptions: AppKitOptions = {
  adapters: [wagmiAdapter],
  projectId,
  networks: [holeskyNetwork],
  defaultNetwork: holeskyNetwork,
  metadata: metadata,
  themeMode: "light",
  enableInjected: false,
  enableEIP6963: true,
  allWallets: "HIDE",
}

export const modal = createAppKit(appKitOptions)

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider

