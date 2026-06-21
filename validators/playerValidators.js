const { body, param } = require("express-validator");

const playerIdValidator = [
  param("id").isMongoId().withMessage("Invalid player id"),
];

const createPlayerValidators = [
  body("name").trim().notEmpty().withMessage("Player name is required"),
  body("memberEmail")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Valid member email is required"),
  body("memberPassword")
    .optional({ values: "falsy" })
    .isLength({ min: 6 })
    .withMessage("Member password must be at least 6 characters"),
];

module.exports = {
  playerIdValidator,
  createPlayerValidators,
};
