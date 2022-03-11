const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String },
  text: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  published: { type: Boolean},
  timestamp: {type: Date},
  editTimestamp: {type: Date}
});

module.exports = mongoose.model('Post', postSchema);
