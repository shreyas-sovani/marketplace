/**
 * Check wallet balances
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const AGENT_ADDRESS = '0xa2A7358dDFcf7B1738C08E4E2A910B2D9F018E39';
const SELLER_ADDRESS = '0xB9b4aEcFd092514fDAC6339edba6705287464409';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

async function checkBalance(address, label) {
  const usdcBalance = await client.readContract({
    address: USDC_ADDRESS,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
      },
    ],
    functionName: 'balanceOf',
    args: [address],
  });
  
  const ethBalance = await client.getBalance({ address });
  
  console.log(`\n${label} (${address}):`);
  console.log(`  USDC: ${formatUnits(usdcBalance, 6)} USDC`);
  console.log(`  ETH:  ${formatUnits(ethBalance, 18)} ETH`);
  
  return { usdc: Number(formatUnits(usdcBalance, 6)), eth: Number(formatUnits(ethBalance, 18)) };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Wallet Balance Check - Base Sepolia');
  console.log('='.repeat(60));
  
  const agent = await checkBalance(AGENT_ADDRESS, '🤖 Agent Wallet');
  const seller = await checkBalance(SELLER_ADDRESS, '💰 Seller Wallet');
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Agent has ${agent.usdc.toFixed(6)} USDC remaining`);
  console.log(`  Seller received payments (check BaseScan for full history)`);
  console.log('='.repeat(60));
}

main().catch(console.error);
