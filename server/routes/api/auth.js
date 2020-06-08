const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const authGoogle = require('../../middleware/authGoogle');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// @route           GET api/auth
// @description:    Return Token Authentication
// access:          Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

// @route           POST api/auth
// @description:    Login Authetication
// access:          Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid email').not().isEmpty(),
    check('password', 'Please input a valid password').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors) {
      res.status(422).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    // Checking Email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }
    try {
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(err.message);
      res.status(500).send('Server error !');
    }
  }
);

// @route           GET api/auth/google
// @description:    Login Authetication by Google
// access:          Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route           GET api/auth/google/callback
// @description:    Middleware for google get user data
// access:          Public
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect('/api/auth/google/user');
});

// @route           GET api/auth/google/user
// @description:    Send token
// access:          Public
router.get('/google/user', authGoogle, (req, res) => {
  try {
    const payload = {
      user: {
        id: req.user._id,
      },
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {
        expiresIn: 36000,
      },
      (err, token) => {
        if (err) throw err;
        res.send({ token });
      }
    );
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server error !');
  }
});

module.exports = router;
