> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Welcome to x402

## Overview

x402 is a new open payment protocol developed by Coinbase that enables instant, automatic stablecoin payments directly over HTTP.

By reviving the [HTTP 402 Payment Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/402) status code, x402 lets services monetize APIs and digital content onchain, allowing clients, both human and machine, to programmatically pay for access without accounts, sessions, or complex authentication.

## Who is x402 for?

* **Sellers:** Service providers who want to monetize their APIs or content. x402 enables direct, programmatic payments from clients with minimal setup.
* **Buyers:** Human developers and AI agents seeking to access paid services without accounts or manual payment flows.

Both sellers and buyers interact directly through HTTP requests, with payment handled transparently through the protocol.

## Use cases

x402 enables a range of use cases, including:

* API services paid per request
* AI agents that autonomously pay for API access
* Paywalls for digital content
* Microservices and tooling monetized via microtransactions
* Proxy services that aggregate and resell API capabilities

## How it works

x402 uses a simple request-response flow with programmatic payments. For a detailed explanation, see [How x402 Works](/x402/core-concepts/how-it-works).

At a high level:

1. The buyer requests a resource from the server (e.g. an API call, see [client/server roles](/x402/core-concepts/client-server))
2. If payment is required, the server responds with a [402 Payment Required](/x402/core-concepts/http-402), including payment instructions in the `PAYMENT-REQUIRED` header
3. The buyer constructs and sends a payment payload via the `PAYMENT-SIGNATURE` header
4. The server verifies and settles the payment via the [facilitator](/x402/core-concepts/facilitator). If valid, the server returns the requested resource

## Key Features

x402 provides a modern payment layer designed for developers and AI agents:

* **CAIP-2 Network Identifiers**: Industry-standard chain identification (e.g., `eip155:8453` for Base)
* **Multi-Network Support**: Single client handles EVM and Solana networks
* **Extensions System**: Enable service discovery via [Bazaar](/x402/bazaar), authentication, and more
* **TypeScript & Go SDKs**: Production-ready client and server libraries

## Beyond legacy limitations

x402 is designed for a modern internet economy, solving key limitations of legacy systems:

* **Reduce fees and friction:** Direct onchain payments without intermediaries, high fees, or manual setup.
* **Micropayments & usage-based billing:** Charge per call or feature with simple, programmable pay-as-you-go flows.
* **Machine-to-machine transactions:** Let AI agents pay and access services autonomously with no keys or human input needed.

## Offload your infra

The x402 [Facilitator](/x402/core-concepts/facilitator) handles payment verification and settlement so that sellers don't need to maintain their own blockchain infrastructure.

The Coinbase Developer Platform (CDP) offers a Coinbase-hosted facilitator service that processes fee-free USDC payments on the Base network, offering a streamlined and predictable experience for both buyers and sellers.

Facilitators handle verification and settlement, so sellers do not need to maintain blockchain infrastructure.

CDP's x402 facilitator provides:

* Fee-free USDC payments on Base and Solana networks
* Fast, onchain settlement of transactions
* Simplified setup for sellers to start accepting payments

## Facilitator roadmap

CDP's x402 facilitator is designed as a facilitator on top of an open standard, which is not tied to any single provider. Over time, the facilitator will include:

* A discovery layer for buyers (human and agents) to find available services ([Bazaar](/x402/bazaar))
* Support for additional payment flows (e.g., pay for work done, credit based billing, etc.)
* Optional attestations for sellers to enforce KYC or geographic restrictions
* Support for additional assets and networks

The goal is to make programmatic commerce accessible, permissionless, and developer-friendly.

## What to read next

