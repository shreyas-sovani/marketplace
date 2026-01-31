#!/usr/bin/env node
/**
 * Debug x402 Payment Flow
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

// Patch fetch BEFORE importing x402
const originalFetch = globalThis.fetch;
let requestCount = 0;
globalThis.fetch = async (url, opts) => {
  requestCount++;
  console.log(`\n📤 [Request ${requestCount}]`);
  console.log('   URL:', url.toString());
  if (opts?.headers) {
    const headers = opts.headers instanceof Headers ? Object.fromEntries(opts.headers.entries()) : opts.headers;
    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase().includes('payment') || k.toLowerCase() === 'x-payment') {
        const val = typeof v === 'string' ? v : JSON.stringify(v);
        console.log(`   ${k}:`, val.slice(0, 80) + (val.length > 80 ? '...' : ''));
      }
    }
  }
  const resp = await originalFetch(url, opts);
  console.log(`📥 [Response ${requestCount}] Status: ${resp.status}`);
  for (const [k, v] of resp.headers.entries()) {
    if (k.toLowerCase().includes('payment')) {
      console.log(`   ${k}:`, v.slice(0, 80) + (v.length > 80 ? '...' : ''));
    }
  }
  return resp;
};

// Now import x402 packages
const { privateKeyToAccount } = await import('viem/accounts');
const { x402Client, wrapFetchWithPayment } = await import('@x402/fetch');
const { registerExactEvmScheme } = await import('@x402/evm/exact/client');

const SERVER_URL = 'http://localhost:4021';

async function main() {
  console.log('\n=== X402 DEBUG TEST ===\n');

  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ AGENT_PRIVATE_KEY not found');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log('✅ Wallet:', account.address);

  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });
  console.log('✅ x402 client configured');

  // This will use our patched fetch
  const fetchWithPayment = wrapFetchWithPayment(globalThis.fetch, client);
  console.log('✅ fetchWithPayment ready (using patched fetch)');

  // Get a product
  console.log('\n--- Getting product ---');
  requestCount = 0; // Reset
  const productsResp = await originalFetch(`${SERVER_URL}/api/market/products`);
  const productsData = await productsResp.json();
  const product = productsData.products[productsData.products.length - 1];
  console.log(`Product: "${product.title}" ($${product.price}) ID: ${product.id}`);

  // Try x402 payment
  console.log('\n--- x402 Payment Flow ---');
  requestCount = 0;
  const buyUrl = `${SERVER_URL}/api/market/product/${product.id}/buy`;
  
  try {
    const resp = await fetchWithPayment(buyUrl);
    console.log(`\n🏁 Final status: ${resp.status}`);
    
    if (resp.status === 200) {
      const data = await resp.json();
      console.log('✅ SUCCESS! TxHash:', data.txHash);
      if (data.txHash && !data.txHash.startsWith('sim-')) {
        console.log(`🔗 https://sepolia.basescan.org/tx/${data.txHash}`);
      }
    } else {
      const body = await resp.text();
      console.log('❌ Failed:', body.slice(0, 150));
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main().catch(console.error);
