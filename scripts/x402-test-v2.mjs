/**
 * x402 Payment Test Script - v2 Protocol
 * Tests the complete payment flow using @x402/fetch
 */

import { x402Client, wrapFetchWithPayment, x402HTTPClient } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { encodePaymentSignatureHeader } from '@x402/core/http';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = 'http://localhost:4021';
// Will be set dynamically from the first available product
let PRODUCT_ID = '';

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('x402 v2 Payment Test - Complete Flow');
  console.log('='.repeat(70) + '\n');

  // Step 0: Setup wallet
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ AGENT_PRIVATE_KEY not found in .env');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`💰 Agent Wallet: ${account.address}`);

  // Create x402 client
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });
  console.log('✅ x402Client initialized with EVM scheme\n');

  // Step 1: Test product listing (no payment required)
  console.log('1️⃣ Fetching product list...');
  const listResp = await fetch(`${SERVER_URL}/api/market/products`);
  const listData = await listResp.json();
  console.log(`   Found ${listData.count} products`);
  
  // Use the first available product
  const product = listData.products?.[0];
  if (!product) {
    console.error('❌ No products available');
    process.exit(1);
  }
  PRODUCT_ID = product.id;
  console.log(`   Target: "${product.title}" @ $${product.price}\n`);

  // Step 2: Make request WITHOUT payment - should get 402
  const buyUrl = `${SERVER_URL}/api/market/product/${PRODUCT_ID}/buy`;
  console.log('2️⃣ Making request WITHOUT payment...');
  console.log(`   URL: ${buyUrl}`);
  
  const noPayResp = await fetch(buyUrl);
  console.log(`   Status: ${noPayResp.status}`);
  
  if (noPayResp.status !== 402) {
    console.error('❌ Expected 402 Payment Required');
    const text = await noPayResp.text();
    console.log(`   Response: ${text.slice(0, 200)}`);
    process.exit(1);
  }

  // Parse the 402 response
  const paymentRequiredHeader = noPayResp.headers.get('PAYMENT-REQUIRED');
  const bodyText = await noPayResp.text();
  
  console.log(`   PAYMENT-REQUIRED header: ${paymentRequiredHeader ? '✅ present' : '❌ missing'}`);
  
  let paymentRequired;
  
  if (paymentRequiredHeader) {
    // v2: Parse from header
    try {
      paymentRequired = JSON.parse(Buffer.from(paymentRequiredHeader, 'base64').toString('utf-8'));
      console.log('   ✅ Parsed PaymentRequired from header (v2 style)');
    } catch (e) {
      console.log(`   ⚠️ Failed to parse header: ${e.message}`);
    }
  }
  
  if (!paymentRequired && bodyText) {
    // v1: Parse from body
    try {
      paymentRequired = JSON.parse(bodyText);
      console.log('   ✅ Parsed PaymentRequired from body (v1 style)');
    } catch (e) {
      console.log(`   ⚠️ Failed to parse body: ${e.message}`);
    }
  }

  if (!paymentRequired) {
    console.error('❌ Could not get PaymentRequired from response');
    console.log(`   Headers:`, [...noPayResp.headers.entries()]);
    console.log(`   Body (first 500 chars): ${bodyText.slice(0, 500)}`);
    process.exit(1);
  }

  console.log('\n   PaymentRequired structure:');
  console.log(`     x402Version: ${paymentRequired.x402Version}`);
  console.log(`     accepts: ${JSON.stringify(paymentRequired.accepts?.[0] || paymentRequired.accepts, null, 2).split('\n').join('\n     ')}`);

  // Step 3: Create payment using x402Client
  console.log('\n3️⃣ Creating payment payload...');
  
  try {
    const paymentPayload = await client.createPaymentPayload(paymentRequired);
    console.log('   ✅ Payment payload created');
    console.log(`     x402Version: ${paymentPayload.x402Version}`);
    console.log(`     Has payload: ${!!paymentPayload.payload}`);
    console.log(`     Has signature: ${!!paymentPayload.payload?.authorization?.signature}`);
    
    // Encode the header using the official method
    const paymentHeader = encodePaymentSignatureHeader(paymentPayload);
    console.log(`   ✅ Encoded header (first 80 chars): ${paymentHeader.slice(0, 80)}...`);

    // Step 4: Retry WITH payment
    console.log('\n4️⃣ Retrying with PAYMENT-SIGNATURE header...');
    
    const paidResp = await fetch(buyUrl, {
      headers: {
        'PAYMENT-SIGNATURE': paymentHeader,
        'Access-Control-Expose-Headers': 'PAYMENT-RESPONSE,X-PAYMENT-RESPONSE',
      },
    });
    
    console.log(`   Status: ${paidResp.status}`);
    
    const paidBody = await paidResp.text();
    console.log(`   Response body (first 300 chars): ${paidBody.slice(0, 300)}`);
    
    // Check for payment response header
    const paymentRespHeader = paidResp.headers.get('PAYMENT-RESPONSE') || 
                              paidResp.headers.get('X-PAYMENT-RESPONSE');
    
    if (paymentRespHeader) {
      console.log('\n   🎉 PAYMENT-RESPONSE header received!');
      try {
        const decoded = JSON.parse(Buffer.from(paymentRespHeader, 'base64').toString('utf-8'));
        console.log(`   ✅ Transaction: ${decoded.transaction}`);
        console.log(`   ✅ Network: ${decoded.network}`);
        console.log(`   ✅ Payer: ${decoded.payer}`);
        console.log(`   🔗 https://sepolia.basescan.org/tx/${decoded.transaction}`);
      } catch (e) {
        console.log(`   Raw header: ${paymentRespHeader.slice(0, 100)}...`);
      }
    } else {
      console.log('\n   ⚠️ No PAYMENT-RESPONSE header');
      console.log(`   All response headers:`, [...paidResp.headers.entries()]);
    }

    if (paidResp.ok) {
      console.log('\n' + '='.repeat(70));
      console.log('✅✅✅ PAYMENT SUCCESSFUL! ✅✅✅');
      console.log('='.repeat(70));
    } else {
      console.log('\n❌ Payment request failed');
    }

  } catch (e) {
    console.error('\n❌ Error creating payment:', e.message);
    console.error(e.stack);
  }
}