* [Quickstart for Sellers](/x402/quickstart-for-sellers): Get started with x402 by accepting payments from clients.
* [Quickstart for Buyers](/x402/quickstart-for-buyers): Get started with x402 by paying for services.
* [X402 with Embedded Wallets](/embedded-wallets/x402-payments): Enable your users to make x402 payments with embedded wallets.
* [Network Support](/x402/network-support): See available facilitators and supported networks.
* [How x402 Works](/x402/core-concepts/how-it-works): Understand the complete payment flow.
* [Join our community on Discord](https://discord.gg/cdp): Get help and stay up to date with the latest developments.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart for Buyers

<Info>
  Need help? Join the [x402 Discord](https://discord.gg/cdp) for the latest
  updates.
</Info>

This guide walks you through how to use **x402** to interact with services that require payment. By the end of this guide, you will be able to programmatically discover payment requirements, complete a payment, and access a paid resource.

The x402 helper packages for various languages greatly simplify your integration with x402. You'll be able to automatically detect payment challenges, authorize payments onchain, and retry requests with minimal code. The packages will automatically trigger the following flow:

1. Makes the initial request (if using Fetch) or intercepts the initial request (if using Axios)
2. If a 402 response is received, parses the payment requirements from the `PAYMENT-REQUIRED` header
3. Creates a payment payload using the configured x402Client and registered schemes
4. Retries the request with the `PAYMENT-SIGNATURE` header

## Prerequisites

Before you begin, ensure you have:

* A crypto wallet with USDC (any EVM-compatible wallet, e.g., [CDP Wallet](/server-wallets/v2/introduction/quickstart), [AgentKit](/agent-kit/welcome))
* [Node.js](https://nodejs.org/en) and npm, or [Go](https://go.dev/) installed
* A service that requires payment via x402

<Note>
  **Python SDK Status**: The Python SDK is currently under development for x402
  v2. For immediate v2 support, use TypeScript or Go.
</Note>

<Info>
  We have pre-configured [examples available in our
  repo](https://github.com/coinbase/x402/tree/main/examples), including examples
  for fetch, Axios, and MCP.
</Info>

## 1. Install Dependencies

<Tabs>
  <Tab title="Node.js">
    Install the x402 client packages:

    ```bash  theme={null}
    # For fetch-based clients
    npm install @x402/fetch @x402/evm

    # For axios-based clients
    npm install @x402/axios @x402/evm

    # For Solana support, also add:
    npm install @x402/svm

    # For Bazaar discovery (optional):
    npm install @x402/core @x402/extensions
    ```
  </Tab>

  <Tab title="Go">
    Add the x402 Go module to your project:

    ```bash  theme={null}
    go get github.com/coinbase/x402/go
    ```
  </Tab>
</Tabs>

## 2. Create a Wallet Client

Create a wallet client using CDP's [Server Wallet](/server-wallets/v2/introduction/quickstart) (recommended) or a standalone wallet library ([viem](https://viem.sh/) for EVM on Node.js, or Go's crypto libraries).

<Tip>
  **Building with Embedded Wallets?** If you're building a user-facing
  application with embedded wallets, check out the [X402 with Embedded
  Wallets](/embedded-wallets/x402-payments) guide which shows how to use the
  `useX402` hook for seamless payment integration.
</Tip>

### CDP Server Wallet (Recommended)

First, create an account at [cdp.coinbase.com](https://cdp.coinbase.com/) and get the following API keys from the portal to store as environment variables:

```bash  theme={null}
# store in .env or using the command `export <name>="secret-info"`
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret
```

Then, install the required packages:

```bash Node.js theme={null}
npm install @coinbase/cdp-sdk dotenv
```

Finally, instantiate the CDP client as suggested by the [Server Wallet Quickstart](/server-wallets/v2/introduction/quickstart):

```typescript Node.js theme={null}
import { CdpClient } from "@coinbase/cdp-sdk";
import { toAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const cdp = new CdpClient();
const cdpAccount = await cdp.evm.createAccount();
const signer = toAccount(cdpAccount);
```

### Standalone Wallet Libraries

If you prefer to use your own wallet, you can use standalone libraries:

#### EVM (Node.js with viem)

```bash  theme={null}
npm install viem
```

```typescript  theme={null}
import { privateKeyToAccount } from "viem/accounts";

// Create a signer from private key (use environment variable)
const signer = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`,
);
```

#### EVM (Go)

```go  theme={null}
import (
    "crypto/ecdsa"
    "github.com/ethereum/go-ethereum/crypto"
)

// Load private key from environment
privateKey, _ := crypto.HexToECDSA(os.Getenv("EVM_PRIVATE_KEY"))
```

#### Solana (SVM)

Use [SolanaKit](https://www.solanakit.com/) to instantiate a signer:

```typescript  theme={null}
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

// 64-byte base58 secret key (private + public)
const svmSigner = await createKeyPairSignerFromBytes(
  base58.decode(process.env.SOLANA_PRIVATE_KEY!),
);
```

## 3. Make Paid Requests Automatically

You can automatically handle 402 Payment Required responses and complete payment flows using the x402 helper packages.

<Tabs>
  <Tab title="Node.js">
    You can use either `@x402/fetch` or `@x402/axios`:

    <Tabs>
      <Tab title="@x402/fetch">
        **@x402/fetch** extends the native `fetch` API to handle 402 responses and payment headers for you. [Full example here](https://github.com/coinbase/x402/tree/main/examples/typescript/clients/fetch)

        ```typescript  theme={null}
        import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
        import { registerExactEvmScheme } from "@x402/evm/exact/client";
        import { privateKeyToAccount } from "viem/accounts";

        // Create signer
        const signer = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);

        // Create x402 client and register schemes
        const client = new x402Client();
        registerExactEvmScheme(client, { signer });

        // Wrap fetch with payment handling
        const fetchWithPayment = wrapFetchWithPayment(fetch, client);

        // Make request - payment is handled automatically
        const response = await fetchWithPayment("https://api.example.com/paid-endpoint", {
          method: "GET",
        });

        const body = await response.json();
        console.log("Response:", body);

        // Get payment receipt from response headers
        if (response.ok) {
          const httpClient = new x402HTTPClient(client);
          const paymentResponse = httpClient.getPaymentSettleResponse(
            (name) => response.headers.get(name)
          );
          console.log("Payment settled:", paymentResponse);
        }
        ```

        **Features:**

        * Automatically handles 402 Payment Required responses
        * Verifies payment and generates `PAYMENT-SIGNATURE` headers
        * Retries the request with proof of payment
        * Supports all standard fetch options
      </Tab>

      <Tab title="@x402/axios">
        **@x402/axios** adds a payment interceptor to Axios, so your requests are retried with payment headers automatically. [Full example here](https://github.com/coinbase/x402/tree/main/examples/typescript/clients/axios)

        ```typescript  theme={null}
        import { x402Client, withPaymentInterceptor, x402HTTPClient } from "@x402/axios";
        import { registerExactEvmScheme } from "@x402/evm/exact/client";
        import { privateKeyToAccount } from "viem/accounts";
        import axios from "axios";

        // Create signer
        const signer = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);

        // Create x402 client and register schemes
        const client = new x402Client();
        registerExactEvmScheme(client, { signer });

        // Create an Axios instance with payment handling
        const api = withPaymentInterceptor(
          axios.create({ baseURL: "https://api.example.com" }),
          client,
        );

        // Make request - payment is handled automatically
        const response = await api.get("/paid-endpoint");
        console.log("Response:", response.data);

        // Get payment receipt
        const httpClient = new x402HTTPClient(client);
        const paymentResponse = httpClient.getPaymentSettleResponse(
          (name) => response.headers[name.toLowerCase()]
        );
        console.log("Payment settled:", paymentResponse);
        ```

        **Features:**

        * Automatically handles 402 Payment Required responses
        * Retries requests with payment headers
        * Exposes payment response in headers
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    [Full example here](https://github.com/coinbase/x402/tree/main/examples/go/clients/http)

    ```go  theme={null}
    package main

    import (
        "context"
        "encoding/json"
        "fmt"
        "net/http"
        "os"
        "time"

        x402 "github.com/coinbase/x402/go"
        evm "github.com/coinbase/x402/go/mechanisms/evm/exact/client"
    )

    func main() {
        privateKey := os.Getenv("EVM_PRIVATE_KEY")
        url := "http://localhost:4021/weather"

        // Create x402 client and register EVM scheme
        client := x402.NewX402Client()
        evm.RegisterExactEvmScheme(client, &evm.Config{
            PrivateKey: privateKey,
        })

        // Wrap HTTP client with payment handling
        httpClient := x402.WrapHTTPClient(client)

        // Make request - payment is handled automatically
        ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
        defer cancel()

        req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
        resp, err := httpClient.Do(req)
        if err != nil {
            fmt.Printf("Request failed: %v\n", err)
            return
        }
        defer resp.Body.Close()

        // Read response
        var data map[string]interface{}
        json.NewDecoder(resp.Body).Decode(&data)
        fmt.Printf("Response: %+v\n", data)

        // Check payment response header
        paymentHeader := resp.Header.Get("PAYMENT-RESPONSE")
        if paymentHeader != "" {
            fmt.Println("Payment settled successfully!")
        }
    }
    ```
  </Tab>
</Tabs>

### Multi-Network Client Setup

You can register multiple payment schemes to handle different networks:

```typescript  theme={null}
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { registerExactSvmScheme } from "@x402/svm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

// Create signers
const evmSigner = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`,
);
const svmSigner = await createKeyPairSignerFromBytes(
  base58.decode(process.env.SOLANA_PRIVATE_KEY!),
);

// Create client with multiple schemes
const client = new x402Client();
registerExactEvmScheme(client, { signer: evmSigner });
registerExactSvmScheme(client, { signer: svmSigner });

const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// Now handles both EVM and Solana networks automatically!
```

## 4. Discover Available Services (Optional)

Instead of hardcoding endpoints, you can use the x402 Bazaar to dynamically discover available services. This is especially powerful for building autonomous agents that can find and use new capabilities.

<Tabs>
  <Tab title="Node.js">
    ```typescript  theme={null}
    import { HTTPFacilitatorClient } from "@x402/core/http";
    import { withBazaar } from "@x402/extensions/bazaar";

    // Create facilitator client with Bazaar extension
    const facilitatorClient = withBazaar(
      new HTTPFacilitatorClient({
        url: "https://api.cdp.coinbase.com/platform/v2/x402"
      })
    );

    // Query available services
    const discovery = await facilitatorClient.extensions.discovery.listResources({
      type: "http",
      limit: 20,
    });

    // Filter services by criteria
    const affordableServices = discovery.items.filter((item) =>
      item.accepts.some((req) => Number(req.amount) < 100000) // Under $0.10
    );

    console.log("Available services:", affordableServices);
    ```
  </Tab>

  <Tab title="Go">
    ```go  theme={null}
    import (
        "encoding/json"
        "net/http"
    )

    // Fetch available services
    resp, _ := http.Get("https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources")
    defer resp.Body.Close()

    var services struct {
        Items []map[string]interface{} `json:"items"`
    }
    json.NewDecoder(resp.Body).Decode(&services)

    fmt.Printf("Found %d services\n", len(services.Items))
    ```
  </Tab>
</Tabs>

<Info>
  Learn more about service discovery in the [x402 Bazaar
  documentation](/x402/bazaar), including how to filter services, understand
  their schemas, and build agents that can autonomously discover new
  capabilities.
</Info>

## 5. Error Handling

Clients will throw errors if:

* No scheme is registered for the required network
* The request configuration is missing
* A payment has already been attempted for the request
* There is an error creating the payment header

Common error handling:

```typescript  theme={null}
try {
  const response = await fetchWithPayment(url, { method: "GET" });
  // Handle success
} catch (error) {
  if (error.message.includes("No scheme registered")) {
    console.error("Network not supported - register the appropriate scheme");
  } else if (error.message.includes("Payment already attempted")) {
    console.error("Payment failed on retry");
  } else {
    console.error("Request failed:", error);
  }
}
```

## Summary

* Install x402 client packages (`@x402/fetch` or `@x402/axios`) and mechanism packages (`@x402/evm`, `@x402/svm`)
* Create a wallet signer
* Create an `x402Client` and register payment schemes
* Use the provided wrapper/interceptor to make paid API requests
* (Optional) Use the x402 Bazaar to discover services dynamically
* Payment flows are handled automatically for you

## References:

* [@x402/fetch on npm](https://www.npmjs.com/package/@x402/fetch)
* [@x402/axios on npm](https://www.npmjs.com/package/@x402/axios)
* [@x402/evm on npm](https://www.npmjs.com/package/@x402/evm)
* [x402 Go module](https://github.com/coinbase/x402/tree/main/go)
* [x402 Bazaar documentation](/x402/bazaar) - Discover available services
* [X402 with Embedded Wallets](/embedded-wallets/x402-payments) - User-facing applications with embedded wallets

For questions or support, join our [Discord](https://discord.gg/cdp).
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart for Sellers

This guide walks you through integrating with x402 to enable payments for your API or service. By the end, your API will be able to charge buyers and AI agents for access.

<Note>
  This quickstart begins with testnet configuration for safe testing. When you're ready for production, see [Running on Mainnet](#running-on-mainnet) for the simple changes needed to accept real payments on Base (EVM) and Solana networks.
</Note>

<Info>
  Need help? Join the [x402 Discord](https://discord.gg/cdp) for the latest updates.
</Info>

## Prerequisites

Before you begin, ensure you have:

* A crypto wallet to receive funds (any EVM-compatible wallet, e.g., [CDP Wallet](/server-wallets/v2/introduction/quickstart))
* (Optional) A [Coinbase Developer Platform](https://cdp.coinbase.com) (CDP) account and API Keys
  * Required for mainnet use until other facilitators go live
* [Node.js](https://nodejs.org/en) and npm, or [Go](https://go.dev/) installed
* An existing API or server

<Note>
  **Python SDK Status**: The Python SDK is currently under development for x402 v2. For immediate v2 support, use TypeScript or Go.
</Note>

<Info>
  We have pre-configured examples available in our repo for both [Node.js](https://github.com/coinbase/x402/tree/main/examples/typescript/servers) and [Go](https://github.com/coinbase/x402/tree/main/examples/go/servers). We also have an [advanced example](https://github.com/coinbase/x402/tree/main/examples/typescript/servers/advanced) that shows how to use the x402 SDKs to build a more complex payment flow.
</Info>

## 1. Install Dependencies

<Tabs>
  <Tab title="Node.js">
    <Tabs>
      <Tab title="Express">
        Install the x402 Express middleware and EVM mechanism packages:

        ```bash  theme={null}
        npm install @x402/express @x402/evm @x402/core
        ```
      </Tab>

      <Tab title="Next.js">
        Install the x402 Next.js middleware and EVM mechanism packages:

        ```bash  theme={null}
        npm install @x402/next @x402/evm @x402/core
        ```
      </Tab>

      <Tab title="Hono">
        Install the x402 Hono middleware and EVM mechanism packages:

        ```bash  theme={null}
        npm install @x402/hono @x402/evm @x402/core
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    Add the x402 Go module to your project:

    ```bash  theme={null}
    go get github.com/coinbase/x402/go
    ```
  </Tab>
</Tabs>

## 2. Add Payment Middleware

Integrate the payment middleware into your application. You will need to provide:

* The Facilitator URL or facilitator client. For testing, use `https://x402.org/facilitator` which works on Base Sepolia and Solana Devnet.
  * For mainnet setup, see [Running on Mainnet](#running-on-mainnet)
* The routes you want to protect
* Your receiving wallet address

<Tip>
  The examples below show testnet configuration. When you're ready to accept real payments, refer to [Running on Mainnet](#running-on-mainnet) for the simple changes needed.
</Tip>

<Tabs>
  <Tab title="Node.js">
    <Tabs>
      <Tab title="Express">
        Full example in the repo [here](https://github.com/coinbase/x402/tree/main/examples/typescript/servers/express).

        ```typescript  theme={null}
        import express from "express";
        import { paymentMiddleware, x402ResourceServer } from "@x402/express";
        import { ExactEvmScheme } from "@x402/evm/exact/server";
        import { HTTPFacilitatorClient } from "@x402/core/server";

        const app = express();

        // Your receiving wallet address
        const payTo = "0xYourAddress";

        // Create facilitator client (testnet)
        const facilitatorClient = new HTTPFacilitatorClient({
          url: "https://x402.org/facilitator"
        });

        // Create resource server and register EVM scheme
        const server = new x402ResourceServer(facilitatorClient)
          .register("eip155:84532", new ExactEvmScheme());

        app.use(
          paymentMiddleware(
            {
              "GET /weather": {
                accepts: [
                  {
                    scheme: "exact",
                    price: "$0.001", // USDC amount in dollars
                    network: "eip155:84532", // Base Sepolia (CAIP-2 format)
                    payTo,
                  },
                ],
                description: "Get current weather data for any location",
                mimeType: "application/json",
              },
            },
            server,
          ),
        );

        // Implement your route
        app.get("/weather", (req, res) => {
          res.send({
            report: {
              weather: "sunny",
              temperature: 70,
            },
          });
        });

        app.listen(4021, () => {
          console.log(`Server listening at http://localhost:4021`);
        });
        ```
      </Tab>

      <Tab title="Next.js">
        Full example in the repo [here](https://github.com/coinbase/x402/tree/main/examples/typescript/fullstack/next).

        ```typescript  theme={null}
        // middleware.ts
        import { paymentProxy, x402ResourceServer } from "@x402/next";
        import { ExactEvmScheme } from "@x402/evm/exact/server";
        import { HTTPFacilitatorClient } from "@x402/core/server";

        const payTo = "0xYourAddress";

        const facilitatorClient = new HTTPFacilitatorClient({
          url: "https://x402.org/facilitator"
        });

        const server = new x402ResourceServer(facilitatorClient)
          .register("eip155:84532", new ExactEvmScheme());

        export const middleware = paymentProxy(
          {
            "/api/protected": {
              accepts: [
                {
                  scheme: "exact",
                  price: "$0.01",
                  network: "eip155:84532",
                  payTo,
                },
              ],
              description: "Access to protected content",
              mimeType: "application/json",
            },
          },
          server,
        );

        export const config = {
          matcher: ["/api/protected/:path*"],
        };
        ```
      </Tab>

      <Tab title="Hono">
        Full example in the repo [here](https://github.com/coinbase/x402/tree/main/examples/typescript/servers/hono).

        ```typescript  theme={null}
        import { Hono } from "hono";
        import { serve } from "@hono/node-server";
        import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
        import { ExactEvmScheme } from "@x402/evm/exact/server";
        import { HTTPFacilitatorClient } from "@x402/core/server";

        const app = new Hono();
        const payTo = "0xYourAddress";

        const facilitatorClient = new HTTPFacilitatorClient({
          url: "https://x402.org/facilitator"
        });

        const server = new x402ResourceServer(facilitatorClient)
          .register("eip155:84532", new ExactEvmScheme());

        app.use(
          paymentMiddleware(
            {
              "/protected-route": {
                accepts: [
                  {
                    scheme: "exact",
                    price: "$0.10",
                    network: "eip155:84532",
                    payTo,
                  },
                ],
                description: "Access to premium content",
                mimeType: "application/json",
              },
            },
            server,
          ),
        );

        app.get("/protected-route", (c) => {
          return c.json({ message: "This content is behind a paywall" });
        });

        serve({ fetch: app.fetch, port: 3000 });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Gin">
        Full example in the repo [here](https://github.com/coinbase/x402/tree/main/examples/go/servers/gin).

        ```go  theme={null}
        package main

        import (
            "net/http"
            "time"

            x402 "github.com/coinbase/x402/go"
            x402http "github.com/coinbase/x402/go/http"
            ginmw "github.com/coinbase/x402/go/http/gin"
            evm "github.com/coinbase/x402/go/mechanisms/evm/exact/server"
            "github.com/gin-gonic/gin"
        )

        func main() {
            payTo := "0xYourAddress"
            network := x402.Network("eip155:84532") // Base Sepolia (CAIP-2 format)

            r := gin.Default()

            // Create facilitator client
            facilitatorClient := x402http.NewHTTPFacilitatorClient(&x402http.FacilitatorConfig{
                URL: "https://x402.org/facilitator",
            })

            // Apply x402 payment middleware
            r.Use(ginmw.X402Payment(ginmw.Config{
                Routes: x402http.RoutesConfig{
                    "GET /weather": {
                        Scheme:      "exact",
                        PayTo:       payTo,
                        Price:       "$0.001",
                        Network:     network,
                        Description: "Get weather data for a city",
                        MimeType:    "application/json",
                    },
                },
                Facilitator: facilitatorClient,
                Schemes: []ginmw.SchemeConfig{
                    {Network: network, Server: evm.NewExactEvmScheme()},
                },
                Initialize: true,
                Timeout:    30 * time.Second,
            }))

            // Protected endpoint
            r.GET("/weather", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{
                    "weather":     "sunny",
                    "temperature": 70,
                })
            })

            r.Run(":4021")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

<Note>
  Ready to accept real payments? See [Running on Mainnet](#running-on-mainnet) for production setup.
</Note>

**Route Configuration Interface:**

```typescript  theme={null}
interface RouteConfig {
  accepts: Array<{
    scheme: string;           // Payment scheme (e.g., "exact")
    price: string;            // Price in dollars (e.g., "$0.01")
    network: string;          // Network in CAIP-2 format (e.g., "eip155:84532")
    payTo: string;            // Your wallet address
  }>;
  description?: string;       // Description of the resource
  mimeType?: string;          // MIME type of the response
  extensions?: object;        // Optional extensions (e.g., Bazaar)
}
```

When a request is made to these routes without payment, your server will respond with the HTTP 402 Payment Required code and payment instructions.

## 3. Test Your Integration

To verify:

1. Make a request to your endpoint (e.g., `curl http://localhost:4021/weather`).
2. The server responds with a 402 Payment Required, including payment instructions in the `PAYMENT-REQUIRED` header.
3. Complete the payment using a compatible client, wallet, or automated agent. This typically involves signing a payment payload, which is handled by the client SDK detailed in the [Quickstart for Buyers](/x402/quickstart-for-buyers).
4. Retry the request, this time including the `PAYMENT-SIGNATURE` header containing the cryptographic proof of payment.
5. The server verifies the payment via the facilitator and, if valid, returns your actual API response (e.g., `{ "data": "Your paid API response." }`).

## 4. Enhance Discovery with Metadata (Recommended)

When using the CDP facilitator, your endpoints can be listed in the [x402 Bazaar](/x402/bazaar), our discovery layer that helps buyers and AI agents find services. To enable discovery and improve visibility:

<Tip>
  **Include descriptive metadata** in your route configuration:

  * **`description`**: Clear explanation of what your endpoint does
  * **`mimeType`**: MIME type of your response format
  * **`extensions.bazaar`**: Enable Bazaar discovery

  This metadata helps:

  * AI agents automatically understand how to use your API
  * Developers quickly find services that meet their needs
  * Improve your ranking in discovery results
</Tip>

Example with Bazaar extension:

```typescript  theme={null}
{
  "GET /weather": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:8453",
        payTo: "0xYourAddress",
      },
    ],
    description: "Get real-time weather data including temperature, conditions, and humidity",
    mimeType: "application/json",
    extensions: {
      bazaar: {
        discoverable: true,
        category: "weather",
        tags: ["forecast", "real-time"],
      },
    },
  },
}
```

Learn more about the discovery layer in the [x402 Bazaar documentation](/x402/bazaar).

## 5. Error Handling

* If you run into trouble, check out the examples in the [repo](https://github.com/coinbase/x402/tree/main/examples) for more context and full code.
* Run `npm install` or `go mod tidy` to install dependencies

## Running on Mainnet

Once you've tested your integration on testnet, you're ready to accept real payments on mainnet.

### Setting Up CDP Facilitator for Production

CDP's facilitator provides enterprise-grade payment processing with compliance features:

<Frame>
  <iframe width="560" height="315" src="https://www.youtube.com/embed/Zc_wBlDY2Zc" title="Running x402 on Mainnet" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen className="rounded-lg w-full" />
</Frame>

### 1. Set up CDP API Keys

To use the mainnet facilitator, you'll need a Coinbase Developer Platform account:

1. Sign up at [cdp.coinbase.com](https://cdp.coinbase.com)
2. Create a new project
3. Generate API credentials
4. Set the following environment variables:
   ```bash  theme={null}
   CDP_API_KEY_ID=your-api-key-id
   CDP_API_KEY_SECRET=your-api-key-secret
   ```

### 2. Update Your Code

Replace the testnet configuration with mainnet settings:

<Tabs>
  <Tab title="Node.js">
    ```typescript  theme={null}
    import { paymentMiddleware, x402ResourceServer } from "@x402/express";
    import { ExactEvmScheme } from "@x402/evm/exact/server";
    import { HTTPFacilitatorClient } from "@x402/core/server";

    // For mainnet, use CDP's facilitator with API keys
    const facilitatorClient = new HTTPFacilitatorClient({
      url: "https://api.cdp.coinbase.com/platform/v2/x402",
      // Add auth headers if required
    });

    const server = new x402ResourceServer(facilitatorClient)
      .register("eip155:8453", new ExactEvmScheme()); // Base mainnet

    app.use(
      paymentMiddleware(
        {
          "GET /weather": {
            accepts: [
              {
                scheme: "exact",
                price: "$0.001",
                network: "eip155:8453", // Base mainnet (CAIP-2)
                payTo: "0xYourAddress",
              },
            ],
            description: "Weather data",
            mimeType: "application/json",
          },
        },
        server,
      ),
    );
    ```
  </Tab>

  <Tab title="Go">
    ```go  theme={null}
    // Update network to mainnet
    network := x402.Network("eip155:8453") // Base mainnet (CAIP-2)

    // Create facilitator client for mainnet
    facilitatorClient := x402http.NewHTTPFacilitatorClient(&x402http.FacilitatorConfig{
        URL: "https://api.cdp.coinbase.com/platform/v2/x402",
        // Add auth if required
    })

    r.Use(ginmw.X402Payment(ginmw.Config{
        Routes: x402http.RoutesConfig{
            "GET /weather": {
                Scheme:  "exact",
                PayTo:   payTo,
                Price:   "$0.001",
                Network: network,
            },
        },
        Facilitator: facilitatorClient,
        Schemes: []ginmw.SchemeConfig{
            {Network: network, Server: evm.NewExactEvmScheme()},
        },
    }))
    ```
  </Tab>
</Tabs>

### 3. Update Your Wallet

Make sure your receiving wallet address is a real mainnet address where you want to receive USDC payments.

### 4. Test with Real Payments

Before going live:

1. Test with small amounts first
2. Verify payments are arriving in your wallet
3. Monitor the facilitator for any issues

<Warning>
  Mainnet transactions involve real money. Always test thoroughly on testnet first and start with small amounts on mainnet.
</Warning>

### Using Different Networks

CDP facilitator supports multiple networks. Simply change the network parameter using CAIP-2 format:

<Tabs>
  <Tab title="Base Network">
    ```typescript  theme={null}
    // Base mainnet
    {
      scheme: "exact",
      price: "$0.001",
      network: "eip155:8453", // Base mainnet
      payTo: "0xYourAddress",
    }

    // Base Sepolia testnet
    {
      scheme: "exact",
      price: "$0.001",
      network: "eip155:84532", // Base Sepolia
      payTo: "0xYourAddress",
    }
    ```
  </Tab>

  <Tab title="Solana Network">
    ```typescript  theme={null}
    // Solana mainnet
    {
      scheme: "exact",
      price: "$0.001",
      network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // Solana mainnet
      payTo: "YourSolanaWalletAddress",
    }

    // Solana devnet
    {
      scheme: "exact",
      price: "$0.001",
      network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", // Solana devnet
      payTo: "YourSolanaWalletAddress",
    }
    ```

    <Note>
      For Solana, make sure to use a Solana wallet address (base58 format) instead of an Ethereum address (0x format).
    </Note>
  </Tab>

  <Tab title="Multi-Network">
    ```typescript  theme={null}
    // Support multiple networks on the same endpoint
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:8453",
            payTo: "0xYourEvmAddress",
          },
          {
            scheme: "exact",
            price: "$0.001",
            network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
            payTo: "YourSolanaAddress",
          },
        ],
        description: "Weather data",
      },
    }
    ```
  </Tab>
</Tabs>

<Info>
  Need support for additional networks like Polygon or Avalanche? You can run your own facilitator or contact CDP support to request new network additions.
</Info>

## Network Identifiers (CAIP-2)

x402 v2 uses [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) format for network identifiers:

| Network        | CAIP-2 Identifier                         |
| -------------- | ----------------------------------------- |
| Base Mainnet   | `eip155:8453`                             |
| Base Sepolia   | `eip155:84532`                            |
| Solana Mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Solana Devnet  | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |

See [Network Support](/x402/network-support) for the full list.

## Next Steps

* Looking for something more advanced? Check out the [Advanced Example](https://github.com/coinbase/x402/tree/main/examples/typescript/servers/advanced)
* Get started as a [buyer](/x402/quickstart-for-buyers)
* Learn about the [Bazaar discovery layer](/x402/bazaar)

For questions or support, join our [Discord](https://discord.gg/cdp).

## Summary

This quickstart covered:

* Installing the x402 SDK and relevant middleware
* Adding payment middleware to your API and configuring it
* Testing your integration
* Deploying to mainnet with CAIP-2 network identifiers

Your API is now ready to accept crypto payments through x402.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How x402 Works

This page explains the complete payment flow in x402, from initial request to payment settlement.

## Overview

x402 enables programmatic payments over HTTP using a simple request-response flow. When a client requests a paid resource, the server responds with payment requirements, the client submits payment, and the server delivers the resource.

## Payment Flow

<img src="https://mintcdn.com/coinbase-prod/-uP70_EV6KGCA5Hq/x402/images/x402-protocol-flow.png?fit=max&auto=format&n=-uP70_EV6KGCA5Hq&q=85&s=d9dd623f1ff6ccc8092ab994c23c8c59" data-og-width="2984" width="2984" data-og-height="1725" height="1725" data-path="x402/images/x402-protocol-flow.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/coinbase-prod/-uP70_EV6KGCA5Hq/x402/images/x402-protocol-flow.png?w=280&fit=max&auto=format&n=-uP70_EV6KGCA5Hq&q=85&s=fd270b61d4ca043ed17da4ed179b2c66 280w, https://mintcdn.com/coinbase-prod/-uP70_EV6KGCA5Hq/x402/images/x402-protocol-flow.png?w=560&fit=max&auto=format&n=-uP70_EV6KGCA5Hq&q=85&s=1757b276812f2d884d88f18b345928c6 560w, https://mintcdn.com/coinbase-prod/-uP70_EV6KGCA5Hq/x402/images/x402-protocol-flow.png?w=840&fit=max&auto=format&n=-uP70_EV6KGCA5Hq&q=85&s=4d1de430e1d2e19f0a09560106ce885a 840w, https://mintcdn.com/coinbase-prod/-uP70_EV6KGCA5Hq/x402/images/x402-protocol-flow.png?w=1100&fit=max&auto=format&n=-uP70_EV6KGCA5Hq&q=85&s=e8b34ae4370ac3c2b2373d0681383ce7 1100w, https://mintcdn.com/coinbase-prod/-uP70_EV6KGCA5Hq/x402/images/x402-protocol-flow.png?w=1650&fit=max&auto=format&n=-uP70_EV6KGCA5Hq&q=85&s=bd4a806edefdc793bfc4850d92cfb1f4 1650w, https://mintcdn.com/coinbase-prod/-uP70_EV6KGCA5Hq/x402/images/x402-protocol-flow.png?w=2500&fit=max&auto=format&n=-uP70_EV6KGCA5Hq&q=85&s=7fc035915f06c4a4da0c2946fb5a0948 2500w" />

### Step-by-Step Process

1. **Client makes HTTP request** - The [client](/x402/core-concepts/client-server) sends a standard HTTP request to a resource server for a protected endpoint.

2. **Server responds with 402** - The resource server returns an [HTTP 402 Payment Required](/x402/core-concepts/http-402) status code with payment requirements in the `PAYMENT-REQUIRED` header.

3. **Client creates payment** - The client examines the payment requirements and creates a payment payload using their [wallet](/x402/core-concepts/wallet) based on the specified scheme.

4. **Client resubmits with payment** - The client sends the same HTTP request again, this time including the `PAYMENT-SIGNATURE` header containing the signed payment payload.

5. **Server verifies payment** - The resource server validates the payment payload either:
   * Locally (if running their own verification)
   * Via a [facilitator](/x402/core-concepts/facilitator) service (recommended)

6. **Facilitator validates** - If using a facilitator, it checks the payment against the scheme and network requirements, returning a verification response.

7. **Server processes request** - If payment is valid, the server fulfills the original request. If invalid, it returns another 402 response.

8. **Payment settlement** - The server initiates blockchain settlement either:
   * Directly by submitting to the blockchain
   * Through the facilitator's `/settle` endpoint

9. **Facilitator submits onchain** - The facilitator broadcasts the transaction to the blockchain based on the payment's network and waits for confirmation.

10. **Settlement confirmation** - Once confirmed onchain, the facilitator returns a payment execution response.

11. **Server delivers resource** - The server returns a 200 OK response with:
    * The requested resource in the response body
    * A `PAYMENT-RESPONSE` header containing the settlement details

## Key Components

* **[Client & Server](/x402/core-concepts/client-server)** - The roles and responsibilities of each party
* **[Facilitator](/x402/core-concepts/facilitator)** - Optional service that handles payment verification and settlement
* **[HTTP 402](/x402/core-concepts/http-402)** - How payment requirements are communicated
* **[Networks & Facilitators](/x402/network-support)** - Available networks and facilitator options

## Why This Design?

The x402 protocol is designed to be:

* **Stateless** - No sessions or authentication required
* **HTTP-native** - Works with existing web infrastructure
* **Blockchain-agnostic** - Supports multiple networks through facilitators
* **Developer-friendly** - Simple integration with standard HTTP libraries

## Next Steps

* Ready to accept payments? See [Quickstart for Sellers](/x402/quickstart-for-sellers)
* Want to make payments? See [Quickstart for Buyers](/x402/quickstart-for-buyers)
* Looking for specific networks? Check [Network Support](/x402/network-support)
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HTTP 402

For decades, HTTP 402 Payment Required has been reserved for future use. x402 unlocks it, and [absolves the internet of its original sin](https://economyofbits.substack.com/p/marc-andreessens-original-sin).

## What is HTTP 402?

[HTTP 402](https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.2) is a standard, but rarely used, HTTP response status code indicating that payment is required to access a resource.

In x402, this status code is activated to:

* Inform clients (buyers or agents) that payment is required.
* Communicate the details of the payment, such as amount, currency, and destination address.
* Provide the information necessary to complete the payment programmatically.

## Why x402 Uses HTTP 402

The primary purpose of HTTP 402 is to enable frictionless, API-native payments for accessing web resources, especially for:

* Machine-to-machine (M2M) payments (e.g., AI agents).
* Pay-per-use models such as API calls or paywalled content.
* Micropayments without account creation or traditional payment rails.

Using the 402 status code keeps x402 protocol natively web-compatible and easy to integrate into any HTTP-based service.

## Summary

HTTP 402 is the foundation of the x402 protocol, enabling services to declare payment requirements directly within HTTP responses. It:

* Signals payment is required
* Communicates necessary payment details
* Integrates seamlessly with standard HTTP workflows

## Next Steps

* [How x402 Works](/x402/core-concepts/how-it-works): See how HTTP 402 fits into the complete payment flow
* [Client & Server](/x402/core-concepts/client-server): Understand the roles in the x402 protocol
* [Quickstart for Sellers](/x402/quickstart-for-sellers): Start implementing HTTP 402 responses
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Client / Server Flow

This page explains the roles and responsibilities of the **client** and **server** in the x402 protocol.

Understanding these roles is essential to designing, building, or integrating services that use x402 for programmatic payments.

<Info>
  Client refers to the technical component making an HTTP request. In practice, this is often the buyer of the resource.

  Server refers to the technical component responding to the request. In practice, this is typically the seller of the resource
</Info>

## Client Role

The client is the entity that initiates a request to access a paid resource.

Clients can include:

* Human-operated applications
* Autonomous agents
* Programmatic services acting on behalf of users or systems

### Responsibilities

* **Initiate requests:** Send an HTTP request to the resource server.
* **Handle payment requirements:** Read the `402 Payment Required` response and extract payment details.
* **Prepare payment payload:** Use the provided payment requirements to construct a valid payment payload.
* **Resubmit request with payment:** Retry the request with the `X-PAYMENT` header containing the signed payment payload.

Clients do not need to manage accounts, credentials, or session tokens beyond their crypto wallet. All interactions are stateless and occur over standard HTTP requests.

# Server Role

The server is the resource provider enforcing payment for access to its services.

Servers can include:

* API services
* Content providers
* Any HTTP-accessible resource requiring monetization

### Responsibilities

* **Define payment requirements:** Respond to unauthenticated requests with an HTTP `402 Payment Required`, including all necessary payment details in the response body.
* **Verify payment payloads:** Validate incoming payment payloads, either locally or by using a facilitator service.
* **Settle transactions:** Upon successful verification, submit the payment for settlement.
* **Provide the resource:** Once payment is confirmed, return the requested resource to the client.

Servers do not need to manage client identities or maintain session state. Verification and settlement are handled per request.

## How It Works

For a detailed explanation of the complete payment flow between clients and servers, see [How x402 Works](/x402/core-concepts/how-it-works).

## Summary

In the x402 protocol:

* The **client** requests resources and supplies the signed payment payload.
* The **server** enforces payment requirements, verifies transactions, and provides the resource upon successful payment.

This interaction is stateless, HTTP-native, and compatible with both human applications and automated agents.

Next, explore:

* [How x402 Works](/x402/core-concepts/how-it-works): See the complete payment flow
* [Facilitator](/x402/core-concepts/facilitator): How servers verify and settle payments
* [HTTP 402](/x402/core-concepts/http-402): How servers communicate payment requirements to clients
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Facilitator

This page explains the role of the **facilitator** in the x402 protocol.

The facilitator is an optional but recommended service that simplifies the process of verifying and settling payments between clients (buyers) and servers (sellers).

# What is a Facilitator?

The facilitator is a service that:

* Verifies payment payloads submitted by clients.
* Settles payments on the blockchain on behalf of servers.

By using a facilitator, servers do not need to maintain direct blockchain connectivity or implement payment verification logic themselves. This reduces operational complexity and ensures accurate, real-time validation of transactions.

## Facilitator Responsibilities

* **Verify payments:** Confirm that the client's payment payload meets the server's declared payment requirements.
* **Settle payments:** Submit validated payments to the blockchain and monitor for confirmation.
* **Provide responses:** Return verification and settlement results to the server, allowing the server to decide whether to fulfill the client's request.

The facilitator does not hold funds or act as a custodian - it performs verification and execution of onchain transactions based on signed payloads provided by clients.

## Why Use a Facilitator?

Using a facilitator provides:

* **Reduced operational complexity:** Servers do not need to interact directly with blockchain nodes.
* **Protocol consistency:** Standardized verification and settlement flows across services.
* **Faster integration:** Services can start accepting payments with minimal blockchain-specific development.

While it is possible to implement verification and settlement locally, using a facilitator accelerates adoption and ensures correct protocol behavior.

## CDP's Facilitator

Coinbase Developer Platform (CDP) operates a hosted facilitator service.

CDP's x402 facilitator offers:

* **Fee-free USDC payments on Base:** It currently processes transactions without additional fees, allowing sellers to receive 100% of the payment.
* **USDC-only support:** Exclusive support for USDC as the payment asset (for the time being).
* **High performance settlement:** Payments are submitted to the Base network with fast confirmation times and high throughput.

To get started with CDP's facilitator, see the [quickstart for sellers](/x402/quickstart-for-sellers).

Using CDP's facilitator allows sellers to quickly integrate payments without managing blockchain infrastructure, while providing a predictable and low-cost experience for buyers.

## Available Facilitators

For a list of available facilitators and the networks they support, see [Network Support](/x402/network-support).

## How It Works

To understand how facilitators fit into the complete x402 payment flow, see [How x402 Works](/x402/core-concepts/how-it-works).

## Summary

The facilitator acts as an independent verification and settlement layer within the x402 protocol. It helps servers confirm payments and submit transactions onchain without requiring direct blockchain infrastructure.

Coinbase's hosted facilitator simplifies this further by offering a ready-to-use, fee-free environment for USDC payments on Base.

Next, explore:

* [How x402 Works](/x402/core-concepts/how-it-works): See the complete payment flow
* [Network Support](/x402/network-support): Find available facilitators and networks
* [HTTP 402](/x402/core-concepts/http-402): Understand how payment requirements are communicated
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wallet

This page explains the role of the **wallet** in the x402 protocol.

In x402, a wallet is both a payment mechanism and a form of unique identity for buyers and sellers. Wallet addresses are used to send, receive, and verify payments, while also serving as identifiers within the protocol.

## Role of the Wallet

### For Buyers

Buyers use wallets to:

* Store USDC
* Sign payment payloads
* Authorize onchain payments programmatically

Wallets enable buyers, including AI agents, to transact without account creation or credential management.

### For Sellers

Sellers use wallets to:

* Receive USDC payments
* Define their payment destination within server configurations

A seller's wallet address is included in the payment requirements provided to buyers.

[CDP's Server Wallet](/server-wallets/v2/introduction/quickstart) is our recommended option for programmatic payments and secure key management.

## Summary

* Wallets enable programmatic, permissionless payments in x402.
* Buyers use wallets to pay for services.
* Sellers use wallets to receive payments.
* Wallet addresses also act as unique identifiers within the protocol.

Next, explore:

* [How x402 Works](/x402/core-concepts/how-it-works): See how wallets fit into the payment flow
* [Client & Server](/x402/core-concepts/client-server): Understand buyer and seller roles
* [Quickstart for Sellers](/x402/quickstart-for-sellers): Set up your receiving wallet
* [Quickstart for Buyers](/x402/quickstart-for-buyers): Configure your payment wallet
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# x402 Bazaar (Discovery Layer)

The x402 Bazaar is the discovery layer for the x402 ecosystem: a machine-readable catalog that helps developers and AI agents find and integrate with x402-compatible API endpoints. Think of it as a search index for payable APIs, enabling autonomous discovery and consumption of services.

<Note>
  The x402 Bazaar is in early development. While our vision is to build the
  "Google for agentic endpoints," we're currently more like "Yahoo search":
  functional but evolving. Features and APIs may change as we gather feedback
  and expand capabilities.
</Note>

## Overview

The Bazaar solves a critical problem in the x402 ecosystem: **discoverability**. Without it, x402-compatible endpoints are like hidden stalls in a vast market. The Bazaar provides:

* **For Buyers (API Consumers)**: Programmatically discover available x402-enabled services, understand their capabilities, pricing, and schemas
* **For Sellers (API Providers)**: Automatic visibility for your x402-enabled services to a global audience of developers and AI agents
* **For AI Agents**: Dynamic service discovery without pre-baked integrations. Query, find, pay, and use

## How It Works

In x402 v2, the Bazaar has been codified as an **official extension** in the reference SDK (`@x402/extensions/bazaar`). This extension enables:

1. **Servers** declare discovery metadata (input/output schemas) in their route configuration
2. **Facilitators** extract and catalog this metadata when processing payments
3. **Clients** query the facilitator's `/discovery/resources` endpoint to find available services

### v1 vs v2

| Aspect              | v1 (Deprecated)                             | v2 (Current)                              |
| ------------------- | ------------------------------------------- | ----------------------------------------- |
| Discovery data      | `outputSchema` field in PaymentRequirements | `extensions.bazaar` field in route config |
| Schema validation   | None                                        | JSON Schema validation                    |
| Input specification | Not supported                               | Full input/output schema support          |

## Quickstart for Sellers

To make your endpoints discoverable in the Bazaar, you need to:

1. Register the Bazaar extension on your resource server
2. Declare discovery metadata in your route configuration

### Step 1: Install the Extension Package

<Tabs>
  <Tab title="Node.js">
    ```bash  theme={null}
    npm install @x402/extensions
    ```
  </Tab>

  <Tab title="Go">
    ```bash  theme={null}
    go get github.com/coinbase/x402/go/extensions/bazaar
    ```
  </Tab>
</Tabs>

### Step 2: Register the Extension and Declare Discovery Metadata

<Tabs>
  <Tab title="Node.js (Express)">
    Full example in the [Express server example](https://github.com/coinbase/x402/tree/main/examples/typescript/servers/express).

    ```typescript  theme={null}
    import express from "express";
    import { paymentMiddleware } from "@x402/express";
    import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
    import { registerExactEvmScheme } from "@x402/evm/exact/server";
    import {
      bazaarResourceServerExtension,
      declareDiscoveryExtension,
    } from "@x402/extensions/bazaar";

    const app = express();

    // Create facilitator client
    const facilitatorClient = new HTTPFacilitatorClient({
      url: "https://x402.org/facilitator",
    });

    // Create resource server and register extensions
    const server = new x402ResourceServer(facilitatorClient);
    registerExactEvmScheme(server);
    server.registerExtension(bazaarResourceServerExtension);

    // Configure payment middleware with discovery metadata
    app.use(
      paymentMiddleware(
        {
          "GET /weather": {
            accepts: {
              scheme: "exact",
              price: "$0.001",
              network: "eip155:84532",
              payTo: "0xYourAddress",
            },
            extensions: {
              // Declare discovery metadata for this endpoint
              ...declareDiscoveryExtension({
                output: {
                  example: {
                    temperature: 72,
                    conditions: "sunny",
                    humidity: 45,
                  },
                  schema: {
                    properties: {
                      temperature: { type: "number" },
                      conditions: { type: "string" },
                      humidity: { type: "number" },
                    },
                    required: ["temperature", "conditions"],
                  },
                },
              }),
            },
          },
        },
        server,
      ),
    );

    app.get("/weather", (req, res) => {
      res.json({
        temperature: 72,
        conditions: "sunny",
        humidity: 45,
      });
    });

    app.listen(4021);
    ```
  </Tab>

  <Tab title="Go (Gin)">
    ```go  theme={null}
    package main

    import (
        "net/http"

        x402 "github.com/coinbase/x402/go"
        x402http "github.com/coinbase/x402/go/http"
        ginmw "github.com/coinbase/x402/go/http/gin"
        evm "github.com/coinbase/x402/go/mechanisms/evm/exact/server"
        "github.com/coinbase/x402/go/extensions/bazaar"
        "github.com/coinbase/x402/go/extensions/types"
        "github.com/gin-gonic/gin"
    )

    func main() {
        r := gin.Default()

        // Create discovery extension for the endpoint
        discoveryExt, _ := bazaar.DeclareDiscoveryExtension(
            types.MethodGET,
            nil, // No query params required
            nil, // No input schema
            "",  // Not a body method
            &types.OutputConfig{
                Example: map[string]interface{}{
                    "temperature": 72,
                    "conditions":  "sunny",
                    "humidity":    45,
                },
                Schema: types.JSONSchema{
                    "properties": map[string]interface{}{
                        "temperature": map[string]interface{}{"type": "number"},
                        "conditions":  map[string]interface{}{"type": "string"},
                        "humidity":    map[string]interface{}{"type": "number"},
                    },
                    "required": []string{"temperature", "conditions"},
                },
            },
        )

        r.Use(ginmw.X402Payment(ginmw.Config{
            Routes: x402http.RoutesConfig{
                "GET /weather": {
                    Scheme:  "exact",
                    PayTo:   "0xYourAddress",
                    Price:   "$0.001",
                    Network: x402.Network("eip155:84532"),
                    Extensions: map[string]interface{}{
                        types.BAZAAR: discoveryExt,
                    },
                },
            },
            Facilitator: x402http.NewHTTPFacilitatorClient(&x402http.FacilitatorConfig{
                URL: "https://x402.org/facilitator",
            }),
            Schemes: []ginmw.SchemeConfig{
                {Network: x402.Network("eip155:84532"), Server: evm.NewExactEvmScheme()},
            },
        }))

        r.GET("/weather", func(c *gin.Context) {
            c.JSON(http.StatusOK, gin.H{
                "temperature": 72,
                "conditions":  "sunny",
                "humidity":    45,
            })
        })

        r.Run(":4021")
    }
    ```
  </Tab>
</Tabs>

### Discovery Extension Options

The `declareDiscoveryExtension` function accepts configuration for different HTTP methods:

```typescript  theme={null}
// For GET endpoints (query params)
declareDiscoveryExtension({
  input: { city: "San Francisco" }, // Example query params
  inputSchema: {
    properties: {
      city: { type: "string", description: "City name" },
    },
    required: ["city"],
  },
  output: {
    example: { temperature: 72 },
    schema: {
      properties: {
        temperature: { type: "number" },
      },
    },
  },
});

// For POST endpoints (request body)
declareDiscoveryExtension({
  input: { prompt: "Hello world" }, // Example body
  inputSchema: {
    properties: {
      prompt: { type: "string", maxLength: 1000 },
    },
    required: ["prompt"],
  },
  bodyType: "json", // Signals this is a body method
  output: {
    example: { response: "Hi there!" },
  },
});
```

## Quickstart for Buyers

To discover available services, use the `withBazaar` wrapper to extend your facilitator client with discovery capabilities.

### Step 1: Install Dependencies

<Tabs>
  <Tab title="Node.js">
    ```bash  theme={null}
    npm install @x402/core @x402/extensions @x402/fetch @x402/evm
    ```
  </Tab>

  <Tab title="Go">
    ```bash  theme={null}
    go get github.com/coinbase/x402/go
    ```
  </Tab>
</Tabs>

### Step 2: Query the Discovery Endpoint

<Tabs>
  <Tab title="Node.js">
    ```typescript  theme={null}
    import { HTTPFacilitatorClient } from "@x402/core/http";
    import { withBazaar } from "@x402/extensions/bazaar";
    import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
    import { registerExactEvmScheme } from "@x402/evm/exact/client";
    import { privateKeyToAccount } from "viem/accounts";

    // Create facilitator client with Bazaar extension
    const facilitatorClient = withBazaar(
      new HTTPFacilitatorClient({ url: "https://x402.org/facilitator" })
    );

    // Query available services
    const discovery = await facilitatorClient.extensions.discovery.listResources({
      type: "http",   // Filter by protocol type
      limit: 20,      // Pagination
      offset: 0,
    });

    console.log(`Found ${discovery.items.length} services`);

    // Browse discovered resources
    for (const resource of discovery.items) {
      console.log(`- ${resource.resource}`);
      console.log(`  Type: ${resource.type}`);
      console.log(`  x402 Version: ${resource.x402Version}`);
      console.log(`  Accepts: ${resource.accepts.length} payment method(s)`);
      console.log(`  Last Updated: ${resource.lastUpdated}`);
      if (resource.metadata) {
        console.log(`  Metadata:`, resource.metadata);
      }
    }

    // Select a service and make a paid request
    const selectedService = discovery.items[0];

    // Set up x402 client for payments
    const signer = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);
    const client = new x402Client();
    registerExactEvmScheme(client, { signer });

    const fetchWithPayment = wrapFetchWithPayment(fetch, client);

    // Call the discovered service
    const response = await fetchWithPayment(selectedService.resource);
    const data = await response.json();
    console.log("Response:", data);
    ```
  </Tab>

  <Tab title="Go">
    ```go  theme={null}
    package main

    import (
        "encoding/json"
        "fmt"
        "net/http"
        "os"

        x402 "github.com/coinbase/x402/go"
        x402http "github.com/coinbase/x402/go/http"
        evm "github.com/coinbase/x402/go/mechanisms/evm/exact/client"
    )

    func main() {
        facilitatorURL := "https://x402.org/facilitator"

        // Query discovery endpoint
        resp, err := http.Get(facilitatorURL + "/discovery/resources?type=http&limit=20")
        if err != nil {
            panic(err)
        }
        defer resp.Body.Close()

        var discovery struct {
            X402Version int `json:"x402Version"`
            Items []struct {
                Resource    string                   `json:"resource"`
                Type        string                   `json:"type"`
                X402Version int                      `json:"x402Version"`
                Accepts     []map[string]interface{} `json:"accepts"`
                LastUpdated string                   `json:"lastUpdated"`
                Metadata    map[string]interface{}   `json:"metadata"`
            } `json:"items"`
            Pagination struct {
                Limit  int `json:"limit"`
                Offset int `json:"offset"`
                Total  int `json:"total"`
            } `json:"pagination"`
        }
        json.NewDecoder(resp.Body).Decode(&discovery)

        fmt.Printf("Found %d services\n", len(discovery.Items))

        // Select a service
        if len(discovery.Items) == 0 {
            fmt.Println("No services found")
            return
        }
        selectedResource := discovery.Items[0].Resource

        // Create x402 client for payments
        client := x402.NewX402Client()
        evm.RegisterExactEvmScheme(client, &evm.Config{
            PrivateKey: os.Getenv("EVM_PRIVATE_KEY"),
        })

        // Make paid request
        httpClient := x402.WrapHTTPClient(client)
        req, _ := http.NewRequest("GET", selectedResource, nil)
        paymentResp, err := httpClient.Do(req)
        if err != nil {
            panic(err)
        }
        defer paymentResp.Body.Close()

        var data map[string]interface{}
        json.NewDecoder(paymentResp.Body).Decode(&data)
        fmt.Printf("Response: %+v\n", data)
    }
    ```
  </Tab>
</Tabs>

## API Reference

### Discovery Endpoint

Facilitators that support the Bazaar extension expose a discovery endpoint:

```
GET {facilitator_url}/discovery/resources
```

#### Query Parameters

| Parameter | Type   | Description                                 |
| --------- | ------ | ------------------------------------------- |
| `type`    | string | Filter by protocol type (e.g., `"http"`)    |
| `limit`   | number | Number of resources to return (default: 20) |
| `offset`  | number | Offset for pagination (default: 0)          |

#### Response Schema

```json  theme={null}
{
  "x402Version": 2,
  "items": [
    {
      "resource": "https://api.example.com/weather",
      "type": "http",
      "x402Version": 1,
      "accepts": [
        {
          "scheme": "exact",
          "network": "eip155:84532",
          "amount": "1000",
          "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C"
        }
      ],
      "lastUpdated": "2024-01-15T12:30:00.000Z",
      "metadata": {
        "description": "Weather data API",
        "input": { ... },
        "output": { ... }
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 42
  }
}
```

#### Discovered Resource Fields

| Field         | Type     | Required | Description                                                      |
| ------------- | -------- | -------- | ---------------------------------------------------------------- |
| `resource`    | `string` | Yes      | The resource URL being monetized                                 |
| `type`        | `string` | Yes      | Resource type (currently `"http"`)                               |
| `x402Version` | `number` | Yes      | Protocol version supported by the resource                       |
| `accepts`     | `array`  | Yes      | Array of PaymentRequirements specifying accepted payment methods |
| `lastUpdated` | `string` | Yes      | ISO 8601 timestamp of when the resource was last updated         |
| `metadata`    | `object` | No       | Additional metadata (description, schemas, etc.)                 |

### CDP Facilitator Discovery Endpoint

The CDP facilitator's discovery endpoint:

```
GET https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources
```

<Note>
  The default limit is 100 results per request. Use pagination parameters to
  retrieve additional results.
</Note>

## Extension Architecture

The Bazaar extension follows the x402 v2 extensions pattern:

```typescript  theme={null}
// Extension structure
{
  bazaar: {
    info: {
      input: {
        type: "http",
        method: "GET",
        queryParams: { ... }
      },
      output: {
        type: "json",
        example: { ... }
      }
    },
    schema: {
      // JSON Schema validating the info structure
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: { ... }
    }
  }
}
```

### Key Components

| Component                       | Purpose                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| `bazaarResourceServerExtension` | Server extension that enriches declarations with HTTP method info |
| `declareDiscoveryExtension()`   | Helper to create properly structured extension declarations       |
| `withBazaar()`                  | Client wrapper that adds discovery query methods                  |
| `extractDiscoveryInfo()`        | Facilitator helper to extract discovery data from payments        |

## Best Practices

### For Sellers

1. **Provide clear examples**: Include realistic `output.example` values that demonstrate your API's response format
2. **Document inputs**: Use `inputSchema` with descriptions to help clients understand required parameters
3. **Use appropriate types**: Specify correct JSON Schema types (`string`, `number`, `boolean`, `array`, `object`)

### For Buyers

1. **Cache discovery results**: Don't query discovery on every request
2. **Handle pagination**: Use `offset` and `limit` for large result sets
3. **Validate compatibility**: Check that discovered services support your payment network

## Support

* **GitHub**: [github.com/coinbase/x402](https://github.com/coinbase/x402)
* **Discord**: [Join #x402 channel](https://discord.gg/cdp)
* **Documentation**: [x402 Overview](/x402/welcome)

## FAQ

**Q: How do I get my service listed in the Bazaar?**
A: Register the `bazaarResourceServerExtension` on your resource server and include `declareDiscoveryExtension()` in your route configuration. The facilitator will automatically catalog your service when it processes payments.

**Q: Can I opt out of discovery?**
A: Yes, simply don't include the Bazaar extension in your route configuration. Only routes with the extension will be discoverable.

**Q: What networks are supported?**
A: The Bazaar is network-agnostic. It catalogs services regardless of which payment networks they accept.

**Q: How often is the discovery catalog updated?**
A: Services are cataloged when the facilitator processes payments. The catalog is refreshed as transactions occur.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Network Support

x402 supports multiple blockchain networks for payment processing. This page covers what the x402 reference SDKs support, what the CDP facilitator is configured for, and where to find other facilitators.

## Network Identifiers (CAIP-2)

x402 v2 uses [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) (Chain Agnostic Improvement Proposal) format for network identifiers. This provides a standardized way to identify blockchain networks across the ecosystem.

### CAIP-2 Format

The format is: `namespace:reference`

* **EVM Networks**: `eip155:{chainId}` where `chainId` is the EVM chain ID
* **Solana Networks**: `solana:{genesisHash}` where `genesisHash` is a truncated genesis hash

### Examples

```typescript  theme={null}
// EVM networks
network: "eip155:8453"      // Base mainnet (chain ID 8453)
network: "eip155:84532"     // Base Sepolia (chain ID 84532)
network: "eip155:1"         // Ethereum mainnet (chain ID 1)

// Solana networks
network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"  // Solana mainnet
network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"  // Solana devnet
```

## Reference SDK Support

The x402 reference SDKs are designed to be flexible and extensible:

### EVM Support (`@x402/evm`)

The `@x402/evm` package supports **any EVM-compatible chain** you configure, as long as the payment asset implements [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) (Transfer With Authorization). This includes:

* Any Ethereum L1 or L2
* Any EVM-compatible chain with a valid chain ID
* Any EIP-3009 compliant token (USDC, EURC, etc.)

### Solana Support (`@x402/svm`)

The `@x402/svm` package supports **any Solana cluster** with:

* SPL Token Program tokens
* Token2022 program tokens

### Other SDKs

Community and third-party SDKs may expand support to other protocol families or chains beyond what the reference SDKs currently support. Check the [x402 ecosystem](https://www.x402.org/ecosystem) for additional implementations.

## CDP Facilitator Support

The CDP (Coinbase Developer Platform) facilitator is configured to support the following networks and schemes:

| Network       | CAIP-2 Identifier                         | v1 Support | v2 Support | Scheme  | Fees       |
| ------------- | ----------------------------------------- | ---------- | ---------- | ------- | ---------- |
| Base          | `eip155:8453`                             | ✅          | ✅          | `exact` | Fee-free\* |
| Base Sepolia  | `eip155:84532`                            | ✅          | ✅          | `exact` | Fee-free\* |
| Solana        | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | ✅          | ✅          | `exact` | Fee-free\* |
| Solana Devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | ✅          | ✅          | `exact` | Fee-free\* |

\*Gas is paid on-chain; CDP's facilitator adds zero additional fees.

**CDP Facilitator Endpoints:**

* **Mainnet**: `https://api.cdp.coinbase.com/platform/v2/x402`
  * Requires CDP API keys
  * Supports: Base, Solana

## x402.org Testnet Facilitator

The x402.org testnet facilitator is available for testing and development:

| Network       | CAIP-2 Identifier                         | v1 Support | v2 Support | Scheme  |
| ------------- | ----------------------------------------- | ---------- | ---------- | ------- |
| Base Sepolia  | `eip155:84532`                            | ✅          | ✅          | `exact` |
| Solana Devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | ✅          | ✅          | `exact` |

**Endpoint**: `https://x402.org/facilitator`

* No API key required
* For testnet use only

## Other Facilitators

The x402 protocol is permissionless, so anyone can run a facilitator. The ecosystem includes several community and third-party facilitators that support additional networks, tokens, and features.

<Info>
  For a complete and up-to-date list of facilitators, visit the [x402 Ecosystem](https://www.x402.org/ecosystem?category=facilitators).
</Info>

## Chain ID Reference

Quick reference for common EVM chain IDs:

| Chain ID | Network           | CAIP-2 Format  |
| -------- | ----------------- | -------------- |
| 1        | Ethereum Mainnet  | `eip155:1`     |
| 10       | Optimism          | `eip155:10`    |
| 137      | Polygon           | `eip155:137`   |
| 8453     | Base              | `eip155:8453`  |
| 84532    | Base Sepolia      | `eip155:84532` |
| 42161    | Arbitrum One      | `eip155:42161` |
| 43114    | Avalanche C-Chain | `eip155:43114` |
| 43113    | Avalanche Fuji    | `eip155:43113` |

## Token Support

### EVM Networks (EIP-3009)

On EVM networks, x402 supports tokens that implement [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) (Transfer With Authorization). This enables gasless transfers where the user signs a message and the facilitator submits the transaction.

**Common EIP-3009 Tokens:**

| Token | Base                                         | Base Sepolia                                 |
| ----- | -------------------------------------------- | -------------------------------------------- |
| USDC  | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

<Note>
  Any EIP-3009 compliant token can be used with x402. The token addresses above are the most commonly used with the CDP facilitator.
</Note>

### Solana Networks (SPL / Token2022)

On Solana, x402 supports both SPL Token Program and Token2022 program tokens.

**Common Tokens:**

| Token | Mainnet                                        | Devnet             |
| ----- | ---------------------------------------------- | ------------------ |
| USDC  | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | (faucet available) |

## Price Formatting

x402 supports multiple price formats for convenience:

```typescript  theme={null}
// Dollar string format (recommended for readability)
price: "$0.001"    // 0.001 USDC
price: "$1.00"     // 1 USDC
price: "$0.50"     // 0.50 USDC

// Atomic units (for precision)
amount: "1000"     // 0.001 USDC (6 decimals)
amount: "1000000"  // 1 USDC (6 decimals)
```

## Usage Examples

### Server-Side Configuration

<Tabs>
  <Tab title="Node.js">
    ```typescript  theme={null}
    import { paymentMiddleware, x402ResourceServer } from "@x402/express";
    import { ExactEvmScheme } from "@x402/evm/exact/server";
    import { HTTPFacilitatorClient } from "@x402/core/server";

    const facilitatorClient = new HTTPFacilitatorClient({
      url: "https://x402.org/facilitator",
    });

    // Register scheme for Base Sepolia
    const server = new x402ResourceServer(facilitatorClient)
      .register("eip155:84532", new ExactEvmScheme());

    app.use(
      paymentMiddleware(
        {
          "GET /api": {
            accepts: [
              {
                scheme: "exact",
                price: "$0.001",
                network: "eip155:84532", // Base Sepolia
                payTo: "0xYourAddress",
              },
            ],
            description: "API endpoint",
          },
        },
        server,
      ),
    );
    ```
  </Tab>

  <Tab title="Go">
    ```go  theme={null}
    import (
        x402 "github.com/coinbase/x402/go"
        x402http "github.com/coinbase/x402/go/http"
        evm "github.com/coinbase/x402/go/mechanisms/evm/exact/server"
    )

    network := x402.Network("eip155:84532") // Base Sepolia

    r.Use(ginmw.X402Payment(ginmw.Config{
        Routes: x402http.RoutesConfig{
            "GET /api": {
                Scheme:  "exact",
                PayTo:   payTo,
                Price:   "$0.001",
                Network: network,
            },
        },
        Facilitator: facilitatorClient,
        Schemes: []ginmw.SchemeConfig{
            {Network: network, Server: evm.NewExactEvmScheme()},
        },
    }))
    ```
  </Tab>
</Tabs>

### Using a Custom Network

Since `@x402/evm` supports any EVM chain, you can configure networks not listed above:

```typescript  theme={null}
// Example: Using Ethereum mainnet with a custom facilitator
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://example.facilitator.com",
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:1", new ExactEvmScheme()); // Ethereum mainnet

app.use(
  paymentMiddleware(
    {
      "GET /api": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:1",
            payTo: "0xYourAddress",
            asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
          },
        ],
        description: "API endpoint",
      },
    },
    server,
  ),
);
```

### Multi-Network Support

Support multiple networks on the same endpoint:

```typescript  theme={null}
{
  "GET /api": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:8453",  // Base mainnet
        payTo: "0xYourEvmAddress",
      },
      {
        scheme: "exact",
        price: "$0.001",
        network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",  // Solana mainnet
        payTo: "YourSolanaAddress",
      },
    ],
    description: "Multi-network endpoint",
  },
}
```

## Running Your Own Facilitator

If you need to support networks or tokens not available through existing facilitators, you can run your own:

1. **Use the reference implementation**: The [x402 GitHub repository](https://github.com/coinbase/x402) contains facilitator code
2. **Use a community implementation**: Check the [x402 Ecosystem](https://www.x402.org/ecosystem?category=facilitators) for self-hostable options

## Next Steps

* [Quickstart for Sellers](/x402/quickstart-for-sellers) - Start accepting payments
* [Quickstart for Buyers](/x402/quickstart-for-buyers) - Start making payments
* [Core Concepts: Facilitator](/x402/core-concepts/facilitator) - Learn about facilitators
* [x402 Ecosystem](https://www.x402.org/ecosystem) - Explore facilitators and tools
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Migration Guide (v1 → v2)

This guide helps you migrate your x402 integration from v1 to v2. The v2 release introduces improved package structure, standardized network identifiers, and updated HTTP headers.

<Note>
  v2 is now the recommended version. While v1 continues to work, we encourage all users to migrate to v2 for the latest features and improvements.
</Note>

## What's New in v2

* **CAIP-2 Network Identifiers**: Industry-standard chain identification
* **Modular Package Structure**: Separate packages for core, mechanisms, and frameworks
* **New HTTP Headers**: Standardized header names
* **Extensions System**: Bazaar discovery, authentication extensions
* **Go SDK**: Full Go support alongside TypeScript

## Quick Migration Checklist

<Steps>
  <Step title="Update packages">
    Replace legacy packages with new modular packages
  </Step>

  <Step title="Update network identifiers">
    Change to CAIP-2 format (e.g., `base-sepolia` → `eip155:84532`)
  </Step>

  <Step title="Update headers">
    Change header names (`X-PAYMENT` → `PAYMENT-SIGNATURE`)
  </Step>

  <Step title="Update code patterns">
    Migrate to new middleware and client patterns
  </Step>
</Steps>

## Package Changes

### For Sellers (Server-Side)

| v1 Package       | v2 Packages                                  |
| ---------------- | -------------------------------------------- |
| `x402-express`   | `@x402/express` + `@x402/evm` or `@x402/svm` |
| `x402-next`      | `@x402/next` + `@x402/evm` or `@x402/svm`    |
| `x402-hono`      | `@x402/hono` + `@x402/evm` or `@x402/svm`    |
| `@coinbase/x402` | `@coinbase/x402@^2.0.0` (upgrade)            |

**Install v2 packages:**

```bash  theme={null}
# Express
npm uninstall x402-express
npm install @x402/express @coinbase/x402@^2.0.0

# Next.js
npm uninstall x402-next
npm install @x402/next @coinbase/x402@^2.0.0

# Hono
npm uninstall x402-hono
npm install @x402/hono @coinbase/x402@^2.0.0

# For EVM (Ethereum) support, add:
npm install @x402/evm

# For SVM (Solana) support, add:
npm install @x402/svm
```

### For Buyers (Client-Side)

| v1 Package   | v2 Packages                                |
| ------------ | ------------------------------------------ |
| `x402-fetch` | `@x402/fetch` + `@x402/evm` or `@x402/svm` |
| `x402-axios` | `@x402/axios` + `@x402/evm` or `@x402/svm` |

**Install v2 packages:**

```bash  theme={null}
# Fetch
npm uninstall x402-fetch
npm install @x402/fetch

# Axios
npm uninstall x402-axios
npm install @x402/axios

# For EVM (Ethereum) support, add:
npm install @x402/evm

# For SVM (Solana) support, add:
npm install @x402/svm
```

## Network Identifier Changes (CAIP-2)

v2 uses [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) format for network identifiers:

| v1 Network      | v2 Network (CAIP-2)                       |
| --------------- | ----------------------------------------- |
| `base-sepolia`  | `eip155:84532`                            |
| `base`          | `eip155:8453`                             |
| `solana-devnet` | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |
| `solana`        | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |

**Format explanation:**

* **EVM**: `eip155:{chainId}` where `chainId` is the network's chain ID (e.g., `8453` for Base mainnet, `84532` for Base Sepolia)
* **Solana**: `solana:{genesisHash}` using the truncated genesis hash of the cluster

## HTTP Header Changes

| v1 Header            | v2 Header           | Purpose                                        |
| -------------------- | ------------------- | ---------------------------------------------- |
| `X-PAYMENT`          | `PAYMENT-SIGNATURE` | Client → Server: Signed payment payload        |
| `X-PAYMENT-RESPONSE` | `PAYMENT-RESPONSE`  | Server → Client: Settlement confirmation       |
| (body)               | `PAYMENT-REQUIRED`  | Server → Client: Payment requirements (base64) |

<Note>
  v2 libraries check for both v1 and v2 header names for backward compatibility, but you should use the v2 headers for new implementations.
</Note>

## Schema Changes

### PaymentRequirements

| v1 Field            | v2 Field | Notes                 |
| ------------------- | -------- | --------------------- |
| `maxAmountRequired` | `amount` | Renamed               |
| `resource`          | (moved)  | Now in `ResourceInfo` |
| `description`       | (moved)  | Now in `ResourceInfo` |
| `mimeType`          | (moved)  | Now in `ResourceInfo` |

### Route Configuration

**v1:**

```typescript  theme={null}
{
  "GET /weather": {
    price: "$0.001",
    network: "base-sepolia",
    config: {
      description: "Weather data",
      mimeType: "application/json",
    }
  }
}
```

**v2:**

```typescript  theme={null}
{
  "GET /weather": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:84532",
        payTo: "0xYourAddress",
      },
    ],
    description: "Weather data",
    mimeType: "application/json",
  }
}
```

Key changes:

* Payment options moved to `accepts` array
* `payTo` included in each payment option
* `config` flattened to top level
* Network uses CAIP-2 format

## Code Migration Examples

### Seller: Express Middleware

**v1:**

```typescript  theme={null}
import { paymentMiddleware, Network } from "x402-express";
import { facilitator } from "@coinbase/x402";

app.use(paymentMiddleware(
  "0xYourAddress",
  {
    "GET /weather": {
      price: "$0.001",
      network: "base-sepolia",
      config: { description: "Weather data" }
    },
  },
  { url: "https://x402.org/facilitator" }
));
```

**v2:**

```typescript  theme={null}
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme());

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:84532",
            payTo: "0xYourAddress",
          },
        ],
        description: "Weather data",
        mimeType: "application/json",
      },
    },
    server,
  ),
);
```

### Seller: Next.js Middleware

**v1:**

```typescript  theme={null}
import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402";

export const middleware = paymentMiddleware(
  "0xYourAddress",
  { "/api/protected": { price: "$0.01", network: "base" } },
  facilitator,
);
```

**v2:**

```typescript  theme={null}
import { paymentProxy, x402ResourceServer } from "@x402/next";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:8453", new ExactEvmScheme());

export const middleware = paymentProxy(
  {
    "/api/protected": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.01",
          network: "eip155:8453",
          payTo: "0xYourAddress",
        },
      ],
      description: "Protected endpoint",
    },
  },
  server,
);
```

### Buyer: Fetch Client

**v1:**

```typescript  theme={null}
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";

const fetchWithPayment = wrapFetchWithPayment(fetch, account);
const response = await fetchWithPayment(url);
const paymentResponse = decodeXPaymentResponse(response);
```

**v2:**

```typescript  theme={null}
import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const signer = privateKeyToAccount(privateKey);

const client = new x402Client();
registerExactEvmScheme(client, { signer });

const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const response = await fetchWithPayment(url);

// Get payment receipt
const httpClient = new x402HTTPClient(client);
const paymentResponse = httpClient.getPaymentSettleResponse(
  (name) => response.headers.get(name)
);
```

### Buyer: Axios Client

**v1:**

```typescript  theme={null}
import { withPaymentInterceptor } from "x402-axios";

const client = withPaymentInterceptor(axios.create({ baseURL }), account);
```

**v2:**

```typescript  theme={null}
import { x402Client, withPaymentInterceptor } from "@x402/axios";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const signer = privateKeyToAccount(privateKey);

const x402client = new x402Client();
registerExactEvmScheme(x402client, { signer });

const client = withPaymentInterceptor(axios.create({ baseURL }), x402client);
```

## Multi-Network Support (New in v2)

v2 makes it easy to support multiple networks:

### Server-Side

```typescript  theme={null}
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:8453", new ExactEvmScheme())
  .register("eip155:84532", new ExactEvmScheme())
  .register("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", new ExactSvmScheme());

// Endpoint accepting multiple networks
{
  "GET /api": {
    accepts: [
      { scheme: "exact", price: "$0.01", network: "eip155:8453", payTo: evmAddress },
      { scheme: "exact", price: "$0.01", network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", payTo: solanaAddress },
    ],
  },
}
```

### Client-Side

```typescript  theme={null}
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { registerExactSvmScheme } from "@x402/svm/exact/client";

const client = new x402Client();
registerExactEvmScheme(client, { signer: evmSigner });
registerExactSvmScheme(client, { signer: svmSigner });

// Client automatically handles both EVM and Solana payments
```

## Python Users

<Warning>
  The Python SDK is currently under development for x402 v2. For immediate v2 support, use TypeScript or Go.
</Warning>

If you're currently using Python with v1, you have several options:

1. **Wait for the v2 Python SDK** - Check the [x402 Discord](https://discord.gg/cdp) for updates
2. **Migrate to TypeScript** - Use the Node.js SDK with full v2 support
3. **Migrate to Go** - Use the Go SDK with full v2 support
4. **Continue with v1** - v1 continues to work, though v2 is recommended

## Testing Your Migration

1. **Testnet First**: Always test on testnet (`eip155:84532` for Base Sepolia)
2. **Verify Headers**: Ensure `PAYMENT-SIGNATURE` and `PAYMENT-RESPONSE` headers are used
3. **Check Network Format**: Confirm CAIP-2 identifiers are correct
4. **Test Payment Flow**: Complete a full payment cycle

## Troubleshooting

### Common Issues

**"No scheme registered for network"**

* Use `.register(network, scheme)` to register a scheme for a specific CAIP-2 network identifier
* Use `.registerV1(network, scheme)` to register a v1 backwards-compatible implementation
* Verify the network identifier matches CAIP-2 format (e.g., `eip155:8453` not `base`)

<Note>
  The helper functions `registerExactEvmScheme()` and `registerExactSvmScheme()` will register schemes on your behalf for convenience. However, they may over-register for networks you don't need. If you want fine-grained control over which networks are registered, call `.register()` or `.registerV1()` directly.
</Note>

**Payment not processing**

* Check that headers use the v2 names
* Verify the `accepts` array in route configuration

**Response parsing fails**

* Use `x402HTTPClient.getPaymentSettleResponse()` instead of `decodeXPaymentResponse()`
* Check for `PAYMENT-RESPONSE` header (not `X-PAYMENT-RESPONSE`)

## Support

* [x402 Discord](https://discord.gg/cdp) - Get help from the community
* [GitHub Issues](https://github.com/coinbase/x402/issues) - Report bugs or request features
* [Quickstart for Sellers](/x402/quickstart-for-sellers) - Full v2 seller guide
* [Quickstart for Buyers](/x402/quickstart-for-buyers) - Full v2 buyer guide
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Building Miniapps with x402

This guide explains how to build Farcaster Mini Apps that integrate x402 payments using our official example. The example provides a complete starting point with wallet integration, payment protection, and responsive design.

## What are Mini Apps?

Mini Apps are lightweight applications that run inside Farcaster clients. Built with [MiniKit](https://docs.base.org/builderkits/minikit/overview) and [OnchainKit](https://docs.base.org/onchainkit/latest/components/minikit/overview), they provide a native app-like experience while leveraging the social graph and wallet capabilities of Farcaster. By integrating x402, your Mini App can accept instant USDC payments without requiring users to leave the app or manage complex payment flows.

## Why x402 for Mini Apps?

x402 is particularly well-suited for Mini Apps because:

* **Seamless Payments**: Users pay without leaving the Mini App experience
* **No Account Setup**: Works directly with connected wallets
* **Instant Monetization**: Builders can monetize their content or services directly
* **Simple Integration**: Payment protection with just the `withX402` wrapper
* **No CDP API Keys Required**: Uses external facilitator directly

## Prerequisites

Before starting, ensure you have:

* Node.js 22+ and pnpm v10 installed
* USDC on Base Sepolia testnet (for testing)
* A wallet address to receive payments
* An [OnchainKit API key](https://onchainkit.xyz) (optional, for enhanced wallet features)

## Quick Start with the Official Example

The fastest way to build an x402-powered Mini App is using our official example:

```bash  theme={null}
# Clone the x402 repository
git clone https://github.com/coinbase/x402.git
cd x402/examples/typescript

# Install dependencies and build packages
pnpm install && pnpm build

# Navigate to the miniapp example
cd fullstack/miniapp

# Copy environment variables
cp .env-local .env

# Configure your environment (see below)
# Then start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

The Mini App example uses:

* **Frontend**: Next.js 16, React 19, Tailwind CSS 4
* **Wallet**: OnchainKit 1.1.2, Wagmi
* **Payments**: x402 v2 SDK (`@x402/next`, `@x402/fetch`, `@x402/evm`)
* **Farcaster**: Mini App SDK for Mini App detection

## Environment Configuration

Create a `.env` file with the following variables:

```env  theme={null}
# x402 Payment Configuration (required)
FACILITATOR_URL=https://x402.org/facilitator
EVM_ADDRESS=0xYourWalletAddress

# OnchainKit Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=x402 Mini App

# App URLs and Images
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_APP_HERO_IMAGE=https://example.com/app-logo.png
NEXT_PUBLIC_SPLASH_IMAGE=https://example.com/app-logo-200x200.png
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#3b82f6
NEXT_PUBLIC_ICON_URL=https://example.com/app-logo.png
```

### Getting Configuration Values

1. **EVM\_ADDRESS**: Your wallet address to receive payments
2. **FACILITATOR\_URL**: Use `https://x402.org/facilitator` for testnet, or the CDP facilitator for mainnet
3. **OnchainKit API Key**: Get from [OnchainKit](https://onchainkit.xyz) (optional but recommended)

## How It Works

### Server-Side: Protected API Routes

The Mini App uses the `withX402` wrapper to protect API routes. This wrapper:

1. Returns a 402 Payment Required response with payment requirements
2. Validates the payment signature when provided
3. Only settles payment after a successful response (status \< 400)

```typescript  theme={null}
// app/api/protected/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.FACILITATOR_URL,
});

// Create x402 resource server and register EVM scheme
const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

// Handler function - only called after payment is verified
const handler = async (_: NextRequest) => {
  return NextResponse.json({
    success: true,
    message: "Protected action completed successfully",
    timestamp: new Date().toISOString(),
    data: {
      secretMessage: "This content was paid for with x402!",
      accessedAt: Date.now(),
    },
  });
};

// Export wrapped handler with payment requirements
export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.01",
        network: "eip155:84532", // Base Sepolia
        payTo: process.env.EVM_ADDRESS as `0x${string}`,
      },
    ],
    description: "Access to protected Mini App API",
    mimeType: "application/json",
  },
  server,
);
```

### Client-Side: Payment Handling

The frontend uses `@x402/fetch` with the connected wallet to handle payments automatically:

```typescript  theme={null}
// app/page.tsx
"use client";

import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import type { ClientEvmSigner } from "@x402/evm";
import type { WalletClient, Account } from "viem";
import { useWalletClient } from "wagmi";

/**
 * Converts a wagmi/viem WalletClient to a ClientEvmSigner for x402Client
 */
function wagmiToClientSigner(walletClient: WalletClient): ClientEvmSigner {
  if (!walletClient.account) {
    throw new Error("Wallet client must have an account");
  }

  return {
    address: walletClient.account.address,
    signTypedData: async (message) => {
      const signature = await walletClient.signTypedData({
        account: walletClient.account as Account,
        domain: message.domain,
        types: message.types,
        primaryType: message.primaryType,
        message: message.message,
      });
      return signature;
    },
  };
}

export default function App() {
  const { data: walletClient } = useWalletClient();

  const handleProtectedAction = async () => {
    if (!walletClient) {
      console.error("Wallet not connected");
      return;
    }

    // Create x402 client and register EVM scheme with wagmi signer
    const client = new x402Client();
    const signer = wagmiToClientSigner(walletClient);
    registerExactEvmScheme(client, { signer });

    // Wrap fetch with payment handling
    const fetchWithPayment = wrapFetchWithPayment(fetch, client);

    // Make request - payment is handled automatically
    const response = await fetchWithPayment("/api/protected", {
      method: "GET",
    });

    const data = await response.json();
    console.log("Response:", data);
  };

  return (
    <button onClick={handleProtectedAction}>
      Call Protected API ($0.01)
    </button>
  );
}
```

### Wallet Integration with OnchainKit

The example uses OnchainKit for wallet connection. The provider setup enables MiniKit for Farcaster integration:

```typescript  theme={null}
// app/providers.tsx
"use client";

import { baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={baseSepolia}
      config={{
        appearance: {
          mode: "auto", // 'light' | 'dark' | 'auto'
        },
        wallet: {
          display: "modal", // 'modal' | 'drawer'
          preference: "all", // 'all' | 'smartWalletOnly' | 'eoaOnly'
        },
      }}
      miniKit={{
        enabled: true,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
```

### Farcaster Mini App Detection

The app detects when it's running inside Farcaster using the Mini App SDK:

```typescript  theme={null}
import { sdk } from "@farcaster/miniapp-sdk";

useEffect(() => {
  const initMiniApp = async () => {
    await sdk.actions.ready();
    const isInMiniApp = await sdk.isInMiniApp();
    console.log("Running in Mini App:", isInMiniApp);
  };
  initMiniApp();
}, []);
```

## Adding More Protected Routes

Create additional protected endpoints by adding new route files:

```typescript  theme={null}
// app/api/premium/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";

const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.FACILITATOR_URL,
});

const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

const handler = async (_: NextRequest) => {
  return NextResponse.json({ message: "Premium content!" });
};

export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.10", // Higher price for premium content
        network: "eip155:84532",
        payTo: process.env.EVM_ADDRESS as `0x${string}`,
      },
    ],
    description: "Premium content access",
    mimeType: "application/json",
  },
  server,
);
```

## Response Format

### Payment Required (402)

When a request is made without payment:

```
HTTP/1.1 402 Payment Required
Content-Type: application/json
PAYMENT-REQUIRED: <base64-encoded JSON>
```

The `PAYMENT-REQUIRED` header contains:

```json  theme={null}
{
  "x402Version": 2,
  "error": "Payment required",
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:84532",
      "amount": "10000",
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "payTo": "0x...",
      "maxTimeoutSeconds": 300,
      "extra": { "name": "USDC", "version": "2" }
    }
  ]
}
```

### Successful Response

After payment:

```json  theme={null}
{
  "success": true,
  "message": "Protected action completed successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "secretMessage": "This content was paid for with x402!",
    "accessedAt": 1704067200000
  }
}
```

## Network Identifiers

Network identifiers use [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) format:

| Network                | CAIP-2 Identifier |
| ---------------------- | ----------------- |
| Base Sepolia (testnet) | `eip155:84532`    |
| Base (mainnet)         | `eip155:8453`     |

## Going to Production

To deploy your Mini App on mainnet:

1. **Update the facilitator URL** to use the CDP facilitator:
   ```env  theme={null}
   FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
   ```

2. **Update the network** in your route configuration:
   ```typescript  theme={null}
   network: "eip155:8453", // Base mainnet
   ```

3. **Use a mainnet wallet address** for `EVM_ADDRESS`

4. **Deploy to Vercel** or your preferred hosting platform

<Warning>
  Mainnet transactions involve real money. Always test thoroughly on testnet first.
</Warning>

## Best Practices

### User Experience

* **Show prices clearly**: Display the payment amount before requiring payment
* **Loading states**: Show progress during payment processing
* **Error handling**: Provide clear error messages and recovery options
* **Success feedback**: Confirm successful payments immediately

### Security

* **Environment variables**: Never commit sensitive keys to version control
* **Server validation**: Always verify payments server-side with `withX402`
* **Network checking**: Ensure users are on the correct network

## Troubleshooting

### Payment Not Processing

```typescript  theme={null}
// Ensure wallet client is available before making requests
if (!walletClient) {
  console.error("Wallet client not available");
  return;
}
```

### Mini App Not Detected

```typescript  theme={null}
// SDK may not be available outside Farcaster
try {
  await sdk.actions.ready();
  const isInMiniApp = await sdk.isInMiniApp();
} catch (error) {
  console.log("Not running in Mini App context");
}
```

### Wrong Network

Ensure users are connected to Base Sepolia (testnet) or Base (mainnet) depending on your configuration.

## Resources

* [Full Mini App Example](https://github.com/coinbase/x402/tree/main/examples/typescript/fullstack/miniapp)
* [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
* [OnchainKit Documentation](https://onchainkit.xyz)
* [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview)
* [x402 Protocol Documentation](/x402/welcome)
* [CDP Discord Community](https://discord.gg/cdp)
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MCP Server with x402

[Model Context Protocol (MCP)](https://www.modelcontextprotocol.io/) is a protocol for passing context between LLMs and other AI agents. This page shows how to use the x402 payment protocol with MCP to make paid API requests through an MCP server, and how to connect it to Claude Desktop.

## What is this integration?

This guide walks you through running an MCP server that can access paid APIs using the x402 protocol. The MCP server acts as a bridge between Claude Desktop (or any MCP-compatible client) and a paid API (such as the sample weather API in the x402 repo). When Claude (or another agent) calls a tool, the MCP server will:

1. Detect if the API requires payment (via HTTP 402 with `PAYMENT-REQUIRED` header)
2. Automatically handle the payment using your wallet via the registered x402 scheme
3. Return the paid data to the client (e.g., Claude)

This lets you (or your agent) access paid APIs programmatically, with no manual payment steps.

## Prerequisites

* Node.js v20+ (install via [nvm](https://github.com/nvm-sh/nvm))
* pnpm v10 (install via [pnpm.io/installation](https://pnpm.io/installation))
* An x402-compatible server to connect to (for this demo, we'll use the [sample express server with weather data](https://github.com/coinbase/x402/tree/main/examples/typescript/servers/express) from the x402 repo, or any external x402 API)
* An Ethereum wallet with USDC (on Base Sepolia or Base Mainnet) and/or a Solana wallet with USDC (on Devnet or Mainnet)
* [Claude Desktop with MCP support](https://claude.ai/download)

## Quick Start

### 1. Install and Build

```bash  theme={null}
# Clone the x402 repository
git clone https://github.com/coinbase/x402.git
cd x402/examples/typescript

# Install dependencies and build packages
pnpm install && pnpm build

# Navigate to the MCP client example
cd clients/mcp
```

### 2. Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration:

```json  theme={null}
{
  "mcpServers": {
    "demo": {
      "command": "pnpm",
      "args": [
        "--silent",
        "-C",
        "<absolute path to this repo>/examples/typescript/clients/mcp",
        "dev"
      ],
      "env": {
        "EVM_PRIVATE_KEY": "<private key of a wallet with USDC on Base Sepolia>",
        "SVM_PRIVATE_KEY": "<base58-encoded private key of a Solana wallet with USDC on Devnet>",
        "RESOURCE_SERVER_URL": "http://localhost:4021",
        "ENDPOINT_PATH": "/weather"
      }
    }
  }
}
```

### 3. Start the x402 Server

Make sure your x402-compatible server is running at the URL specified in `RESOURCE_SERVER_URL`:

```bash  theme={null}
# In another terminal, from the examples/typescript directory
cd servers/express
pnpm dev
```

### 4. Restart Claude Desktop

Restart Claude Desktop to load the new MCP server, then ask Claude to use the `get-data-from-resource-server` tool.

## Environment Variables

| Variable              | Description                                       | Required                   |
| --------------------- | ------------------------------------------------- | -------------------------- |
| `EVM_PRIVATE_KEY`     | Your EVM wallet's private key (0x prefixed)       | One of EVM or SVM required |
| `SVM_PRIVATE_KEY`     | Your Solana wallet's private key (base58 encoded) | One of EVM or SVM required |
| `RESOURCE_SERVER_URL` | The base URL of the paid API                      | Yes                        |
| `ENDPOINT_PATH`       | The specific endpoint path (e.g., `/weather`)     | Yes                        |

## Implementation

The MCP server uses `@x402/axios` to wrap axios with automatic payment handling:

```typescript  theme={null}
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { x402Client, wrapAxiosWithPayment } from "@x402/axios";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { registerExactSvmScheme } from "@x402/svm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";
import { config } from "dotenv";

config();

const evmPrivateKey = process.env.EVM_PRIVATE_KEY as `0x${string}`;
const svmPrivateKey = process.env.SVM_PRIVATE_KEY as string;
const baseURL = process.env.RESOURCE_SERVER_URL || "http://localhost:4021";
const endpointPath = process.env.ENDPOINT_PATH || "/weather";

if (!evmPrivateKey && !svmPrivateKey) {
  throw new Error("At least one of EVM_PRIVATE_KEY or SVM_PRIVATE_KEY must be provided");
}

/**
 * Creates an axios client configured with x402 payment support for EVM and/or SVM.
 */
async function createClient() {
  const client = new x402Client();

  // Register EVM scheme if private key is provided
  if (evmPrivateKey) {
    const evmSigner = privateKeyToAccount(evmPrivateKey);
    registerExactEvmScheme(client, { signer: evmSigner });
  }

  // Register SVM scheme if private key is provided
  if (svmPrivateKey) {
    const svmSigner = await createKeyPairSignerFromBytes(base58.decode(svmPrivateKey));
    registerExactSvmScheme(client, { signer: svmSigner });
  }

  return wrapAxiosWithPayment(axios.create({ baseURL }), client);
}

async function main() {
  const api = await createClient();

  // Create an MCP server
  const server = new McpServer({
    name: "x402 MCP Client Demo",
    version: "2.0.0",
  });

  // Add a tool that calls the paid API
  server.tool(
    "get-data-from-resource-server",
    "Get data from the resource server (in this example, the weather)",
    {},
    async () => {
      const res = await api.get(endpointPath);
      return {
        content: [{ type: "text", text: JSON.stringify(res.data) }],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
```

## How It Works

The MCP server exposes a tool that, when called, fetches data from a paid API endpoint. If the endpoint requires payment, the x402 axios wrapper automatically handles the payment handshake:

1. **402 Response**: The server returns HTTP 402 with `PAYMENT-REQUIRED` header
2. **Parse Requirements**: The wrapper extracts payment requirements from the header
3. **Create Payment**: Uses the registered scheme (EVM or SVM) to create a payment payload
4. **Retry Request**: Sends the original request with the `PAYMENT-SIGNATURE` header
5. **Return Data**: Once payment is verified, the data is returned to Claude

## Multi-Network Support

The example supports both EVM (Base, Ethereum) and Solana networks. The x402 client automatically selects the appropriate scheme based on the payment requirements:

```typescript  theme={null}
import { x402Client, wrapAxiosWithPayment } from "@x402/axios";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { registerExactSvmScheme } from "@x402/svm/exact/client";

const client = new x402Client();

// Register EVM scheme for Base/Ethereum payments
registerExactEvmScheme(client, { signer: evmSigner });

// Register SVM scheme for Solana payments
registerExactSvmScheme(client, { signer: svmSigner });

// Now handles both EVM and Solana networks automatically
const httpClient = wrapAxiosWithPayment(axios.create({ baseURL }), client);
```

When the server returns a 402 response, the client checks the `network` field in the payment requirements:

* `eip155:*` networks use the EVM scheme
* `solana:*` networks use the SVM scheme

## Response Handling

### Payment Required (402)

When a payment is required, the client receives:

```
HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: <base64-encoded JSON>
```

The wrapper automatically:

1. Parses the payment requirements
2. Creates and signs a payment using the appropriate scheme
3. Retries the request with the `PAYMENT-SIGNATURE` header

### Successful Response

After payment is processed, the MCP server returns:

```json  theme={null}
{
  "content": [
    {
      "type": "text",
      "text": "{\"report\":{\"weather\":\"sunny\",\"temperature\":70}}"
    }
  ]
}
```

## Dependencies

The example uses these x402 v2 packages:

```json  theme={null}
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.9.0",
    "@x402/axios": "workspace:*",
    "@x402/evm": "workspace:*",
    "@x402/svm": "workspace:*",
    "axios": "^1.13.2",
    "viem": "^2.39.0",
    "@solana/kit": "^2.1.1",
    "@scure/base": "^1.2.6"
  }
}
```

## How the Pieces Fit Together

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Desktop │────▶│   MCP Server    │────▶│  x402 API       │
│                 │     │  (x402 client)  │     │  (paid endpoint)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  1. Call tool         │  2. GET /weather      │
        │                       │                       │
        │                       │  3. 402 + requirements│
        │                       │◀──────────────────────│
        │                       │                       │
        │                       │  4. Sign payment      │
        │                       │                       │
        │                       │  5. Retry with payment│
        │                       │──────────────────────▶│
        │                       │                       │
        │                       │  6. 200 + data        │
        │                       │◀──────────────────────│
        │                       │                       │
        │  7. Return response   │                       │
        │◀──────────────────────│                       │
```

* **x402-compatible server**: Hosts the paid API (e.g., weather data). Responds with HTTP 402 and `PAYMENT-REQUIRED` header if payment is required.
* **MCP server (this implementation)**: Acts as a bridge, handling payment via `@x402/axios` and exposing tools to MCP clients.
* **Claude Desktop**: Calls the MCP tool, receives the paid data, and displays it to the user.

## Next Steps

* [See the full example in the repo](https://github.com/coinbase/x402/tree/main/examples/typescript/clients/mcp)
* Try integrating with your own x402-compatible APIs
* Extend the MCP server with more tools or custom logic as needed
* [Learn about building x402 servers](/x402/quickstart-for-sellers)
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.cdp.coinbase.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FAQ

<Info>
  Need help? Join the [x402 Discord](https://discord.gg/cdp) for the latest updates.
</Info>

## General

### What *is* x402 in a single sentence?

x402 is an open-source protocol that turns the dormant HTTP `402 Payment Required` status code into a fully-featured, on-chain payment layer for APIs, websites, and autonomous agents.

### Why not use traditional payment rails or API keys?

Traditional rails require credit-card networks, user accounts, and multi-step UI flows.
x402 removes those dependencies, enabling programmatic, HTTP-native payments (perfect for AI agents) while dropping fees to near-zero and settling in \~1 second.

### Is x402 only for crypto-native projects?

No. Any web API or content provider (crypto or web2) can integrate x402 if it wants a lower-cost, friction-free payment path for small or usage-based transactions.

## Language & Framework Support

### What languages and frameworks are supported?

**Fully Supported (v2):**

* **TypeScript/Node.js**: Express, Next.js, Hono (server); Fetch, Axios (client)
* **Go**: Gin, net/http (server and client)

**Coming Soon:**

* **Python**: Currently under development for x402 v2

The x402 protocol is **open** - nothing prevents you from implementing the spec in other languages. If you're interested in building support for your favorite language, please [open an issue](https://github.com/coinbase/x402/issues) and let us know!

### What packages should I use?

| Use Case       | Package                       |
| -------------- | ----------------------------- |
| Express server | `@x402/express` + `@x402/evm` |
| Next.js server | `@x402/next` + `@x402/evm`    |
| Hono server    | `@x402/hono` + `@x402/evm`    |
| Fetch client   | `@x402/fetch` + `@x402/evm`   |
| Axios client   | `@x402/axios` + `@x402/evm`   |
| Solana support | `@x402/svm`                   |
| Go             | `github.com/coinbase/x402/go` |

## Facilitators

### Who runs facilitators today?

Coinbase Developer Platform operates the first production facilitator. The protocol, however, is **permissionless** and anyone can run a facilitator. Expect:

* Community-run facilitators for other networks or assets.
* Private facilitators for enterprises that need custom KYT / KYC flows.

### What stops a malicious facilitator from stealing funds or lying about settlement?

Every payment payload is **signed by the buyer** and settles **directly on-chain**.
A facilitator that tampers with the transaction will fail signature checks.

## Pricing & Schemes

### How should I price my endpoint?

There is no single answer, but common patterns are:

* **Flat per-call** (e.g., `$0.001` per request)
* **Tiered** (`/basic` vs `/pro` endpoints with different prices)
* **Up-to** (work in progress): "pay-up-to" where the final cost equals usage (tokens, MB, etc.)

### Can I integrate x402 with a usage / plan manager like Metronome?

Yes. x402 handles the **payment execution**. You can still meter usage, aggregate calls, or issue prepaid credits in Metronome and only charge when limits are exceeded. Example glue code is coming soon.

## Assets, Networks & Fees

### Which assets and networks are supported today?

**CDP Facilitator supports:**

| Network       | CAIP-2 Identifier                         | Asset      | Fees\*   | Status  |
| ------------- | ----------------------------------------- | ---------- | -------- | ------- |
| Base          | `eip155:8453`                             | USDC       | fee-free | Mainnet |
| Base Sepolia  | `eip155:84532`                            | USDC       | fee-free | Testnet |
| Solana        | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | SPL Tokens | fee-free | Mainnet |
| Solana Devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | SPL Tokens | fee-free | Testnet |

*Gas is paid on-chain; CDP's x402 facilitator adds zero facilitator fee to buyers.*

### What is CAIP-2?

CAIP-2 (Chain Agnostic Improvement Proposal 2) is a standard format for identifying blockchain networks. x402 v2 uses this format:

* **EVM**: `eip155:{chainId}` (e.g., `eip155:8453` for Base)
* **Solana**: `solana:{genesisHash}` (e.g., `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`)

### I need support for additional networks like Polygon or Avalanche. What should I do?

CDP is actively expanding network support. In the meantime:

1. Run your own facilitator - the x402 codebase supports Polygon, Avalanche, and other networks
2. Submit a feature request through CDP support channels
3. Check the [x402 Discord](https://discord.gg/cdp) for updates on network expansion

## Security

### Do I have to expose my private key to my backend?

No. The recommended pattern is:

1. **Buyers** (clients/agents) sign locally in their runtime (browser, serverless, agent VM). You can use [CDP Server Wallet](/server-wallets/v2/introduction/quickstart) to create a programmatic wallet.
2. **Sellers** never hold the buyer's key; they only verify signatures.

### How do refunds work?

The current `exact` scheme is a **push payment** and irreversible once executed. Two options:

1. **Business-logic refunds**: Seller sends a new USDC transfer back to the buyer.
2. **Escrow schemes**: Future spec could add conditional transfers (e.g., HTLCs or hold invoices).

## Usage by AI Agents

### How does an agent know what to pay?

Agents follow the same flow as humans:

1. Make a request.
2. Parse the `PAYMENT-REQUIRED` header (base64-encoded payment requirements).
3. Choose a suitable requirement from the `accepts` array and sign a payload via the x402 client SDKs.
4. Retry with `PAYMENT-SIGNATURE` header.

### Do agents need wallets?

Yes. Programmatic wallets (e.g., **CDP Server Wallet**, `viem`, `ethers-v6` HD wallets) let agents sign payment payloads without exposing seed phrases.

## Protocol & Headers

### What headers does x402 use?

| Header              | Direction       | Purpose                                               |
| ------------------- | --------------- | ----------------------------------------------------- |
| `PAYMENT-REQUIRED`  | Server → Client | Base64-encoded payment requirements (in 402 response) |
| `PAYMENT-SIGNATURE` | Client → Server | Base64-encoded signed payment payload                 |
| `PAYMENT-RESPONSE`  | Server → Client | Settlement confirmation                               |

### What is x402 extensions?

Extensions are optional features that can be added to the x402 protocol:

* **Bazaar**: Service discovery extension for listing your API in the x402 marketplace
* **Sign-in-with-x**: Authentication extension (coming soon)

Enable extensions via the `extensions` field in your route configuration.

## Governance & Roadmap

### Is there a formal spec or whitepaper?

* Spec: [GitHub Specification](https://github.com/coinbase/x402/tree/main/specs)
* [Whitepaper](https://www.x402.org/x402-whitepaper.pdf)

### How will x402 evolve?

Tracked in public GitHub issues + community RFCs. Major themes:

* Multi-asset support
* Additional schemes (`upto`, `stream`, `permit2`)
* Discovery layer for service search & reputation

### Why is x402 hosted in the Coinbase GitHub?

x402 is an open protocol developed by Coinbase in partnership with ecosystem contributors including Cloudflare. While the reference implementations currently live in the Coinbase GitHub, x402 is designed as a vendor-neutral standard. We're working toward launching an independent x402 Foundation to steward the protocol's long-term governance and development. The protocol specification, SDKs, and tooling are fully open source, and we welcome contributions from the community.

## Troubleshooting

### I keep getting `402 Payment Required`, even after attaching the payment header. Why?

1. Ensure you're using `PAYMENT-SIGNATURE` header (not the legacy `X-PAYMENT` header).
2. Signature is invalid (wrong chain ID or payload fields).
3. Payment amount \< required amount.
4. Address has insufficient USDC or was flagged by KYT.
   Check the `error` field in the server's JSON response for details.

### My test works on Base Sepolia but fails on Base mainnet. What changed?

* Ensure you set `network: "eip155:8453"` (not `"eip155:84532"` for testnet).
* Make sure you're using a facilitator that supports mainnet (the x402.org testnet facilitator does NOT support mainnet).
* Confirm you have the correct asset address for the network you're using.
* Confirm your wallet has **mainnet** USDC.
* Gas fees are higher on mainnet; fund the wallet with a small amount of ETH for gas.

### I'm seeing "No scheme registered" errors

Ensure you've registered the appropriate scheme for the network:

```typescript  theme={null}
// Client-side
import { registerExactEvmScheme } from "@x402/evm/exact/client";
const client = new x402Client();
registerExactEvmScheme(client, { signer });

// Server-side
import { ExactEvmScheme } from "@x402/evm/exact/server";
const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:8453", new ExactEvmScheme());
```

## Still have questions?

* Reach out in the [Discord channel](https://discord.gg/cdp)
* Open a GitHub Discussion or Issue in the [x402 repo](https://github.com/coinbase/x402)
