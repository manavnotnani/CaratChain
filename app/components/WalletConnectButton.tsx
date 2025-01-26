import { Button } from "@/components/ui/button"
import { ConnectButton } from "./ConnectButton"
import { Wallet, Power } from "lucide-react"
import { Loader2 } from "lucide-react" // Assuming Loader2 is also from lucide-react

export function WalletConnectButton({ isConnected, isLoading, chainId, handleClick, getNetworkName }) {
  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={isConnected ? "secondary" : "default"}
      className="min-w-[160px] h-10 px-4 py-2 rounded-full transition-all duration-200 ease-in-out hover:shadow-md border border-light-blue-500"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : isConnected ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="mr-1 text-sm font-medium">{getNetworkName(chainId)}</span>
          <Power className="h-4 w-4" />
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium">Connect Wallet</span>
        </div>
      )}
    </Button>
  )
}

