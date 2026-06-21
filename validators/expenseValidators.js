const { body, param, query } = require("express-validator");

const expenseIdValidator = [
  param("id").isMongoId().withMessage("Invalid expense id"),
];

const createExpenseValidators = [
  body("title").trim().notEmpty().withMessage("Expense title is required"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),
  body("expenseDate").isISO8601().withMessage("Expense date is required"),
];

const expenseQueryValidators = [
  query("month")
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("Month must be in YYYY-MM format"),
  query("date").optional().isISO8601().withMessage("Date must be valid"),
];

module.exports = {
  expenseIdValidator,
  createExpenseValidators,
  expenseQueryValidators,
};
