import { ethers } from 'ethers'

// Minimal ABI — only the functions we call
const WHITELIST_ABI = [
  'function addToWhitelist(address wallet) external',
  'function isWhitelisted(address wallet) external view returns (bool)',
  'function totalWhitelisted() external view returns (uint256)',
  'event Whitelisted(address indexed wallet, uint256 timestamp)',
]

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL)
  const signer   = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider)
  return new ethers.Contract(
    process.env.WHITELIST_CONTRACT_ADDRESS!,
    WHITELIST_ABI,
    signer
  )
}

export async function addToWhitelistContract(walletAddress: string): Promise<string> {
  const contract = getContract()
  const tx = await contract.addToWhitelist(walletAddress)
  const receipt = await tx.wait()
  return receipt.hash
}

export async function isWhitelistedOnChain(walletAddress: string): Promise<boolean> {
  const contract = getContract()
  return contract.isWhitelisted(walletAddress)
}

export async function totalWhitelisted(): Promise<number> {
  const contract = getContract()
  const total = await contract.totalWhitelisted()
  return Number(total)
}
