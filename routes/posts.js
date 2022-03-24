const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment")
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController")

//getting all the PUBLISHED posts
router.get("/", postController.published_post_list);
//getting all the posts
router.get("/all", verifyToken, postController.complete_post_list);
//getting all unpublished posts
router.get("/unpublished", verifyToken, postController.unpublished_post_list)
//getting one post
router.get("/:id", getPost, postController.post_detail);
//creating a post
router.post("/", verifyToken, postController.post_create);
//updating a post
router.patch("/:id", getPost, postController.post_update);
//deleting a post
router.delete("/:id", getPost, postController.post_delete);

//getting all the comments on a post
router.get("/:postId/comments", commentController.comment_list)
//getting the number of comments on a post
router.get("/:postId/comment-count", commentController.comment_count)
//adding a comment to a post
router.post("/:postId/comments", commentController.comment_create)
//getting a comment
router.get("/:postId/comments/:id", getComment, commentController.comment_details)
//deleting a comment
router.delete("/:postId/comments/:id", getComment, commentController.comment_delete)

//MIDDLEWARE TO GET ONE POST
async function getPost(req, res, next) {
  let post;
  try {
    post = await Post.findById(req.params.id).populate("user");
    if (post === null) {
      return res.status(404).json({ message: "Cannot find post" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.post = post;
  next();
}
//MIDDLEWARE TO GET ONE COMMENT
async function getComment(req, res, next) {
  let comment;
  try {
    comment = await Comment.findById(req.params.id);
    if (comment === null) {
      return res.status(404).json({ message: "Cannot find comment" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.comment = comment;
  next();
}

//verify token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // check if bearer is undefined
  if (typeof bearerHeader !== "undefined"){
    // Split at the space
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    //set the token
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403)
  }
}

module.exports = router;
