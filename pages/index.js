import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { action, session } = req.query;

  // Login page
  if (req.method === "GET" && !session) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Login</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #74ABE2, #5563DE);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .glass {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            padding: 2rem;
            box-shadow: 0 4px 30px rgba(0,0,0,0.1);
            color: #fff;
            width: 300px;
            text-align: center;
          }
          input, button {
            width: 100%;
            margin: 0.5rem 0;
            padding: 0.7rem;
            border: none;
            border-radius: 8px;
          }
          button {
            background: #5563DE;
            color: #fff;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="glass">
          <h2>Admin Login</h2>
          <form method="POST" action="/?action=login">
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  // Handle login
  if (req.method === "POST" && action === "login") {
    const { username, password } = req.body;
    if (username === "adaantik22" && password === "2776050820") {
      return res.redirect("/?session=ok");
    }
    return res.status(403).send("Invalid credentials");
  }

  // Dashboard UI
  if (req.method === "GET" && session === "ok") {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Dashboard</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #74ABE2, #5563DE);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .glass {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            padding: 2rem;
            box-shadow: 0 4px 30px rgba(0,0,0,0.1);
            color: #fff;
            width: 400px;
          }
          h1, h2 { text-align: center; }
          form { margin: 1rem 0; }
          input, select, button {
            width: 100%;
            margin: 0.5rem 0;
            padding: 0.7rem;
            border: none;
            border-radius: 8px;
          }
          button {
            background: #5563DE;
            color: #fff;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="glass">
          <h1>Admin Dashboard</h1>

          <h2>Whitelist User</h2>
          <form method="POST" action="/?action=whitelist&session=ok">
            <input type="text" name="customerId" placeholder="Customer ID" required />
            <select name="licenseType" required>
              <option value="monospace">MonoSpace Only</option>
              <option value="polaris">Polaris Only</option>
              <option value="both">Both MonoSpace + Polaris</option>
            </select>
            <button type="submit">Whitelist</button>
          </form>

          <h2>Blacklist User</h2>
          <form method="POST" action="/?action=blacklist&session=ok">
            <input type="text" name="customerId" placeholder="Customer ID" required />
            <input type="text" name="reason" placeholder="Reason (optional)" />
            <button type="submit">Blacklist</button>
          </form>

          <h2>Unblacklist User</h2>
          <form method="POST" action="/?action=unblacklist&session=ok">
            <input type="text" name="customerId" placeholder="Customer ID" required />
            <button type="submit">Unblacklist</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  // Handle actions
  if (req.method === "POST" && session === "ok") {
    const { customerId, reason, licenseType } = req.body;

    if (!customerId) {
      return res.status(400).send("Missing customerId");
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
      return res.status(200).send(`✅ Customer ${customerId} whitelisted for ${licenseType}.`);
    }

    if (action === "blacklist") {
      await kv.set(`blacklist:${customerId}`, { enabled: true, reason: reason || "Manual blacklist", level: 2 });
      return res.status(200).send(`🚫 Customer ${customerId} has been blacklisted.`);
    }

    if (action === "unblacklist") {
      await kv.del(`blacklist:${customerId}`);
      return res.status(200).send(`♻️ Customer ${customerId} has been unblacklisted.`);
    }

    return res.status(400).send("Unknown action");
  }

  return res.status(405).send("Method not allowed");
}
