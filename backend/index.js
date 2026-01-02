// index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const rootRouter = require("./routes/index");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://pay-pulse-roan.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// 👇 THIS LINE IS CRITICAL
app.options("*", cors());

app.use(express.json());

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Server is running");
});
async function startServer() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      authSource: "admin"
    });

    console.log("Connected to MongoDB");
    app.use("/api/v1", rootRouter);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
