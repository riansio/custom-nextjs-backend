// api/whitelist/addGift.js
import { kv } from "@vercel/kv";

async function safeKVSet(key, value, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await kv.set(key, value);
      return true;
    } catch (err) {
      console.error(`KV set failed (attempt ${attempt}):`, err);
      if (attempt < retries) await new Promise(r => setTimeout(r, delay));
      else throw err;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { recipientId, devProductId } = req.body;
    if (!recipientId || !devProductId) return res.status(400).json({ error: "Missing recipientId or devProductId" });

    let record = await kv.get(`whitelist:${recipientId}`);
    if (!record) record = { userId: recipientId, productsOwned: { monospace0: false, polaris0: false } };

    // Flip only if not already owned
    if (devProductId === "3543557050" && !record.productsOwned.monospace0) {
      record.productsOwned.monospace0 = true;
    } else if (devProductId === "3543534723" && !record.productsOwned.polaris0) {
      record.productsOwned.polaris0 = true;
    }

    await safeKVSet(`whitelist:${recipientId}`, record);

    return res.status(200).json({ success: true, productsOwned: record.productsOwned });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error after retries" });
  }
}
