const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.loginController = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).then((result) => {
    if (result === null) {
      let array = [];
      array.push(Math.floor(Math.random() * 2));
      array.push(Math.floor(Math.random() * 3));
      array.push(0);
      const user = new User({
        email,
        password,
        allotedImages: array,
        time: [new Date()],
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      const cookieOptions = {
        expiresIn: new Date(Date.now() + process.env.AUTH_COOKIE_EXPIRES_IN),
        httpOnly: true,
      };
      res.cookie("auth", token, cookieOptions);
      user.save().then((response) => {});
    } else {
      if (result.password !== password) {
        res.send("Either this password is wrong or email is already taken");
        return;
      }
      const token = jwt.sign({ id: result._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      const cookieOptions = {
        expiresIn: new Date(Date.now() + process.env.AUTH_COOKIE_EXPIRES_IN),
        httpOnly: true,
      };
      res.cookie("auth", token, cookieOptions);
    }
    res.redirect("/battle");
  });
};

exports.scoreController = (req, res, next) => {
  const sc = req.body.score;
  console.log(req.body);
  const { _id, score } = req.user;
  if (score.length == 3) {
    res.render("score", {
      score: score,
    });
  } else {
    User.findOneAndUpdate(
      { _id },
      { $push: { score: sc, time: new Date() } },
      { returnDocument: "after" }
    ).then((result) => {
      console.log(result);
      res.status(200).send("Done");
    });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.auth) {
    token = req.cookies?.auth;
  }
  if (!token) {
    res.redirect("/login");
    return;
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  const user = await User.findById(decoded.id);
  if (!user) {
    res.redirect("/login");
    return;
  }
  req.user = user;
  res.locals.user = user;
  next();
};
