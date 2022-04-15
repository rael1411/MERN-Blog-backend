require("dotenv").config();
const Post = require("../models/Post");
const Comment = require("../models/Comment")
const { body, validationResult, check } = require("express-validator");
const jwt = require("jsonwebtoken");

//getting all the PUBLISHED posts
exports.published_post_list = async function (req, res) {
  try {
    const posts = await Post.find({ published: true })
      .populate("user")
      .sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//getting all the  posts
exports.complete_post_list = async function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const posts = await Post.find({}).populate("user");
        res.json(posts);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
};

//get unpublished
exports.unpublished_post_list = async function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const posts = await Post.find({ published: false }).populate("user");
        res.json(posts);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
};
//getting one post
exports.post_detail = async function (req, res) {
  res.json(res.post);
};
//creating a post
exports.post_create = [
  body("title").trim().isLength({ min: 3 }).escape(),
  body("text").escape().trim().isLength({ min: 10 }),
  async (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const errors = validationResult(req);
        let user = jwt.decode(req.token).user;

        if (user === undefined) {
          user = jwt.decode(req.token).UserInfo.user;
        }
        let post = new Post({
          title: req.body.title,
          text: req.body.text,
          user: user,
          published: req.body.published,
          timestamp: "",
        });
        if (req.body.published) {
          post.timestamp = Date.now();
        }
        if (!errors.isEmpty()) {
          res.status(400).json({ post, errors: errors.array() });
        } else {
          try {
            const newPost = await post.save();
            res.status(201).json(newPost);
          } catch (err) {
            res.status(400).json({ message: err.message });
          }
        }
      }
    });
  },
];
//updating a post
exports.post_update = async function (req, res) {
  if (req.body.title != null) {
    res.post.title = req.body.title;
  }
  if (req.body.text != null) {
    res.post.text = req.body.text;
  }
  res.post.editTimestamp = Date.now();
  if (req.body.published !== res.post.published) {
    res.post.published = req.body.published;
    res.post.timestamp = Date.now();
    res.post.editTimestamp = "";
  }
  
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const updatedPost = await res.post.save();
        res.json(updatedPost);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
};
//deleting a post
exports.post_delete = async function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      console.log(err)
      res.sendStatus(403);
    } else {
      try {
        //deleting comments associated with a post that is getting deleted
        try {
          await Comment.deleteMany({post: res.post._id });
        }
        catch (err){
          (err)
        }
        await res.post.remove();
        res.json({ message: "post removed" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
};
