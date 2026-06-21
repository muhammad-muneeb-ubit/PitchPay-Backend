const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Member = require("../models/Member");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const buildUserFromAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: "admin",
});

const buildUserFromMember = async (member) => {
  const populated = await member.populate("playerId", "name");
  const player = populated.playerId;

  return {
    id: member._id,
    name: player?.name || "Member",
    email: member.email,
    role: "member",
    playerId: player?._id || member.playerId,
  };
};

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authorized, token missing", 401);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const role = decoded.role || "admin";

  if (role === "member") {
    const member = await Member.findById(decoded.id).select("-password");

    if (!member) {
      throw new AppError("Not authorized, member not found", 401);
    }

    req.user = await buildUserFromMember(member);
    req.member = member;
    return next();
  }

  const admin = await Admin.findById(decoded.id).select("-password");

  if (!admin) {
    throw new AppError("Not authorized, admin not found", 401);
  }

  req.user = buildUserFromAdmin(admin);
  req.admin = admin;
  next();
});

const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }

  next();
});

const memberOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "member") {
    throw new AppError("Member access required", 403);
  }

  next();
});

module.exports = { protect, adminOnly, memberOnly };
