import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import dotenv from 'dotenv';

dotenv.config();

const NETWORK = 'eip155:84532' as const;
const PAYTO_ADDRESS = '0xB9b4aEcFd092514fDAC6339edba6705287464409';
const FACILITATOR_URL = 'https://x402.org/facilitator';

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const x402Server = new x402ResourceServer(facilitatorClient).register(NETWORK, new ExactEvmScheme());

// Test route config
const routeConfig: any = {
  "GET /api/market/product/9df92784-abf3-4b91-94cc-61c46a4f0a78/buy": {
    accepts: [{
      scheme: 'exact',
      network: NETWORK,
      price: "$0.05",
      payTo: PAYTO_ADDRESS,
    }],
    description: "Purchase: AIBhoomi Winning Strategy 2026",
  },
};

console.log('Route config:', JSON.stringify(routeConfig, null, 2));
console.log('\nTesting middleware route matching...');

// The paymentMiddleware function takes routes and server
// Let's see what happens when we call it
const middleware = paymentMiddleware(routeConfig, x402Server);
console.log('Middleware created successfully');
console.log('Middleware type:', typeof middleware);
