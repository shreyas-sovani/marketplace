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
  
  console.log(`\n[Test] Attempting to buy: "${product.title}" for $${product.price}`);
  const url = `http://localhost:4021/api/market/product/${product.id}/buy`;
  
  console.log('[Test] Making request with fetchWithPayment...');
  
  try {
    const response = await fetchWithPayment(url);
    
    console.log('[Test] Response status:', response.status);
    console.log('[Test] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (response.ok) {
      console.log('[Test] SUCCESS! Purchase completed!');
      const data = await response.json();
      console.log('[Test] Data:', JSON.stringify(data, null, 2));
      
      const paymentResponse = response.headers.get('PAYMENT-RESPONSE');
      if (paymentResponse) {
        const decoded = JSON.parse(Buffer.from(paymentResponse, 'base64').toString('utf-8'));
        console.log('[Test] Payment Response:', JSON.stringify(decoded, null, 2));
      }
    } else {
      console.log('[Test] Failed with status:', response.status);
      const errorBody = await response.text();
      console.log('[Test] Error body:', errorBody.slice(0, 500));
    }
  } catch (error) {
    console.log('[Test] Error:', error);
  }
}

testX402Payment().catch(console.error);
