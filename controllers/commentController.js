const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { body, validationResult, check } = require("express-validator");
const jwt = require("jsonwebtoken");

//GETTING ALL COMMENTS FROM AN ARTICLE
exports.comment_list = async function (req, res) {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({
      timestamp: -1,
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.comment_count = async function (req, res) {
  const commentCount = await Comment.countDocuments({
    post: req.params.postId,
  });
  res.json({ count: commentCount });
};
//POSTING A COMMENT
exports.comment_create = [
  /*     body("email").custom((value => {
        if (value !== "anonymous"){
            body("email").isEmail()
        }
    })), */
  body("email").isEmail(),
  body("content", "Comment must be 5 characters or longer")
    .escape()
    .trim()
    .isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    let comment = new Comment({
      email: req.body.email,
      content: req.body.content,
      timestamp: Date.now(),
      post: req.body.post,
    });
    if (!errors.isEmpty()) {
      res.status(400).json({ comment, errors: errors.array() });
    } else {
      try {
        const newComment = await comment.save();
        res.status(201).json({ newComment });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    }
  },
];

//getting one comment
exports.comment_details = function (req, res) {
  res.json(res.comment);
};
//delete comment
exports.comment_delete = async function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        await res.comment.remove();
        res.json({ message: "comment removed" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
};
