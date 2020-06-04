const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const { check, validationResult } = require('express-validator');
const config = require('config');

// @route           GET api/profile/me
// @description:    Get current user profile
// access:          Public
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ err: 'There is no profile for this User' });
    } else {
      return res.json(profile);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ err: 'Server Error' });
  }
});

// @route           POST api/profile
// @description:    Create or Update user profile
// access:          Public
router.post(
  '/',
  [
    auth,
    [
      check(
        'status',
        'Please enter your qualification levels (junior, middle, senior, management...)'
      )
        .not()
        .isEmpty(),
      check('skill', 'Please enter keyword skills(Java, iOS....) ')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status('422').json({ errors: error.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skill,
      bio,
      githubUsername,
      experience,
      education,
      connect,
    } = req.body;

    /** Build profile Object */
    const ProfileFileds = {};
    ProfileFileds.user = req.user.id;
    if (company) ProfileFileds.company = company;
    if (website) ProfileFileds.website = website;
    if (location) ProfileFileds.location = location;
    if (status) ProfileFileds.status = status;
    if (skill) {
      ProfileFileds.skill = skill;
    }
    if (bio) ProfileFileds.bio = bio;
    if (githubUsername) ProfileFileds.githubUsername = githubUsername;

    if (connect) {
      ProfileFileds.connect = {};
      ProfileFileds.connect.facebook = connect.facebook;
      ProfileFileds.connect.twitter = connect.twitter;
      ProfileFileds.connect.github = connect.github;
      ProfileFileds.connect.linkedin = connect.linkedin;
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          ProfileFileds,
          { new: true }
        );
      } else {
        profile = new Profile(ProfileFileds);
      }
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.send('Server Error');
    }
  }
);

// @route           GET api/profile
// @description:    Get all users data
// access:          Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    res.send(err.messeage);
  }
});

// @route           GET api/profile/user_id
// @description:    Get all users data
// access:          Public
router.get('/users/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (profile) {
      return res.json(profile);
    } else {
      return res.status(404).send({ msg: 'User can not founded' });
    }
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).send({ msg: 'User can not founded' });
    }
    res.send(err.messeage);
  }
});

// @route           DELETE api/profile
// @description:    Delete user all posts and profile
// access:          Private
router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({
      user: req.user.id,
    });

    await User.findOneAndRemove({
      _id: req.user.id,
    });

    return res.json({ msg: 'User deleted !' });
  } catch (err) {
    res.send(err.messeage);
  }
});

// @route           PUT api/profile/expericence
// @description:    Edit experience
// access:          Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Job title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'Start date is required').not().isEmpty(),
      check('to', 'Finish date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { title, company, from, to, description, current } = req.body;
    const newExp = { title, company, from, to, description, current };
    try {
      const profile = await Profile.findOne({
        user: req.user.id,
      });
      profile.experience.unshift(newExp);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err.messeage);
    }
  }
);

// @route           DELETE api/profile/expericence
// @description:    delete experience
// access:          Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removedIndex = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removedIndex, 1);
    await profile.save();
    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.messeage);
  }
});

// @route           PUT api/profile/education
// @description:    Add new education
// access:          Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'Name of your university or college ?'),
      check('from', 'When you start study here ? '),
      check('to', 'When you finish study here ? '),
      check('degree', 'Which kind of degree you pursuit ? '),
      check('current', 'Have you finished studied here ?'),
      check('gpa', 'What is your GPA in 4.00 scale ?'),
    ],
  ],
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const { school, from, to, degree, current, gpa } = req.body;
      const newEducation = { school, from, to, degree, current, gpa };
      profile.education.unshift(newEducation);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err.messeage);
    }
  }
);

// @route           DELETE api/profile/education/:edu_id
// @description:    Delete an education items
// access:          Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removedIndex = profile.education
      .map((edu) => edu.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removedIndex, 1);
    await profile.save();
    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.messeage);
  }
});

/***
 * GITHUB API
 */
// @route           GET api/profile/github/:user_name
// @description:    get username github information
// access:          public
router.get('/github/:user_name', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.user_name
      }/repos?type=all&per_page=6&sort=created&direction=desc&client_id=${config.get(
        'github_ID'
      )}&client_secret=${config.get('github_Secret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    request(options, (errors, response, body) => {
      if (errors) {
        console.error(errors);
      }

      if (response.statusCode !== 200) {
        return res.status(400).json({ msg: 'User Not Found' });
      }

      return res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server Error !' });
  }
});

module.exports = router;
