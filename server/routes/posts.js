const express = require("express");
const { auth } = require("../Utils");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Post = require("../models/Post");
const router = express.Router();

//----------------------- POST http://localhost:5000/api/posts
router.post(
  "/",
  auth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
//-----------------------GET http://localhost:5000/api/posts
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});
//-----------------------GET http://localhost:5000/api/posts/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});
//-----------------------DELETE http://localhost:5000/api/posts/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    await post.remove();
    res.send({ msg: "Post deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});
//-----------------------PUT http://localhost:5000/api/posts/like/:id
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (
      post.likes.filter((like) => {
        return like.user.toString() === req.user.id;
      }).length === 0
    ) {
      post.likes.unshift({ user: req.user.id });
    }
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});
//-----------------------PUT http://localhost:5000/api/posts/unlike/:id
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (
      post.likes.filter((like) => {
        return like.user.toString() === req.user.id;
      }).length === 1
    ) {
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
    }
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});
//-----------------------POST http://localhost:5000/api/posts/comment/:id
router.post(
  "/comment/:id",
  auth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send(error.message);
    }
  }
);
//-----------------------DELETE http://localhost:5000/api/posts/comment/:id/:comment_id
router.delete("/comment/:id/comment_id", auth, async (req, res) => {
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find((comment) => {
      return comment.id === req.params.comment_id;
    });
    if (!comment) {
      return res.status(404).json({ msg: "Comment dose not found" });
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    post.comments = post.comments.filter(
      (comment) => comment.id !== req.params.comment_id
    );
    await post.save();
    return res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
