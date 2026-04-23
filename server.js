require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ IMPORTANT
const PORT = process.env.PORT || 8080;

// ✅ ROOT ROUTE (must)
app.get("/", (req, res) => {
  res.status(200).send("API Running 🚀");
});

// ✅ TEST ROUTE
app.get("/test", (req, res) => {
  res.json({ success: true });
});

// ✅ FORCE LOG (debug)
setInterval(() => {
  console.log("Server Alive...");
}, 3000);

// ✅ LISTEN (IMPORTANT)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});