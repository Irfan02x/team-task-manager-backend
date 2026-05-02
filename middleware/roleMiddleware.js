const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    // user comes from authMiddleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions"
      });
    }

    next();
  };
};

module.exports = roleMiddleware;