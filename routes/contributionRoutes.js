const { Router } = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  contributionIdValidator,
  createContributionValidators,
  contributionQueryValidators,
} = require("../validators/contributionValidators");
const {
  getContributions,
  createContribution,
  updateContribution,
  deleteContribution,
} = require("../controllers/contributionController");

const router = Router();

router.use(protect);

router.get("/", contributionQueryValidators, validateRequest, getContributions);
router.post(
  "/",
  adminOnly,
  createContributionValidators,
  validateRequest,
  createContribution,
);
router.put(
  "/:id",
  adminOnly,
  contributionIdValidator,
  createContributionValidators,
  validateRequest,
  updateContribution,
);
router.delete(
  "/:id",
  adminOnly,
  contributionIdValidator,
  validateRequest,
  deleteContribution,
);

module.exports = router;
