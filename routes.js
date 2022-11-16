const express = require("express");
const router = express.Router();
const controller = require("./controllers/userController");
const colors = require("./client/assets/colors.json");

router.get("/", controller.protect, (req, res, next) => {
  if (req.user) {
    res.redirect("/battle");
  } else {
    res.redirect("/login");
  }
});

router.get("/battle", controller.protect, (req, res, next) => {
  const { allotedImages, score, time } = req.user;
  console.log(colors, score, allotedImages);
  if (score.length === 3) {
    res.render("score", {
      score: score,
    });
  }
  res.render("index", {
    imgIndex: "p" + (allotedImages[score.length] + 1),
    queNum: "q" + (score.length + 1),
    firstEntered: time[0],
    colors,
  });
});

router.get("/login", (req, res, next) => {
  res.render("load");
});

router.post("/login", controller.loginController);

router.post("/score", controller.protect, controller.scoreController);

module.exports = router;
