const { body, param, query } = require("express-validator");

const contributionIdValidator = [
  param("id").isMongoId().withMessage("Invalid contribution id"),
];

const createContributionValidators = [
  body("playerId").isMongoId().withMessage("Valid player is required"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),
  body("contributionDate")
    .isISO8601()
    .withMessage("Contribution date is required"),
];

const contributionQueryValidators = [
  query("month")
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("Month must be in YYYY-MM format"),
  query("date").optional().isISO8601().withMessage("Date must be valid"),
  query("player")
    .optional()
    .isMongoId()
    .withMessage("Player filter must be valid"),
];

module.exports = {
  contributionIdValidator,
  createContributionValidators,
  contributionQueryValidators,
};
