const Player = require("../models/Player");
const Member = require("../models/Member");
const Contribution = require("../models/Contribution");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const buildPlayerStatsMap = async () => {
  const stats = await Contribution.aggregate([
    {
      $group: {
        _id: "$playerId",
        totalPaid: { $sum: "$amount" },
        contributionCount: { $sum: 1 },
        lastPaymentDate: { $max: "$contributionDate" },
      },
    },
  ]);

  return stats.reduce((map, item) => {
    map[String(item._id)] = item;
    return map;
  }, {});
};

const upsertMemberAccount = async (playerId, memberEmail, memberPassword) => {
  const email = memberEmail?.trim().toLowerCase();
  const password = memberPassword?.trim();

  if (!email && !password) {
    return null;
  }

  const existingForPlayer = await Member.findOne({ playerId }).select(
    "+password",
  );

  if (existingForPlayer) {
    if (email) {
      const existingByEmail = await Member.findOne({ email });

      if (
        existingByEmail &&
        String(existingByEmail.playerId) !== String(playerId)
      ) {
        throw new AppError("Member email is already in use", 400);
      }

      existingForPlayer.email = email;
    }

    if (password) {
      existingForPlayer.password = password;
    }

    await existingForPlayer.save();
    return existingForPlayer;
  }

  if (!email || !password) {
    throw new AppError(
      "Both member email and password are required for portal access",
      400,
    );
  }

  const existingByEmail = await Member.findOne({ email });

  if (existingByEmail) {
    throw new AppError("Member email is already in use", 400);
  }

  return Member.create({
    email,
    password,
    playerId,
  });
};

const getPlayers = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;
  const query = search ? { name: { $regex: search, $options: "i" } } : {};

  const [players, playerStatsMap, members] = await Promise.all([
    Player.find(query).sort({ createdAt: -1 }),
    buildPlayerStatsMap(),
    Member.find().select("playerId email"),
  ]);

  const memberMap = members.reduce((map, member) => {
    map[String(member.playerId)] = member;
    return map;
  }, {});

  const playersWithStats = players.map((player) => {
    const stats = playerStatsMap[String(player._id)] || {};
    const member = memberMap[String(player._id)];

    return {
      id: player._id,
      name: player.name,
      createdAt: player.createdAt,
      totalPaid: stats.totalPaid || 0,
      totalContributions: stats.contributionCount || 0,
      lastPaymentDate: stats.lastPaymentDate || null,
      hasPortalAccess: Boolean(member),
      memberEmail: member?.email || null,
    };
  });

  res.json({ players: playersWithStats });
});

const createPlayer = asyncHandler(async (req, res) => {
  const { name, memberEmail, memberPassword } = req.body;
  const player = await Player.create({ name });

  await upsertMemberAccount(player._id, memberEmail, memberPassword);

  res.status(201).json({
    message: "Player created successfully",
    player,
  });
});

const updatePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, memberEmail, memberPassword } = req.body;

  const player = await Player.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true },
  );

  if (!player) {
    throw new AppError("Player not found", 404);
  }

  await upsertMemberAccount(id, memberEmail, memberPassword);

  res.json({
    message: "Player updated successfully",
    player,
  });
});

const deletePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const player = await Player.findByIdAndDelete(id);

  if (!player) {
    throw new AppError("Player not found", 404);
  }

  await Contribution.deleteMany({ playerId: id });
  await Member.deleteOne({ playerId: id });

  res.json({ message: "Player deleted successfully" });
});

module.exports = {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
