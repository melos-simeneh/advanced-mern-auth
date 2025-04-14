const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const {
  generateVerificationCode,
  generateTokenAndSetCookie,
} = require("../utils/token");
const {
  senderVerificationEmail,
  senderWelcomeEmail,
} = require("../mailtrap/emails");

exports.signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken: verificationCode,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    const token = generateTokenAndSetCookie(res, user._id);

    // await senderVerificationEmail(user.email, verificationCode);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        ...user.toJSON(),
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { code, email } = req.body;
  try {
    const user = await User.findOne({
      email: email,
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    await senderWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user.toJSON(),
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      stack: error.stack,
    });
  }
};
exports.login = async (req, res) => {};
exports.logout = async (req, res) => {};
