let colorConScroll;
console.log(colors, queNum, imgIndex);
const referenceImageURL = `assets/${queNum}/${imgIndex}.png`;
const domainWithPort = window.location.origin;
const aceEditor = ace.edit("editor");
let initCode = `
<div>    
</div>
<style>
    * {
        margin: 0;
        padding: 0;
    }
    div {
        background-color: #fff;
        height: 100vh;
        width: 100vw;
    }
</style>`;

if (localStorage.getItem("html") == null) {
  localStorage.setItem("html", initCode);
}
aceEditor.setValue(localStorage.getItem("html"), 1);
const clip = new ClipboardJS(".colorCopy", {
  text: function (trigger) {
    return trigger.getAttribute("data-color");
  },
});

let loadTimeout;
let check = 0;
let HTMLMode = ace.require("ace/mode/html").Mode;

function setSlider(x) {
  document.getElementById("slider").style.width = x + "px";
}

document.getElementById("editor").addEventListener("keyup", function () {
  clearTimeout(loadTimeout);
  localStorage.setItem("html", aceEditor.getValue());
  loadTimeout = setTimeout(function () {
    document.getElementById("previewMain").src = "blank.html";
    document.getElementById("previewMain").onload = function () {
      document
        .getElementById("previewMain")
        .contentWindow.document.write(aceEditor.getValue());
    };
  }, 500);
});

function testScore() {
  var formData = new FormData();
  formData.append("html", aceEditor.getValue());
  formData.append("queNum", queNum);
  formData.append("imgIndex", imgIndex);

  fetch(`${domainWithPort}/getImage`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.status == "ok") {
        if (parseInt(json.done) == 1) {
          new notification(document.getElementById("notiCon"), {
            perm: 0,
            head: "Notification",
            notiData: `Your score: ${
              Math.floor(json.score * 10000) / 100
            }%. You did it!`,
          });
        } else {
          new notification(document.getElementById("notiCon"), {
            perm: 2,
            head: "Notification",
            notiData: `Your score: ${Math.floor(json.score * 10000) / 100}%`,
          });
        }
      } else {
        new notification(document.getElementById("notiCon"), {
          perm: 1,
          head: "Notification",
          notiData: json.message,
        });
      }
    });
}

var sendCheck = 0;
function sendReq() {
  if (sendCheck == 1) {
    new notification(document.getElementById("notiCon"), {
      perm: 3,
      head: "Notification",
      notiData: "Your previous request is still being processed",
    });
    return;
  }

  sendCheck = 1;
  new notification(document.getElementById("notiCon"), {
    perm: 2,
    head: "Alert",
    notiData: "The request is being processed...",
  });

  var formData = new FormData();
  formData.append("html", aceEditor.getValue());
  formData.append("queNum", queNum);
  formData.append("imgIndex", imgIndex);

  fetch(`${domainWithPort}/getImage`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.status == "ok") {
        fetch(`${domainWithPort}/score`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: Math.floor(json.score * 10000) / 100,
          }),
        }).then((res) => {
          setTimeout(() => {
            window.location = "/battle";
          }, 2000);
        });
      } else {
        new notification(document.getElementById("notiCon"), {
          perm: 2,
          color: "yes",
          head: "Error",
          notiData: json.message,
        });
      }

      sendCheck = 0;
    })
    .catch(function (err) {
      new notification(document.getElementById("notiCon"), {
        perm: 3,
        color: "yes",
        head: "Error",
        notiData: err,
      });
      sendCheck = 0;
    });
}

function getRules() {
  new notification(document.getElementById("notiCon"), {
    perm: 0,
    head: "Rules",
    notiData: `<ul><li>You need to recreate the picture in the expected output using HTML/CSS.<li>You can't use Javascript or external links. You have to do it only with CSS and HTML.<li>Your output will be matched with the expected output and given a score based off of how  close it is to it. <li>You can test your current work score using the test button, Submit your solution once you are done	<li>The colors that you have to use are below the submit button. You can just click on it to copy the color-code. <li> You can submit solution only once <li> Time of your solution will only be used as a tie breaker</ul>`,
  });
}

