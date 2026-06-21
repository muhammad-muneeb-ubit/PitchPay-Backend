const Expense = require("../models/Expense");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const getDateRangeFromMonth = (month) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const startDate = new Date(year, monthIndex - 1, 1);
  const endDate = new Date(year, monthIndex, 1);

  return { startDate, endDate };
};

const getExpenses = asyncHandler(async (req, res) => {
  const { month, date } = req.query;
  const filters = {};

  if (date) {
    const selectedDate = new Date(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    filters.expenseDate = {
      $gte: selectedDate,
      $lt: nextDate,
    };
  }

  if (month) {
    const { startDate, endDate } = getDateRangeFromMonth(month);
    filters.expenseDate = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  const expenses = await Expense.find(filters).sort({
    expenseDate: -1,
    createdAt: -1,
  });

  res.json({
    expenses: expenses.map((expense) => ({
      id: expense._id,
      title: expense.title,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
    })),
  });
});

const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, expenseDate } = req.body;
  const expense = await Expense.create({
    title,
    amount,
    expenseDate,
  });

  res.status(201).json({
    message: "Expense created successfully",
    expense,
  });
});

const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  res.json({
    message: "Expense updated successfully",
    expense,
  });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findByIdAndDelete(id);

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  res.json({ message: "Expense deleted successfully" });
});

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
