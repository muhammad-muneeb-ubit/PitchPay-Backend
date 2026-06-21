const { Router } = require("express");
const { protect, adminOnly, memberOnly } = require("../middleware/authMiddleware");
const {
  getDashboardReport,
  getMonthlyReport,
  getPlayerStats,
  getMemberDashboard,
} = require("../controllers/reportController");

const router = Router();

router.use(protect);

router.get("/dashboard", adminOnly, getDashboardReport);
router.get("/monthly", adminOnly, getMonthlyReport);
router.get("/player-stats", adminOnly, getPlayerStats);
router.get("/member-dashboard", memberOnly, getMemberDashboard);

module.exports = router;
