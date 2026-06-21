const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    expenseDate: {
      type: Date,
      required: [true, "Expense date is required"],
    },
  },
  { timestamps: true },
);

expenseSchema.index({ expenseDate: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
