const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  allotedImages: {
    type: Array,
  },
  score: {
    type: Array,
    required: true,
  },
  time: [
    {
      type: Date,
    },
  ],
});

module.exports = mongoose.model("user", User);
