import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { createConfig, http } from "wagmi"
import { holesky } from "wagmi/chains"
import { walletConnect } from "wagmi/connectors"

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error("Project ID is not defined")
}

// Add Holesky chain configuration
const holeskyChain = {
  ...holesky,
  rpcUrls: {
    default: {
      http: ["https://holesky.drpc.org"],
    },
    public: {
      http: ["https://holesky.drpc.org"],
    },
  },
}

export const config = createConfig({
  chains: [holeskyChain],
  transports: {
    [holeskyChain.id]: http(),
  },
  connectors: [ walletConnect({ projectId })],
})

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  ssr: false,
  networks: [holeskyChain],
})

