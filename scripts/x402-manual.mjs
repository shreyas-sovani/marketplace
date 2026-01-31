#!/usr/bin/env node
/**
 * Manual x402 Payment Flow - Step by step
 */

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

const { privateKeyToAccount } = await import('viem/accounts');
const { x402Client } = await import('@x402/fetch');
const { registerExactEvmScheme } = await import('@x402/evm/exact/client');

const SERVER_URL = 'http://localhost:4021';

async function main() {
  console.log('\n=== MANUAL X402 FLOW ===\n');

  const privateKey = process.env.AGENT_PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log('Wallet:', account.address);

  // Setup client
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });

  // Step 1: Get product
  const productsResp = await fetch(`${SERVER_URL}/api/market/products`);
  const productsData = await productsResp.json();
  const product = productsData.products[productsData.products.length - 1];
  console.log(`Product: "${product.title}" ($${product.price})`);

  const buyUrl = `${SERVER_URL}/api/market/product/${product.id}/buy`;

  // Step 2: Get 402 response
  console.log('\n--- Step 1: Get 402 ---');
  const resp402 = await fetch(buyUrl);
  console.log('Status:', resp402.status);
  
  const paymentRequiredHeader = resp402.headers.get('payment-required');
  if (!paymentRequiredHeader) {
    console.log('❌ No payment-required header');
    return;
  }
  
  const paymentRequired = JSON.parse(Buffer.from(paymentRequiredHeader, 'base64').toString('utf-8'));
  console.log('Payment Required:', JSON.stringify(paymentRequired, null, 2));

  // Step 3: Create payment payload using x402Client
  console.log('\n--- Step 2: Create Payment ---');
  try {
    const paymentPayload = await client.createPaymentPayload(paymentRequired);
    console.log('✅ Payment payload created!');
    console.log('Payload type:', typeof paymentPayload);
    console.log('Payload keys:', Object.keys(paymentPayload || {}));
    
    if (paymentPayload) {
      // Encode as base64 for header
      const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      console.log('Payment header (first 100 chars):', paymentHeader.slice(0, 100));

      // Step 4: Send with payment
      console.log('\n--- Step 3: Send with Payment ---');
      
      // Try different header names
      for (const headerName of ['X-PAYMENT', 'x-payment', 'PAYMENT-SIGNATURE']) {
        console.log(`\nTrying header: ${headerName}`);
        const paidResp = await fetch(buyUrl, {
          headers: {
            [headerName]: paymentHeader,
          },
        });
        
        console.log('Status:', paidResp.status);
        
        // Check response headers
        for (const [k, v] of paidResp.headers.entries()) {
          if (k.toLowerCase().includes('payment')) {
            console.log(`  ${k}:`, v.slice(0, 80));
          }
        }
        
        if (paidResp.status === 200) {
          const data = await paidResp.json();
          console.log('\n✅ SUCCESS with header:', headerName);
          console.log('TxHash:', data.txHash);
          if (data.txHash && !data.txHash.startsWith('sim-')) {
            console.log(`🔗 https://sepolia.basescan.org/tx/${data.txHash}`);
          }
          return;
        }
      }
    }
  } catch (err) {
    console.error('❌ Error creating payment:', err);
    console.error('Stack:', err.stack);
  }
}

main().catch(console.error);
