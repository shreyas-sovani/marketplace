#!/usr/bin/env node
/**
 * Standalone x402 Payment Test - No local imports
 * Run: node scripts/x402-test.mjs
 */

// Inline dotenv loading
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}

// Now import x402 packages
const { privateKeyToAccount } = await import('viem/accounts');
const { x402Client, wrapFetchWithPayment } = await import('@x402/fetch');
const { registerExactEvmScheme } = await import('@x402/evm/exact/client');

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
  const fetchWithPayment = wrapFetchWithPayment(globalThis.fetch, client);
  console.log('✅ fetchWithPayment created');

  // Step 4: Get available products
  console.log('\n--- Fetching products ---');
  const productsResp = await globalThis.fetch(`${SERVER_URL}/api/market/products`);
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
  const rawResp = await globalThis.fetch(buyUrl);
  console.log(`Raw fetch status: ${rawResp.status}`);
  
  if (rawResp.status === 402) {
    const paymentRequired = rawResp.headers.get('PAYMENT-REQUIRED');
    if (paymentRequired) {
      console.log('✅ Got 402 with PAYMENT-REQUIRED header');
      const decoded = JSON.parse(Buffer.from(paymentRequired, 'base64').toString('utf-8'));
      console.log('   Network:', decoded.accepts?.[0]?.network);
      console.log('   Amount:', decoded.accepts?.[0]?.amount, 'atomic units (', Number(decoded.accepts?.[0]?.amount) / 1e6, 'USDC)');
      console.log('   PayTo:', decoded.accepts?.[0]?.payTo);
    } else {
      console.log('❌ Got 402 but no PAYMENT-REQUIRED header');
    }
  }

  // Step 6: Try to buy WITH x402 payment
  console.log('\n--- Testing x402 payment flow ---');
  console.log(`Calling: ${buyUrl}`);
  
  // Manually intercept to see what's happening
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  globalThis.fetch = async (url, opts) => {
    requestCount++;
    console.log(`\n[Request ${requestCount}]`);
    console.log('  URL:', url.toString().slice(0, 80));
    if (opts?.headers) {
      const headers = opts.headers instanceof Headers ? Object.fromEntries(opts.headers.entries()) : opts.headers;
      for (const [k, v] of Object.entries(headers)) {
        if (k.toLowerCase().includes('payment')) {
          console.log(`  Header ${k}:`, typeof v === 'string' ? v.slice(0, 60) + '...' : v);
        }
      }
    }
    const resp = await originalFetch(url, opts);
    console.log(`[Response ${requestCount}] Status: ${resp.status}`);
    for (const [k, v] of resp.headers.entries()) {
      if (k.toLowerCase().includes('payment')) {
        console.log(`  Header ${k}:`, v.slice(0, 60) + '...');
      }
    }
    return resp;
  };
  
  try {
    const paidResp = await fetchWithPayment(buyUrl);
    console.log(`\nResponse status: ${paidResp.status}`);
    
    // Log all response headers
    console.log('Response headers:');
    for (const [key, value] of paidResp.headers.entries()) {
      if (key.toLowerCase().includes('payment')) {
        console.log(`   ${key}: ${value.slice(0, 50)}...`);
      }
    }
    
    // Check for payment response header
    const paymentResponse = paidResp.headers.get('PAYMENT-RESPONSE');
    if (paymentResponse) {
      console.log('\n✅ Got PAYMENT-RESPONSE header!');
      try {
        const decoded = JSON.parse(Buffer.from(paymentResponse, 'base64').toString('utf-8'));
        console.log('   Transaction:', decoded.transaction);
        console.log('   Payer:', decoded.payer);
        
        if (decoded.transaction && !decoded.transaction.startsWith('sim-')) {
          console.log(`\n🎉 REAL PAYMENT SUCCESSFUL!`);
          console.log(`   View on BaseScan: https://sepolia.basescan.org/tx/${decoded.transaction}`);
        }
      } catch (e) {
        console.log('   Raw:', paymentResponse.slice(0, 100));
      }
    }

    if (paidResp.status === 200) {
      const data = await paidResp.json();
      console.log('\n✅ PURCHASE SUCCESSFUL!');
      console.log('   Product:', data.title);
      console.log('   TxHash:', data.txHash);
      if (data.txHash && !data.txHash.startsWith('sim-')) {
        console.log(`\n🎉 View on BaseScan: https://sepolia.basescan.org/tx/${data.txHash}`);
      }
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
