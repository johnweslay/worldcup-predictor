// Run with: npx hardhat run contracts/deploy.js --network mainnet
// (or --network sepolia for testnet)
//
// After deployment, copy the printed address to WHITELIST_CONTRACT_ADDRESS in .env.local

const { ethers } = require('hardhat')

async function main() {
  const MAX_SPOTS = 500   // adjust to your collection size

  console.log('Deploying WorldCupPredictorWhitelist...')
  const [deployer] = await ethers.getSigners()
  console.log('Deployer:', deployer.address)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('Balance:', ethers.formatEther(balance), 'ETH')

  const Factory = await ethers.getContractFactory('WorldCupPredictorWhitelist')
  const contract = await Factory.deploy(MAX_SPOTS)
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('\n✅ Contract deployed!')
  console.log('Address:', address)
  console.log('Max spots:', MAX_SPOTS)
  console.log('\nAdd to .env.local:')
  console.log(`WHITELIST_CONTRACT_ADDRESS=${address}`)
}

main().catch(err => { console.error(err); process.exit(1) })
