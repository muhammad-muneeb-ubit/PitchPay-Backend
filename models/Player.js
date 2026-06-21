const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Player", playerSchema);
