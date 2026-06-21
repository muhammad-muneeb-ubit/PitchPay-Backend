const Contribution = require("../models/Contribution");
const Expense = require("../models/Expense");
const Player = require("../models/Player");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const getDashboardReport = asyncHandler(async (req, res) => {
  const [
    totalPlayers,
    contributionSummary,
    expenseSummary,
    recentContributions,
    recentExpenses,
  ] = await Promise.all([
    Player.countDocuments(),
    Contribution.aggregate([
      { $group: { _id: null, totalContributions: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
    ]),
    Contribution.find()
      .populate("playerId", "name")
      .sort({ contributionDate: -1 })
      .limit(5),
    Expense.find().sort({ expenseDate: -1 }).limit(5),
  ]);

  const totalContributions = contributionSummary[0]?.totalContributions || 0;
  const totalExpenses = expenseSummary[0]?.totalExpenses || 0;

  res.json({
    totalPlayers,
    totalContributions,
    totalExpenses,
    currentBalance: totalContributions - totalExpenses,
    recentContributions: recentContributions.map((contribution) => ({
      id: contribution._id,
      playerName: contribution.playerId?.name || "Unknown",
      amount: contribution.amount,
      contributionDate: contribution.contributionDate,
    })),
    recentExpenses: recentExpenses.map((expense) => ({
      id: expense._id,
      title: expense.title,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
    })),
  });
});

const getMonthlyReport = asyncHandler(async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const [year, monthIndex] = month.split("-").map(Number);
  const startDate = new Date(year, monthIndex - 1, 1);
  const endDate = new Date(year, monthIndex, 1);

  const monthlyData = await Contribution.aggregate([
    {
      $match: {
        contributionDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $lookup: {
        from: "players",
        localField: "playerId",
        foreignField: "_id",
        as: "player",
      },
    },
    { $unwind: "$player" },
    {
      $group: {
        _id: "$playerId",
        playerName: { $first: "$player.name" },
        totalPaid: { $sum: "$amount" },
      },
    },
    { $sort: { totalPaid: -1 } },
  ]);

  res.json({
    month,
    playerMonthlyTotals: monthlyData,
  });
});

const getPlayerStats = asyncHandler(async (req, res) => {
  const stats = await Contribution.aggregate([
    {
      $group: {
        _id: "$playerId",
        totalContributions: { $sum: 1 },
        totalAmountPaid: { $sum: "$amount" },
        lastPaymentDate: { $max: "$contributionDate" },
      },
    },
    {
      $lookup: {
        from: "players",
        localField: "_id",
        foreignField: "_id",
        as: "player",
      },
    },
    { $unwind: "$player" },
    {
      $project: {
        _id: 0,
        playerId: "$_id",
        playerName: "$player.name",
        totalContributions: 1,
        totalAmountPaid: 1,
        lastPaymentDate: 1,
      },
    },
    { $sort: { totalAmountPaid: -1 } },
  ]);

  res.json({ playerStats: stats });
});

const getMemberDashboard = asyncHandler(async (req, res) => {
  const playerId = req.user.playerId;
  const playerObjectId = new mongoose.Types.ObjectId(String(playerId));

  const [
    player,
    memberContributionSummary,
    groupContributionSummary,
    expenseSummary,
    recentContributions,
    recentExpenses,
  ] = await Promise.all([
    Player.findById(playerId),
    Contribution.aggregate([
      { $match: { playerId: playerObjectId } },
      { $group: { _id: null, totalContributed: { $sum: "$amount" } } },
    ]),
    Contribution.aggregate([
      { $group: { _id: null, totalContributions: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
    ]),
    Contribution.find({ playerId })
      .sort({ contributionDate: -1 })
      .limit(5),
    Expense.find().sort({ expenseDate: -1 }).limit(5),
  ]);

  if (!player) {
    throw new AppError("Linked player not found", 404);
  }

  const totalContributed = memberContributionSummary[0]?.totalContributed || 0;
  const groupTotalContributions =
    groupContributionSummary[0]?.totalContributions || 0;
  const groupTotalExpenses = expenseSummary[0]?.totalExpenses || 0;

  res.json({
    playerName: player.name,
    totalContributed,
    groupTotalContributions,
    groupTotalExpenses,
    groupBalance: groupTotalContributions - groupTotalExpenses,
    recentContributions: recentContributions.map((contribution) => ({
      id: contribution._id,
      amount: contribution.amount,
      contributionDate: contribution.contributionDate,
    })),
    recentExpenses: recentExpenses.map((expense) => ({
      id: expense._id,
      title: expense.title,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
    })),
  });
});

module.exports = {
  getDashboardReport,
  getMonthlyReport,
  getPlayerStats,
  getMemberDashboard,
};
