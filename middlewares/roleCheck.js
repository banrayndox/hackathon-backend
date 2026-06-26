export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('unauthorized')
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (allowedRoles.includes(req.user.role)) {
      console.log(req.user.role)
      next();
    } else {

      res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
  };
};