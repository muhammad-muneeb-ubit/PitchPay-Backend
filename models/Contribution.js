const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    contributionDate: {
      type: Date,
      required: [true, "Contribution date is required"],
    },
  },
  { timestamps: true },
);

contributionSchema.index({ playerId: 1, contributionDate: 1 });

module.exports = mongoose.model("Contribution", contributionSchema);
