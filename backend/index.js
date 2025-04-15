require("dotenv").config();
const express = require("express");
const cors = require("cors");
const checkEnv = require("./utils/checkEnv");
const mongoDBConnection = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");
const { timestamp } = require("./utils/date");
const path = require("path");

const app = express();

checkEnv();
mongoDBConnection();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

const PORT = process.env.PORT;
app.listen(PORT, () => {
  const PORT = process.env.PORT;
  console.log(
    `[${timestamp()}] Server is running in ${
      process.env.NODE_ENV
    } mode on port ${PORT}`
  );
});
