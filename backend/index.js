require("dotenv").config();
const express = require("express");
const checkEnv = require("./utils/checkEnv");
const mongoDBConnection = require("./config/db");
const authRoutes = require("./routes/auth.routes");

const app = express();

checkEnv();
mongoDBConnection();

app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  const PORT = process.env.PORT;
  console.log("Server is running on port:", PORT);
});
