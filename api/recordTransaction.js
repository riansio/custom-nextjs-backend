import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerId, devProductId, productId, type } = req.body;
  if (!customerId || !devProductId || !productId || !type) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Fetch or initialize record
  let record = await kv.get(`whitelist:${customerId}`) || { productsOwned: {} };

  // Flip entitlements based on productId
  if (productId === "3543557050") {
    record.productsOwned.monospace0 = true; // MonoSpace
  }
  if (productId === "3543534723") {
    record.productsOwned.polaris0 = true; // Polaris always flipped
  }

  // Save updated record
  await kv.set(`whitelist:${customerId}`, record);

  // Log transaction for audit
  await kv.lpush("transactions", {
    timestamp: Date.now(),
    customerId,
    devProductId,
    productId,
    type
  });

  // Respond with entitlement status
  return res.status(200).json({
    success: true,
    customerId,
    productsOwned: record.productsOwned,
    note: record.productsOwned.monospace0
      ? "Polaris usable because MonoSpace is owned."
      : "Polaris purchased, but requires MonoSpace license to boot."
  });
}
