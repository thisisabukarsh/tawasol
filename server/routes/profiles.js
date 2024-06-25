const express = require("express");
const { auth, upload } = require("../Utils");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Post = require("../models/Post");

//-----------------------POST http://localhost:5000/api/profiles/ ----------------------------------------------------
router.post(
  "/",
  auth,
  check("status", "Status is required").notEmpty(),
  check("skills", "Skills is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      github,
      ...rest
    } = req.body;

    const normalize = (await import("normalize-url")).default;

    const profile = {
      user: req.user.id,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => skill.trim()),
      ...rest,
    };

    const socialFields = {
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      github,
    };

    for (let key in socialFields) {
      const value = socialFields[key];
      if (value && value !== "") {
        socialFields[key] = normalize(value, { forceHttps: true });
      }
    }

    profile.social = socialFields;

    try {
      let profileObject = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profile },
        { new: true, upsert: true }
      );
      return res.json(profileObject);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send(error.message);
    }
  }
);

//-----------------------GET http://localhost:5000/api/profiles/me --------------------------------------------------
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({
      user: req.user.id,
    }).populate("user", ["name"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

//-----------------------GET http://localhost:5000/api/profiles -----------------------------------------------------
router.get("/", auth, async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

//-----------------------GET http://localhost:5000/api/profiles/user/:user_id ----------------------------------------
router.get("/user/:user_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name"]);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for given user" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

//-----------------------DELETE http://localhost:5000/api/profiles ---------------------------------------------------
router.delete("/", auth, async (req, res) => {
  try {
    await Promise.all([
      Post.deleteMany({ user: req.user_id }),
      Profile.findOneAndRemove({ user: req.user.id }),
      User.findOneAndRemove({ _id: req.user.id }),
    ]);
    res.json({ msg: "User information deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

//-----------------------POST http://localhost:5000/api/profiles/upload ----------------------------------------------
router.post("/upload", auth, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).send(`Server error ${err}`);
      } else {
        res.status(200).send(req.user.id);
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

//-----------------------PUT http://localhost:5000/api/profiles/experience -------------------------------------------
router.put(
  "/experience",
  auth,
  check("title", "Title is required").notEmpty(),
  check("company", "Company is required").notEmpty(),
  check("from", "From is required and needs to be in the past")
    .notEmpty()
    .custom((value, { req }) => {
      req.body.to ? value < req.body.to : true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      Profile.experience.unshift(req.body);

      await profile.save();
      return res.json({ profile: profile });
    } catch (error) {
      console.error(error.message);
      res.status(500).send(error.message);
    }
  }
);

//-----------------------DELETE http://localhost:5000/api/profiles/experience/:exp_id --------------------------------
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.experience = profile.experience.filter((exp) => {
      return exp._id.toString() !== req.params.exp_id;
    });

    await profile.save();
    return res.json({ profile: profile });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

//-----------------------PUT http://localhost:5000/api/profiles/education --------------------------------------------
router.put(
  "/education",
  auth,
  check("school", "School is required").notEmpty(),
  check("degree", "Degree is required").notEmpty(),
  check("fieldofstudy", "Field of study is required").notEmpty(),
  check("from", "From is required and needs to be in the past")
    .notEmpty()
    .custom((value, { req }) => {
      req.body.to ? value < req.body.to : true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      Profile.education.unshift(req.body);

      await profile.save();
      return res.json({ profile: profile });
    } catch (error) {
      console.error(error.message);
      res.status(500).send(error.message);
    }
  }
);

//-----------------------DELETE http://localhost:5000/api/profiles/education/:edu_id ---------------------------------
router.delete("education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.education = profile.education.filter((exp) => {
      return edu._id.toString() !== req.params.edu_id;
    });

    await profile.save();
    return res.json({ profile: profile });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