class replaceScroll {
  constructor(DomElem, mainElem, data) {
    this.data = data;
    this.elem = DomElem;
    this.mainElem = mainElem;
    this.create();
  }

  create() {
    let leftArrow = document.createElement("div");
    this.leftArrow = leftArrow;
    let rightArrow = document.createElement("div");
    this.rightArrow = rightArrow;
    leftArrow.className = "arrow leftArrow";
    rightArrow.className = "arrow rightArrow";
    let self = this;

    this.mainElem.addEventListener("scroll", function () {
      self.scroll();
    });

    this.scroll();
    leftArrow.addEventListener("click", function () {
      self.mainElem.scrollBy(-200, 0);
    });

    rightArrow.addEventListener("click", function () {
      self.mainElem.scrollBy(200, 0);
    });
    this.elem.appendChild(leftArrow);
    this.elem.appendChild(rightArrow);
  }

  scroll() {
    let leftArrow = this.leftArrow;
    let rightArrow = this.rightArrow;
    if (this.mainElem.scrollWidth - this.mainElem.offsetWidth < 5) {
      leftArrow.style.display = "none";
      rightArrow.style.display = "none";
    } else if (
      this.mainElem.scrollLeft + this.mainElem.offsetWidth + 10 >
      this.mainElem.scrollWidth
    ) {
      rightArrow.style.display = "none";
      leftArrow.style.display = "block";
    } else if (this.mainElem.scrollLeft - 10 < 10) {
      leftArrow.style.display = "none";
      rightArrow.style.display = "block";
    } else {
      leftArrow.style.display = "block";
      rightArrow.style.display = "block";
    }
  }
}

function initiate() {
  document.getElementById(
    "referenceImage"
  ).style.backgroundImage = `url("${referenceImageURL}")`;
  document.getElementById("output").src = referenceImageURL;
  colorConScroll = new replaceScroll(
    document.getElementById("colorCon"),
    document.getElementById("copyCon"),
    {}
  );

  clip.on("success", function (e) {
    new notification(document.getElementById("notiCon"), {
      perm: 3,
      head: "Notification",
      notiData: "Copied to your clipboard!",
    });
  });

  clip.on("error", function (e) {
    new notification(document.getElementById("notiCon"), {
      perm: 3,
      head: "Notification",
      notiData: "Could not copy it to your clipboard!",
    });
  });

  aceEditor.setTheme("ace/theme/twilight");
  aceEditor.session.setMode(new HTMLMode());

  for (element of document.getElementsByClassName("colorCopy")) {
    let thisColor = element.getAttribute("data-color");
    element.style.backgroundColor = thisColor;
  }

  document.getElementById("previewMain").src = "blank.html";

  document
    .getElementById("sliderCon")
    .addEventListener("mousemove", function (event) {
      setSlider(event.offsetX);
    });

  document
    .getElementById("sliderCon")
    .addEventListener("mouseover", function (event) {
      setSlider(event.offsetX);
    });

  document
    .getElementById("sliderCon")
    .addEventListener("mouseout", function () {
      setSlider(0);
    });

  document.getElementById("submit").addEventListener("click", function () {
    sendReq();
  });

  document.getElementById("testButton").addEventListener("click", function () {
    getRules();
  });

  document.getElementById("rulesButton").addEventListener("click", function () {
    testScore();
  });
}

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};
function showTime() {
  var now = new Date();
  let date = Math.floor((deadline.getTime() - now.getTime()) / 1000);
  var h = Math.floor(date / (60 * 60)); // 0 - 23
  var m = Math.floor(date / 60); // 0 - 59
  var s = Math.floor(date - m * 60); // 0 - 59
  //   var session = "AM";

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;

  var time = h + ":" + m + ":" + s + " ";
  document.getElementById("clock").textContent = time;

  setTimeout(showTime, 1000);
}

window.onresize = function () {
  colorConScroll.scroll();
};

window.onload = function () {
  deadline = new Date(startTime).addHours(1);
  code = localStorage.getItem("html");
  getRules();
  initiate();
  showTime();
};
