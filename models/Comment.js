const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
    email: {type: String},
    post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
    content: {type: String, required: true},
    timestamp: {type: Date, required: true}
})

module.exports = mongoose.model('Comment', commentSchema);
