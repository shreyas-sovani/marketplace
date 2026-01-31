import { toClientEvmSigner, ExactEvmScheme } from '@x402/evm';
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

async function testX402Payment() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error('AGENT_PRIVATE_KEY not found');
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const signer = toClientEvmSigner(account);
  const client = new x402Client().register('eip155:84532', new ExactEvmScheme(signer));
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  
  console.log('[Test] Agent wallet:', account.address);
  
  // Get a product ID first
  const listResp = await fetch('http://localhost:4021/api/market/products');
  const listData = await listResp.json() as { products?: { id: string; title: string; price: number }[] };
  const product = listData.products?.[0];
  
  if (!product) {
    console.log('[Test] No products found!');
    return;
  }
  
  const url = `http://localhost:4021/api/market/product/${product.id}/buy`;
  console.log(`\n[Test] Testing URL: ${url}`);
  
  // First, test with regular fetch to see the raw response
  console.log('\n[Test] === Using regular fetch ===');
  const rawResponse = await fetch(url);
  console.log('[Test] Raw status:', rawResponse.status);
  console.log('[Test] Raw PAYMENT-REQUIRED header:', rawResponse.headers.get('PAYMENT-REQUIRED'));
  console.log('[Test] All headers:', JSON.stringify(Object.fromEntries(rawResponse.headers.entries()), null, 2));
  
  // Now test with fetchWithPayment
  console.log('\n[Test] === Using fetchWithPayment ===');
  try {
    const response = await fetchWithPayment(url);
    console.log('[Test] fetchWithPayment status:', response.status);
    console.log('[Test] fetchWithPayment headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (response.ok) {
      console.log('[Test] SUCCESS! Purchase completed!');
      const data = await response.json();
      console.log('[Test] Data:', JSON.stringify(data, null, 2));
    } else {
      console.log('[Test] Failed with status:', response.status);
    }
  } catch (error) {
    console.log('[Test] Error:', error);
  }
}

testX402Payment().catch(console.error);
