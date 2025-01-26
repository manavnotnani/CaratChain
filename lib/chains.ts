export const SUPPORTED_CHAINS = {
  HOLESKY: 17000,
  MAINNET: 1,
  POLYGON: 137,
}

export const getExplorerUrl = (chainId: number) => {
  switch (chainId) {
    case SUPPORTED_CHAINS.HOLESKY:
      return "https://holesky.etherscan.io"
    case SUPPORTED_CHAINS.MAINNET:
      return "https://etherscan.io"
    case SUPPORTED_CHAINS.POLYGON:
      return "https://polygonscan.com"
    default:
      return "https://holesky.etherscan.io"
  }
}

export const getNetworkName = (chainId: number) => {
  switch (chainId) {
    case SUPPORTED_CHAINS.HOLESKY:
      return "Holesky"
    case SUPPORTED_CHAINS.MAINNET:
      return "Ethereum"
    case SUPPORTED_CHAINS.POLYGON:
      return "Polygon"
    default:
      return "Unknown"
  }
}

