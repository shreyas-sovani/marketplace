/**
 * Check wallet USDC balance on Base Sepolia
 */
import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

// USDC on Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const AGENT_WALLET = '0xa2A7358dDFcf7B1738C08E4E2A910B2D9F018E39';
const SELLER_WALLET = '0xB9b4aEcFd092514fDAC6339edba6705287464409';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

async function checkBalances() {
  console.log('Checking wallet balances on Base Sepolia...\n');
  
  // ERC20 balanceOf ABI
  const erc20Abi = [{
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }] as const;
  
  // Check ETH balance
  const agentEth = await client.getBalance({ address: AGENT_WALLET as `0x${string}` });
  const sellerEth = await client.getBalance({ address: SELLER_WALLET as `0x${string}` });
  
  console.log(`Agent Wallet: ${AGENT_WALLET}`);
  console.log(`  ETH: ${formatUnits(agentEth, 18)} ETH`);
  
  // Check USDC balance
  try {
    const agentUsdc = await client.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [AGENT_WALLET as `0x${string}`],
    });
    console.log(`  USDC: ${formatUnits(agentUsdc, 6)} USDC`);
    
    if (agentUsdc === 0n) {
      console.log('\n⚠️  Agent wallet has 0 USDC!');
      console.log('   Get testnet USDC from: https://faucet.circle.com/');
      console.log('   Select "Base Sepolia" network');
    }
  } catch (e) {
    console.log(`  USDC: Error reading balance - ${e}`);
  }
  
  console.log(`\nSeller Wallet: ${SELLER_WALLET}`);
  console.log(`  ETH: ${formatUnits(sellerEth, 18)} ETH`);
  
  try {
    const sellerUsdc = await client.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [SELLER_WALLET as `0x${string}`],
    });
    console.log(`  USDC: ${formatUnits(sellerUsdc, 6)} USDC`);
  } catch (e) {
    console.log(`  USDC: Error reading balance - ${e}`);
  }
}

checkBalances().catch(console.error);
