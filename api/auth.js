import { kv } from "@vercel/kv";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { customerId } = req.body || req.query;
  if (!customerId) {
    return res.status(400).json({ success: false, error: "Missing customerId" });
  }

  const OWNER_ID = "2776050820";

  // ✅ Always authorize the loader creator
  if (customerId.toString() === OWNER_ID) {
    return res.status(200).json({
      success: true,
      productsOwned: { monospace0: true, polaris0: true }
    });
  }

  // ✅ Auto-detect groups owned by the loader creator
  try {
    const groupRes = await fetch(
      `https://groups.roblox.com/v1/users/${OWNER_ID}/groups/roles`
    );
    const groupData = await groupRes.json();

    const ownedGroups = groupData.data.filter(
      g => g.role && g.role.rank === 255 // rank 255 = Owner
    );

    const ownedGroupIds = ownedGroups.map(g => g.group.id.toString());

    if (ownedGroupIds.includes(customerId.toString())) {
      return res.status(200).json({
        success: true,
        productsOwned: { monospace0: true, polaris0: true }
      });
    }
  } catch (err) {
    console.error("Group ownership check failed:", err);
  }

  // 🔒 Otherwise, check entitlements normally
  const record = await kv.get(`whitelist:${customerId}`);
  if (!record) {
    // No licenses at all
    return res.status(200).json({
      success: true,
      productsOwned: { monospace0: false, polaris0: false }
    });
  }

  const { productsOwned } = record;

  // ✅ Enforce strict hierarchy
  if (productsOwned.monospace0 && productsOwned.polaris0) {
    // Both licenses owned → allow both
    return res.status(200).json({
      success: true,
      productsOwned: { monospace0: true, polaris0: true }
    });
  }

  if (productsOwned.monospace0 && !productsOwned.polaris0) {
    // Only MonoSpace owned → allow MonoSpace only
    return res.status(200).json({
      success: true,
      productsOwned: { monospace0: true, polaris0: false }
    });
  }

  // Merge both cases:
  // - Polaris only (without MonoSpace)
  // - Neither owned
  return res.status(200).json({
    success: true,
    productsOwned: { monospace0: false, polaris0: false }
  });
}
