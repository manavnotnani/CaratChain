"use client"

import { useState, useEffect } from "react"
import { useAccount, useChainId } from "wagmi"
import { ConnectButton } from "./ConnectButton"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, AlertTriangle, ArrowRight } from "lucide-react"

export function WalletConnectionBanner() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Wallet className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-sm opacity-90">Access all features by connecting your wallet</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chainId && chainId !== SUPPORTED_CHAINS.HOLESKY) {
    return (
      <Card className="bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold">Wrong Network</h3>
                <p className="text-sm opacity-90">Please switch to the Holesky testnet</p>
              </div>
            </div>
            <Button variant="secondary" className="text-yellow-400 hover:text-yellow-500">
              Switch Network
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

