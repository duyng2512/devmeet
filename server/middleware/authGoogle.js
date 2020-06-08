// Middleware to check if the user is authenticated
module.exports = function isUserAuthenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/test/google');
  }
};
