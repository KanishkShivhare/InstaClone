var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const storyModel = require("./story");
const commentModel = require("./comment");
const passport = require("passport");
var localStrategy = require("passport-local");
const upload = require("./multer");
const fs = require("fs");
const { log } = require("console");
const comment = require("./comment");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});
router.get("/followers",isloggedIn,async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("followers")
  res.render("followers", { footer: true ,user });
});
router.get("/following",isloggedIn,async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("following")
  res.render("following", { footer: true ,user });
});
router.get("/save", isloggedIn, async function(req, res) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user
    }).populate({ path: 'saved', populate: { path: 'user' } });
    // console.log(user.saved);
    res.render("save", { user: user, footer: true }); // Pass user object as a key-value pair
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/comments/:receiver", isloggedIn,async function (req, res) {
  const comments = await commentModel.find({
    receiver: req.params.receiver,
  }).populate("sender")
  res.json(comments);
});
router.post("/comment/:comment/:receiver",isloggedIn,async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  // const comments = await commentModel.find().populate("user");
  const comment = await commentModel.create({
    sender: user._id,
    receiver: req.params.receiver,
    comment: req.params.comment
  })
  // console.log(comment.comment);
  const post = await postModel.findOne({
    _id:req.params.receiver
  })
  
});
router.get("/share",isloggedIn ,async function (req, res) {
  const users = await userModel.find({username:{$ne:req.session.passport.user}})
  res.json(users);
});
router.get("/msguser",isloggedIn, async function (req, res) {
  const userprofiles = await userModel.find({username:{$ne:req.session.passport.user}})
  res.render("msguser", { footer: false , userprofiles});
});
router.get("/msg/:chatusername",isloggedIn,async function (req, res) {
  
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const chatuser = await userModel.findOne({
    username: req.params.chatusername
  })
  const posts = await postModel.find().populate("user");
  if (req.params.chatusername == req.session.passport.user) {
    res.redirect("/profile")
  }else{
    res.render("msg", { footer: false ,chatuser,user,posts });
  }
});
router.get("/posts/:userId",isloggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const posts = await postModel.find({
    user:req.params.userId
  }).populate("user");
  res.render("posts", { footer: false, posts,user });
});
router.get("/follow/:userprofileId",isloggedIn, async function (req, res) {
  req.session.previousUrl = req.headers.referer || '/';
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const userprofile = await userModel.findOne({
    _id : req.params.userprofileId,
  });
  // console.log(userprofile);
  if(user.following.indexOf(userprofile._id) === -1) {
    userprofile.followers.push(user._id);
    user.following.push(req.params.userprofileId);
  } else {
    userprofile.followers.splice(userprofile.followers.indexOf(user._id), 1);
    user.following.splice(user.following.indexOf(req.params.userprofileId), 1);
  }

  await userprofile.save();
  await user.save();
  // res.redirect(req.session.previousUrl);
  res.json(userprofile);
});
router.get("/userprofile/:username",isloggedIn, async function (req, res) {
 
  if (req.session.passport.user === req.params.username) {
    res.redirect("/profile");
  } else {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const userprofile = await userModel.findOne({
      username: req.params.username,
    }).populate("posts");
    res.render("userprofile", { footer: true, userprofile ,user});
  }
  
});

router.get("/story/:num",isloggedIn , async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const storyuser = await userModel.findOne({
    username: req.session.passport.user,
  }).populate("stories");
  var num = req.params.num 
  if (storyuser.stories.length > num) {
    res.render("story", { footer: false,user,storyuser,num});
  } else {
    res.redirect("/feed")
  }
});

router.get("/story/:id/:num",isloggedIn , async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const storyuser = await userModel.findOne({
    _id: req.params.id,
  }).populate("stories")
  var num = req.params.num 
  if (storyuser.stories.length > num) {
    res.render("story", { footer: false,user,storyuser,num});
  } else {
    res.redirect("/feed")
  }
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isloggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const posts = await postModel.find().populate("user");
  const stories = await storyModel.find({user:{$ne:user._id}}).populate("user");
  // console.log(stories);

  var obj = {};
  const packs = stories.filter(function (story) {
    if (!obj[story.user._id]) {
      obj[story.user._id] = "kuch_bhi_de_skte_h";
      return true;
    }
  });
  

  res.render("feed", { footer: true, posts, user,stories: packs });
});
router.post("/update", isloggedIn, async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, name: req.body.name, bio: req.body.bio },
    { new: true }
  );

  req.logIn(user, function (err) {
    if (err) throw err;
    res.redirect("/profile");
  });
});

router.get("/profile", isloggedIn, async function (req, res) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
    const posts = await postModel.find({
      user: user.id,
    })
    .populate("user");
    
  res.render("profile", { footer: true, user , posts });
});

router.post(
  "/upload/profilepic",
  isloggedIn,
  upload.single("image"),
  async function (req, res) {
    if ("default.webp" != req.user.profilepicture) {
      if (req.file) {
        const previousImagePath = `./public/images/uploads/${req.user.profilepicture}`;
        fs.unlink(previousImagePath, (err) => {
          if (err) {
            console.error("Error deleting previous profile picture:", err);
          }
        });
      }
    }

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profilepicture = req.file.filename;
    await user.save();
    res.render("profile", { footer: true, user });
  }
);

router.get("/search", isloggedIn,async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("search", { footer: true ,user});
});
router.get("/user/:username", isloggedIn, async function (req, res) {
  var val = req.params.username;
  const users = await userModel.find({
    username: new RegExp("^" + val, "i"),
  });
  res.json(users);
});

router.get("/edit", isloggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("edit", { footer: true, user });
});

router.get("/upload", isloggedIn,async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("upload", { footer: true,user });
});
router.get("/save/:postid", isloggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  if (user.saved.indexOf(req.params.postid) === -1) {
    user.saved.push(req.params.postid);
  } else {
    user.saved.splice(user.saved.indexOf(req.params.postid), 1);
  }
  await user.save();
  res.json(user);
});

router.get("/like:postid", isloggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = await postModel.findOne({
    _id: req.params.postid,
  });
  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  } else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});

router.post(
  "/upload",
  isloggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    if (req.body.type === "post") {
      const post = await postModel.create({
        //user me  user :user_id hai voh isliye kyo ki user me type id diya tha toh voh id hi lega or user: user ban gaya toh use likh skte h
        user: user._id,
        caption: req.body.caption,
        image: req.file.filename,
      });
      user.posts.push(post._id);
    } else {
      const story = await storyModel.create({
        user: user._id,
        image: req.file.filename,
      });
      user.stories.push(story._id);
    }
    await user.save();
    res.redirect("/feed");
  }
);

router.post("/register", (req, res) => {
  const { email, username, name } = req.body;
  var userdetails = new userModel({
    username,
    name,
    email,
  });
  userModel
    .register(userdetails, req.body.password)
    .then((result) => {
      passport.authenticate("local")(req, res, () => {
        //destination after user register
        res.redirect("/feed");
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/login",
  }),
  (req, res, next) => {}
);
router.get('/logout', (req, res, next) => {
if (req.isAuthenticated())
req.logout((err) => {
if (err) res.send(err);
else res.redirect('/');
});
else {
res.redirect('/');
}
});
function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}

module.exports = router;
