const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "unauthorized - no provided token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    let message = "Unauthorized - Invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Unauthorized - Token expired";
    }

    return res.status(401).json({ success: false, message });
  }
};
