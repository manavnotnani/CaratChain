import { Core } from "@walletconnect/core"
import { AppKit } from "@reown/appkit"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set")
}

const core = new Core({
  projectId: projectId,
})

const metadata = {
  name: "CaratChain",
  description: "Tokenize Diamonds on the Blockchain",
  url: "https://caratchain.com", // Update this to your actual domain
  icons: ["https://caratchain.com/logo.png"], // Update this to your actual logo URL
}

export const initAppKit = async () => {
  return await AppKit.init({
    core,
    metadata,
  })
}

export { AppKit }

