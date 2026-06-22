require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const playerRoutes = require("./routes/playerRoutes");
const contributionRoutes = require("./routes/contributionRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = process.env.CLIENT_URL
  ? {
      origin: process.env.CLIENT_URL,
      credentials: true,
    }
  : {
      origin: true,
    };

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "GullyFund API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn(
        "MONGO_URI is not set. Server will start without a database connection.",
      );
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
