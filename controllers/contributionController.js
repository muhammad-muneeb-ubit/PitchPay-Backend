const Contribution = require("../models/Contribution");
const Player = require("../models/Player");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const getDateRangeFromMonth = (month) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const startDate = new Date(year, monthIndex - 1, 1);
  const endDate = new Date(year, monthIndex, 1);

  return { startDate, endDate };
};

const getContributions = asyncHandler(async (req, res) => {
  const { player, month, date } = req.query;
  const filters = {};

  if (req.user?.role === "member") {
    filters.playerId = req.user.playerId;
  } else if (player) {
    filters.playerId = player;
  }

  if (date) {
    const selectedDate = new Date(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    filters.contributionDate = {
      $gte: selectedDate,
      $lt: nextDate,
    };
  }

  if (month) {
    const { startDate, endDate } = getDateRangeFromMonth(month);
    filters.contributionDate = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  const contributions = await Contribution.find(filters)
    .populate("playerId", "name")
    .sort({ contributionDate: -1, createdAt: -1 });

  res.json({
    contributions: contributions.map((contribution) => ({
      id: contribution._id,
      playerId: contribution.playerId?._id,
      playerName: contribution.playerId?.name || "Unknown",
      amount: contribution.amount,
      contributionDate: contribution.contributionDate,
      createdAt: contribution.createdAt,
    })),
  });
});

const createContribution = asyncHandler(async (req, res) => {
  const { playerId, amount, contributionDate } = req.body;

  const player = await Player.findById(playerId);

  if (!player) {
    throw new AppError("Player not found", 404);
  }

  const contribution = await Contribution.create({
    playerId,
    amount,
    contributionDate,
  });

  res.status(201).json({
    message: "Contribution created successfully",
    contribution,
  });
});

const updateContribution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contribution = await Contribution.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!contribution) {
    throw new AppError("Contribution not found", 404);
  }

  res.json({
    message: "Contribution updated successfully",
    contribution,
  });
});

const deleteContribution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contribution = await Contribution.findByIdAndDelete(id);

  if (!contribution) {
    throw new AppError("Contribution not found", 404);
  }

  res.json({ message: "Contribution deleted successfully" });
});

module.exports = {
  getContributions,
  createContribution,
  updateContribution,
  deleteContribution,
};
