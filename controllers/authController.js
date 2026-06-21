const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Member = require("../models/Member");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const buildMemberLoginUser = async (member) => {
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

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const admin = await Admin.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (admin) {
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    return res.json({
      message: "Login successful",
      token: generateToken(admin._id, "admin"),
      user,
      admin: user,
    });
  }

  const member = await Member.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!member) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await member.comparePassword(password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = await buildMemberLoginUser(member);

  res.json({
    message: "Login successful",
    token: generateToken(member._id, "member"),
    user,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ message: "Logout successful" });
});

module.exports = {
  login,
  logout,
  loginAdmin: login,
  logoutAdmin: logout,
};
