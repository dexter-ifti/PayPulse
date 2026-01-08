// index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const rootRouter = require("./routes/index");

const app = express();


app.use('/*', cors({
  origin: '*'
}))


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
