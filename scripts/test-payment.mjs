/**
 * Standalone x402 Payment Test
 * Run this AFTER starting the server: npm run start:server
 * Then in a NEW terminal: node scripts/test-payment.mjs
 */
import { config } from 'dotenv';
config();

import { privateKeyToAccount } from 'viem/accounts';
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const SERVER_URL = 'http://localhost:4021';

async function main() {
  console.log('\n=== X402 PAYMENT TEST ===\n');

  // Step 1: Setup wallet
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ AGENT_PRIVATE_KEY not found in .env');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log('✅ Wallet loaded:', account.address);

  // Step 2: Create x402 client
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });
  console.log('✅ x402 client configured');

  // Step 3: Wrap fetch
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  console.log('✅ fetchWithPayment created');

  // Step 4: Get available products
  console.log('\n--- Fetching products ---');
  const productsResp = await fetch(`${SERVER_URL}/api/market/products`);
  const productsData = await productsResp.json();
  
  if (!productsData.products || productsData.products.length === 0) {
    console.error('❌ No products found');
    process.exit(1);
  }

  const product = productsData.products[productsData.products.length - 1]; // Cheapest one
  console.log(`✅ Found product: "${product.title}" ($${product.price})`);
  console.log(`   Product ID: ${product.id}`);

  // Step 5: Try to buy WITHOUT payment (should get 402)
  console.log('\n--- Testing 402 response ---');
  const buyUrl = `${SERVER_URL}/api/market/product/${product.id}/buy`;
  const rawResp = await fetch(buyUrl);
  console.log(`Raw fetch status: ${rawResp.status}`);
  
  if (rawResp.status === 402) {
    const paymentRequired = rawResp.headers.get('PAYMENT-REQUIRED');
    if (paymentRequired) {
      console.log('✅ Got 402 with PAYMENT-REQUIRED header');
      const decoded = JSON.parse(Buffer.from(paymentRequired, 'base64').toString('utf-8'));
      console.log('   Network:', decoded.accepts?.[0]?.network);
      console.log('   Price:', decoded.accepts?.[0]?.amount, 'atomic units');
      console.log('   PayTo:', decoded.accepts?.[0]?.payTo);
    } else {
      console.log('❌ Got 402 but no PAYMENT-REQUIRED header');
    }
  }

  // Step 6: Try to buy WITH x402 payment
  console.log('\n--- Testing x402 payment flow ---');
  console.log(`Calling: ${buyUrl}`);
  
  try {
    const paidResp = await fetchWithPayment(buyUrl);
    console.log(`\nResponse status: ${paidResp.status}`);
    
    // Check for payment response header
    const paymentResponse = paidResp.headers.get('PAYMENT-RESPONSE');
    if (paymentResponse) {
      console.log('✅ Got PAYMENT-RESPONSE header!');
      try {
        const decoded = JSON.parse(Buffer.from(paymentResponse, 'base64').toString('utf-8'));
        console.log('   Transaction:', decoded.transaction);
        console.log('   Payer:', decoded.payer);
        
        if (decoded.transaction && !decoded.transaction.startsWith('sim-')) {
          console.log(`\n🎉 REAL PAYMENT SUCCESSFUL!`);
          console.log(`   View on BaseScan: https://sepolia.basescan.org/tx/${decoded.transaction}`);
        }
      } catch (e) {
        console.log('   Raw:', paymentResponse);
      }
    }

    if (paidResp.status === 200) {
      const data = await paidResp.json();
      console.log('\n✅ PURCHASE SUCCESSFUL!');
      console.log('   Product:', data.title);
      console.log('   Content preview:', (data.content || '').slice(0, 100) + '...');
    } else if (paidResp.status === 402) {
      console.log('\n❌ Payment not verified - still got 402');
      
      // Check if there's an error in the PAYMENT-REQUIRED header
      const paymentRequired = paidResp.headers.get('PAYMENT-REQUIRED');
      if (paymentRequired) {
        try {
          const decoded = JSON.parse(Buffer.from(paymentRequired, 'base64').toString('utf-8'));
          if (decoded.error) {
            console.log('   Error:', decoded.error);
          }
        } catch {
          // ignore
        }
      }
      
      const body = await paidResp.text();
      console.log('   Body:', body.slice(0, 200));
    } else {
      console.log(`\n❌ Unexpected status: ${paidResp.status}`);
      const body = await paidResp.text();
      console.log('   Body:', body.slice(0, 200));
    }
  } catch (error) {
    console.error('\n❌ Error during payment:', error);
  }

  console.log('\n=== TEST COMPLETE ===\n');
}

main().catch(console.error);
