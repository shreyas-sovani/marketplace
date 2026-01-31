// Test if route config changes are seen after middleware creation
const routeConfig: any = {
  "GET /test1": { accepts: { scheme: 'exact', price: "$0.01", network: "eip155:84532", payTo: "0x123" } }
};

console.log("Before middleware creation:", Object.keys(routeConfig));

// Simulate middleware capturing routeConfig
const capturedRef = routeConfig;

// Add more routes AFTER
routeConfig["GET /test2"] = { accepts: { scheme: 'exact', price: "$0.02", network: "eip155:84532", payTo: "0x123" } };

console.log("After adding test2:", Object.keys(routeConfig));
console.log("Captured ref sees:", Object.keys(capturedRef));

// If both match, then reference is maintained
console.log("Same object?", routeConfig === capturedRef);