// Step 5: Also test the automatic fetchWithPayment wrapper
async function testAutomaticPayment() {
  console.log('\n\n' + '='.repeat(70));
  console.log('x402 v2 - Automatic fetchWithPayment Test');
  console.log('='.repeat(70) + '\n');

  const privateKey = process.env.AGENT_PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });
  
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  
  const buyUrl = `${SERVER_URL}/api/market/product/${PRODUCT_ID}/buy`;
  console.log(`Making request to: ${buyUrl}`);
  console.log('Using automatic fetchWithPayment wrapper...\n');
  
  try {
    const response = await fetchWithPayment(buyUrl);
    
    console.log(`Status: ${response.status}`);
    
    const body = await response.text();
    console.log(`Response: ${body.slice(0, 300)}`);
    
    const paymentRespHeader = response.headers.get('PAYMENT-RESPONSE');
    if (paymentRespHeader) {
      console.log('\n🎉 AUTOMATIC PAYMENT WORKED!');
      const decoded = JSON.parse(Buffer.from(paymentRespHeader, 'base64').toString('utf-8'));
      console.log(`TX: ${decoded.transaction}`);
      console.log(`🔗 https://sepolia.basescan.org/tx/${decoded.transaction}`);
    }
  } catch (e) {
    console.error('❌ Automatic payment failed:', e.message);
    console.error(e.stack);
  }
}

// Run tests
main()
  .then(() => testAutomaticPayment())
  .catch(console.error);
