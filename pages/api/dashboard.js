import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method === "POST") {
    const { customerId, reason, licenseType } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, error: "Missing customerId" });
    }

    if (action === "whitelist") {
      let productsOwned = { monospace0: false, polaris0: false };

      if (licenseType === "monospace") {
        productsOwned.monospace0 = true;
      } else if (licenseType === "polaris") {
        productsOwned.polaris0 = true;
      } else if (licenseType === "both") {
        productsOwned = { monospace0: true, polaris0: true };
      }

      await kv.set(`whitelist:${customerId}`, { productsOwned });
      return res.status(200).json({ success: true, message: `Customer ${customerId} whitelisted for ${licenseType}` });
    }

    if (action === "blacklist") {
      await kv.set(`blacklist:${customerId}`, { enabled: true, reason: reason || "Manual blacklist", level: 2 });
      return res.status(200).json({ success: true, message: `Customer ${customerId} blacklisted` });
    }

    if (action === "unblacklist") {
      await kv.del(`blacklist:${customerId}`);
      return res.status(200).json({ success: true, message: `Customer ${customerId} unblacklisted` });
    }

    return res.status(400).json({ success: false, error: "Unknown action" });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
