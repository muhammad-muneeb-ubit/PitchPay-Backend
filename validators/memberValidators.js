const { body } = require("express-validator");

const memberAccountValidators = [
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
  memberAccountValidators,
};
