const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Job = require('../../models/Job');
const Users = require('../../models/User');

const { check, validationResult } = require('express-validator');

// @route           POST api/job
// @description:    Add a new job
// access:          Private
router.post('/', auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = await Users.findById(req.user.id).select('-password');

    const newJob = {
      user: req.user.id,
      company: req.body.company,
      location: req.body.location,
      jobTitle: req.body.jobTitle,
      remote: req.body.remote,
      image: req.body.image,
      userInfo: {
        companyName: req.body.userInfo.companyName,
        companySize: req.body.userInfo.companySize,
        phone: req.body.userInfo.phone,
        name: req.body.userInfo.name,
      },
      employmentType: req.body.employmentType,
      contract: req.body.contract,
      salary: req.body.salary,
      description: req.body.description,
      requirement: req.body.requirement,
      preference: req.body.preference,
      stack: req.body.stack,
    };
    let job = new Job(newJob);
    job = await job.save();
    return res.json(job);
  } catch (error) {
    console.error(error);
    return res.send('Server Error');
  }
});

// @route           GET api/job
// @description:    Get all jobs
// access:          Public
router.get('/', async (req, res) => {
  try {
    const job = await Job.find();
    return res.json(job);
  } catch (error) {
    console.error(error);
    return res.send('Server Error');
  }
});

// @route           GET api/job/:id
// @description:    Get by ID
// access:          Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job post is not founded' });
    }

    return res.json(job);
  } catch (error) {
    if (error.statusCode !== 200) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }

    console.error(error);
    return res.send('Server Error');
  }
});

// @route           DELETE api/job/:id
// @description:    Delete a post
// access:          Public
router.delete('/:job_id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.job_id);

    if (!job) {
      return res.status(404).json({ msg: 'Post is not founded' });
    }

    await job.remove();

    return res.json({ msg: 'Job post removed' });
  } catch (err) {
    if (err.statusCode !== 200) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    console.error(err);
    return res.send('Server Error');
  }
});

// @route           GET api/job/info/user
// @description:    Get job post of user
// access:          Public
router.get('/info/user', auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const job = await Job.find({ user: req.user.id });

    if (!job) {
      return res.status(404).json({ msg: 'Job post is not founded' });
    }

    return res.json(job);
  } catch (error) {
    if (error.statusCode !== 200) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }

    console.error(error);
    return res.send('Server Error');
  }
});

// @route           GET api/job/info/userlength
// @description:    Get job post of user
// access:          Public
router.get('/info/userlength', auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const job = await Job.find({ user: req.user.id });

    if (!job) {
      return res.status(404).json({ msg: 'Job post is not founded' });
    }

    return res.json({ total: job.length });
  } catch (error) {
    if (error.statusCode !== 200) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }

    console.error(error);
    return res.send('Server Error');
  }
});

// @route           GET /total
// @description:    get total number of job
// access:          Public
router.get('/info/total', async (req, res) => {
  try {
    const job = await Job.find();
    return res.json({ total: job.length });
  } catch (error) {
    console.error(error);
    return res.send('Server Error');
  }
});

// @route           PUT api/job/image/:job_id
// @description:    Delete a post
// access:          Public
router.put(
  '/image/:job_id',
  [auth, check('image', 'Image not founded !').not().isEmpty()],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        return res.status(400).json({ msg: 'Bad Request' });
      }

      const job = await Job.findById(req.params.job_id);

      if (!job) {
        return res.status(404).json({ msg: 'Post is not founded' });
      }

      job.image = req.body.image;
      await job.save();

      return res.json(job);
    } catch (err) {
      console.error(err);
      return res.send('Server Error');
    }
  }
);

// @route           PUT api/job/apply/:job_id
// @description:    Delete a post
// access:          Public
router.put('/apply/:job_id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.job_id);

    if (!job) {
      return res.status(404).json({ msg: 'Post is not founded' });
    }

    job.applicant.push(req.body.form);
    await job.save();
    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.send('Server Error');
  }
});

// @route           PUT api/job/apply/:job_id
// @description:    Delete a post
// access:          Public
router.put('/apply/multiple/:job_id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.job_id);

    if (!job) {
      return res.status(404).json({ msg: 'Post is not founded' });
    }

    req.body.form.forEach((item, index) => {
      job.applicant.push(item);
    });

    await job.save();
    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.send('Server Error');
  }
});

module.exports = router;
