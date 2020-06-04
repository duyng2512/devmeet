const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Posts = require('../../models/Posts');
const Users = require('../../models/User');

const { check, validationResult } = require('express-validator');

// @route           POST api/posts
// @description:    Add a post
// access:          Private
router.post(
  '/',
  [auth, [check('text', 'Post can not be empty').not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await Users.findById(req.user.id).select('-password');

      const newPost = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };
      let post = new Posts(newPost);
      post = await post.save();
      return res.json(post);
    } catch (err) {
      console.error(err);
      return res.send('Server Error');
    }
  }
);

// @route           GET api/posts
// @description:    Get all posts
// access:          Public
router.get('/', async (req, res) => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    return res.send('Server Error');
  }
});

// @route           GET api/posts/:post_id
// @description:    Get all posts
// access:          Public
router.get('/:post_id', async (req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);

    // If Post is not founded
    if (!post) {
      return res.status(404).json({ msg: 'Post is not founded' });
    }

    return res.json(post);
  } catch (err) {
    if (err.statusCode !== 200) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    console.error(err);
    return res.send('Server Error');
  }
});

// @route           DELETE api/posts/:post_id
// @description:    Delete a post
// access:          Public
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);
    if (req.user.id !== post.user.toString()) {
      return res.status(401).json({ msg: 'User unauthorized' });
    }

    if (!post) {
      return res.status(404).json({ msg: 'Post is not founded' });
    }
    await post.remove();
    return res.json({ msg: 'Post removed' });
  } catch (err) {
    if (err.statusCode !== 200) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    console.error(err);
    return res.send('Server Error');
  }
});

// @route           PUT api/posts/like/:id
// @description:    Like a post
// access:          Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    // Check if user already like the post
    if (post.likes.map((eachLike) => eachLike.user).includes(req.user.id)) {
      return res.send({ msg: 'User already like this post' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (err) {
    console.error(err);
    return res.send('Server Error');
  }
});

// @route           PUT api/posts/like/:id
// @description:    Unlike a post
// access:          Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);

    if (!post) {
      return res.json({ msg: 'Post have not existed' });
    }

    // Check if user already like the post
    if (post.likes.map((eachLike) => eachLike.user).includes(req.user.id)) {
      const removeIndex = post.likes
        .map((eachLike) => eachLike.user)
        .indexOf(req.user.id);
      post.likes.splice(removeIndex, 1);
      await post.save();
    }
    return res.json(post.likes);
  } catch (err) {
    console.error(err);
    if (err.statusCode !== 200) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    return res.send('Server Error');
  }
});

// @route           POST api/posts/comment/:post_id
// @description:    Add a comment
// access:          Private
router.post(
  '/comment/:post_id',
  [auth, [check('text', 'You have to comment something !').not().isEmpty()]],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.statusCode(400).json({ error: error.array() });
      }
      const user = await Users.findById(req.user.id).select('-password');
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };
      let post = await Posts.findById(req.params.post_id);
      if (!post) {
        return res.statusCode(404).json({ msg: 'Post not founded' });
      }
      post.comments.unshift(newComment);
      post = await post.save();
      return res.json(post);
    } catch (error) {
      console.error(error);
      return res.send('Server Error');
    }
  }
);

// @route           POST api/posts/comment/:post_id
// @description:    Add a comment
// access:          Private
router.post(
  '/comment/:post_id',
  [auth, [check('text', 'You have to comment something !').not().isEmpty()]],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.statusCode(400).json({ error: error.array() });
      }
      const user = await Users.findById(req.user.id).select('-password');
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };
      let post = await Posts.findById(req.params.post_id);
      if (!post) {
        return res.statusCode(404).json({ msg: 'Post not founded' });
      }
      post.comments.unshift(newComment);
      post = await post.save();
      return res.json(post);
    } catch (error) {
      console.error(error);
      return res.send('Server Error');
    }
  }
);

// @route           DELETE api/posts/comment/:post_id/:comment_id
// @description:    Delete a comment
// access:          Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    let post = await Posts.findById(req.params.post_id);
    if (!post) {
      return res.statusCode(404).json({ msg: 'Post not founded' });
    }
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Check if comment still exist
    if (!comment) {
      return res.status(404).json({ msg: 'Comment is not founded' });
    }

    // Check if user is authorized
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: 'User is not authorized to delete this comment' });
    }

    const removeCommentIndex = post.comments
      .map((comment) => comment.id.toString())
      .indexOf(req.params.comment_id);
    post.comments.splice(removeCommentIndex, 1);
    await post.save();
    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.send('Server Error');
  }
});

// @route           PUT api/posts/comment/:post_id/:comment_id
// @description:    Edit a comment
// access:          Private
router.put(
  '/comment/:post_id/:comment_id',
  [auth, check('text', 'You have to comment something !').not().isEmpty()],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        return res.status(400).json({ msg: 'Bad Request' });
      }

      let post = await Posts.findById(req.params.post_id);
      if (!post) {
        return res.statusCode(404).json({ msg: 'Post not founded' });
      }
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );

      // Check if comment still exist
      if (!comment) {
        return res.status(404).json({ msg: 'Comment is not founded' });
      }

      // Check if user is authorized
      if (comment.user.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ msg: 'User is not authorized to delete this comment' });
      }

      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: comment.name,
        avatar: comment.avatar,
        data: comment.date,
      };

      // Delete comment
      const removeCommentIndex = post.comments
        .map((comment) => comment.id.toString())
        .indexOf(req.params.comment_id);
      post.comments.splice(removeCommentIndex, 1);

      // Add replace comment
      post.comments.unshift(newComment);

      await post.save();
      return res.json(post);
    } catch (error) {
      console.error(error);
      return res.send('Server Error');
    }
  }
);

// @route           PUT api/posts/comment/:post_id
// @description:    Edit a comment
// access:          Private
router.put(
  '/image/:post_id',
  [auth, check('image', 'Image not founded !').not().isEmpty()],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        return res.status(400).json({ msg: 'Bad Request' });
      }

      let post = await Posts.findById(req.params.post_id);
      if (!post) {
        return res.status(404).json({ msg: 'Post not founded' });
      }

      post.image = req.body.image;
      await post.save();
      return res.json(post);
    } catch (error) {
      console.error(error);
      return res.send('Server Error');
    }
  }
);

module.exports = router;
