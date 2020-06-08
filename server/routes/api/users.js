const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');

// @route           POST api/users
// @description:    Register new User
// access:          Public
router.post(
  '/',
  [
    // Middleware validation
    // name is required
    check('name', 'Name is Required').not().isEmpty(),
    //  username must be an email
    check('email', 'Please enter a valid email').isEmail(),
    // password must be at least 5 characters long
    check(
      'password',
      'Password can not be empty and must have at least 5 characters'
    ).isLength({ min: 5 }),
    check('password', 'Password can not be empty').not().isEmpty(),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      /** See if user exist */
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          errors: [{ msg: 'User already exist' }],
        });
      }

      /** Get users gravatar */
      const avatar = `https://avatars.dicebear.com/api/avataaars/${email}.svg`;
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      /** Encrypt password */
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      /** Return json Webtoken */
      const payload = {
        user: {
          id: user.id,
        },
      };
      // Getting secret from config object
      const jwtSecret = config.get('jwtSecret');
      jwt.sign(payload, jwtSecret, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });

      //res.send('User Register');
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server err');
    }
  }
);

// @route           POST api/users/google
// @description:    Register new User via Google Oauth
// access:          Public
router.post('/google', async (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { name, email, avatar } = req.body;

  try {
    /** See if user exist */
    let user = await User.findOne({ email });
    if (!user) {
      /** User exist then turn to Login function  */
      user = new User({
        name,
        email,
        avatar,
      });

      await user.save();
    }

    /** Return json Webtoken */
    const payload = {
      user: {
        id: user.id,
      },
    };
    // Getting secret from config object
    const jwtSecret = config.get('jwtSecret');
    jwt.sign(payload, jwtSecret, { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

    //res.send('User Register');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server err');
  }
});

module.exports = router;
