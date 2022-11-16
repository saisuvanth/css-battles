const mongoose = require("mongoose");

const establish = (cb) => {
  mongoose
    .connect(
      "mongodb+srv://galaxy:bTt5lIWfQthegL31@cluster0.mnibyhy.mongodb.net/?retryWrites=true&w=majority"
    )
    .then((res) => {
      console.log("Successfully connected");
      cb();
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = establish