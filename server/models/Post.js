const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
  },
  text: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  likes: [
    {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
          },
        },
      ],
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Post = mongoose.model("post", PostSchema);
