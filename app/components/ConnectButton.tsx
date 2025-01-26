"use client"

import { useEffect, useState } from "react"
import { useAccount, useChainId } from "wagmi"
import { Button } from "@/components/ui/button"
import { modal } from "@/context"
import { getNetworkName } from "@/lib/chains"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function ConnectButton() {
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
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={isConnected ? "secondary" : "default"}
      className="min-w-[140px]"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isConnected ? (
        <>
          <span className="mr-2">{getNetworkName(chainId)}</span>
          Disconnect
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  )
}

