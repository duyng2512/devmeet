const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../server/models/User');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      /** Option for google strategy */
      callbackURL: '/api/auth/google/callback',
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      /** Passport callback function */
      User.findOne({ email: profile.emails[0].value }).then((currentUser) => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          new User({
            name: profile.displayName,
            avatar: profile.photos[0].value,
            email: profile.emails[0].value,
          })
            .save()
            .then((newUser) => {
              console.log(newUser);
              done(null, newUser);
            })
            .catch((err) => {
              console.log(err);
              done(false, err);
            });
        }
      });
    }
  )
);
