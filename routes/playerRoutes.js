const { Router } = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  playerIdValidator,
  createPlayerValidators,
} = require("../validators/playerValidators");
const {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controllers/playerController");

const router = Router();

router.use(protect);

router.get("/", adminOnly, getPlayers);
router.post("/", adminOnly, createPlayerValidators, validateRequest, createPlayer);
router.put(
  "/:id",
  adminOnly,
  playerIdValidator,
  createPlayerValidators,
  validateRequest,
  updatePlayer,
);
router.delete("/:id", adminOnly, playerIdValidator, validateRequest, deletePlayer);

module.exports = router;
