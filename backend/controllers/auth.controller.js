const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const {
  generateVerificationCode,
  generateTokenAndSetCookie,
} = require("../utils/token");
const {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("../mailtrap/emails");
const { timestamp } = require("../utils/date");

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

    await sendVerificationEmail(user.email, verificationCode);

    console.log(
      `[${timestamp()}][Info] ✅ User created successfully: ${user.email}`
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to create user (${email}): ${
        error.message
      }`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      stack: error.stack,
    });
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

    await sendWelcomeEmail(user.email, user.name);
    console.log(
      `[${timestamp()}][Info] ✅ ${email} User verified successfully}`
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to verify email (${email}): ${
        error.message
      }`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      stack: error.stack,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.warn(
        `[${timestamp()}][Warning] Failed login attempt - user not found for email: ${email}, ` +
          `IP: ${req.ip}, User-Agent: ${req.get("User-Agent")}`
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      console.info(
        `[${timestamp()}][Warning] Failed login attempt - invalid password for email: ${email}, ` +
          `IP: ${req.ip}, User-Agent: ${req.get("User-Agent")}`
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = Date.now();
    await user.save();

    console.log(`[${timestamp()}][Info] ${email} User successfully logged in`);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed login attempt for email: ${email} - ${
        error.message
      }`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      stack: error.stack,
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  console.log(`[${timestamp()}][Info] ✅ User successfully logged out`);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.info(
        `[${timestamp()}][Warning] User not found with email: ${email}`
      );
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    await sendPasswordResetEmail(
      email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    console.log(
      `[${timestamp()}] 🔑 Password reset token generated for email: ${email}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to process password reset for ${email}: ${
        error.message
      }`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      stack: error.stack,
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      console.info(
        `[${timestamp()}][Warning] Invalid or expired reset token for email: ${email}`
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;

    await user.save();

    await sendResetSuccessEmail(email);
    console.log(
      `[${timestamp()}] 🔒 Password successfully reset for email: ${user.email}`
    );
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(
      `[${timestamp()}] [Error]: Failed to reset password for user: ${email}: ${
        error.message
      }`
    );
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      stack: error.stack,
    });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      console.info(
        `[${timestamp()}][Warning] User not found with userId: ${req.userId}`
      );
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      `[${timestamp()}] [Info] ✅ User ${user.email} successfully authenticated`
    );

    return res.status(200).json({
      success: true,
      message: "User found and authenticated",
      user: user,
    });
  } catch (error) {
    console.error(
      `[${timestamp()}] [Error]: Failed to authenticate user with userId: ${
        req.userId
      }. Error: ${error.message}`
    );

    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      stack: error.stack,
    });
  }
};
