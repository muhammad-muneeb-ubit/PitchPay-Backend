const { Router } = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  expenseIdValidator,
  createExpenseValidators,
  expenseQueryValidators,
} = require("../validators/expenseValidators");
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const router = Router();

router.use(protect);

router.get("/", expenseQueryValidators, validateRequest, getExpenses);
router.post("/", adminOnly, createExpenseValidators, validateRequest, createExpense);
router.put(
  "/:id",
  adminOnly,
  expenseIdValidator,
  createExpenseValidators,
  validateRequest,
  updateExpense,
);
router.delete("/:id", adminOnly, expenseIdValidator, validateRequest, deleteExpense);

module.exports = router;
