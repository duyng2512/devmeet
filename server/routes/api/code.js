const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Code = require('../../models/Code');
const Users = require('../../models/User');

// @route           POST api/code
// @description     Add new code snippet
// access:          Private
router.post('/', [auth], async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status('422').json({ errors: error.array() });
    }
    const newCode = {
      content: req.body.content,
      description: req.body.description,
      language: req.body.language,
    };

    let code = await Code.findOne({
      user: req.user.id,
    });
    if (code) {
      code.code.unshift(newCode);
      code = await code.save();
      return res.json(code);
    } else {
      code = new Code({
        user: req.user.id,
        code: [newCode],
      });

      code = await code.save();
      return res.json(code);
    }
  } catch (err) {
    console.error(err.message);
    return res.send('Server Error');
  }
});

// @route           GET api/code
// @description     Get all code
// access:          Private
router.get('/', [auth], async (req, res) => {
  try {
    const code = await Code.findOne({
      user: req.user.id,
    });
    if (!code) {
      return res.status(400).json({
        user: req.user.id,
        code: [],
      });
    } else {
      return res.json(code);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      err: 'Server Error',
    });
  }
});

// @route           GET api/code/:user_id
// @description     Get individual ID
// access:          Private
router.get('/:user_id', async (req, res) => {
  try {
    const code = await Code.findOne({
      user: req.params.user_id,
    });
    if (!code) {
      return res.json({
        user: req.params.user_id,
        code: [],
      });
    } else {
      return res.json(code);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      err: 'Server Error',
    });
  }
});

// @route           DEL api/code/:user_id/:code_id
// @description     Get individual ID
// access:          Private
router.delete('/:user_id/:code_id', async (req, res) => {
  try {
    const code = await Code.findOne({
      user: req.params.user_id,
    });
    if (!code) {
      return res.status(404).json({ msg: 'Not founded' });
    } else {
      const deleteCode = code.code.find(
        (item) => item.id === req.params.code_id
      );

      if (!deleteCode) {
        return res.status(404).json({ msg: 'Not founded' });
      }

      const removeCodeIndex = code.code
        .map((item) => item.id.toString())
        .indexOf(req.params.code_id);
      code.code.splice(removeCodeIndex, 1);
      await code.save();

      return res.json(code);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      err: 'Server Error',
    });
  }
});

module.exports = router;
