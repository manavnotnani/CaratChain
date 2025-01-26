"use client"

import { useState, useEffect } from "react"
import { useAccount, useChainId } from "wagmi"
import { WalletConnectButton } from "./WalletConnectButton"
import { modal } from "@/context"
import { getNetworkName } from "@/lib/chains"
import { toast } from "@/hooks/use-toast"

export function ClientWalletConnectButton() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleClick = async () => {
    setIsLoading(true)
    try {
      if (isConnected) {
        await modal.disconnect()
        toast({
          title: "Disconnected",
          description: "Your wallet has been disconnected.",
        })
      } else {
        await modal.open()
      }
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection Error",
        description: "There was an error managing your wallet connection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <WalletConnectButton
      isConnected={isConnected}
      isLoading={isLoading}
      chainId={chainId}
      handleClick={handleClick}
      getNetworkName={getNetworkName}
    />
  )
}

