const express = require("express");
const { auth } = require("../Utils");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Profile = require("../models/Profile");

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
router.get("/me", async (req, res) => {});

//-----------------------GET http://localhost:5000/api/profiles -----------------------------------------------------

router.get("/", async (req, res) => {});

//-----------------------GET http://localhost:5000/api/profiles/user/:user_id ----------------------------------------
router.get("/profiles/user/:user_id", async (req, res) => {});

//-----------------------DELETE http://localhost:5000/api/profiles ---------------------------------------------------

router.delete("/profiles", async (req, res) => {});

//-----------------------POST http://localhost:5000/api/profiles/upload ----------------------------------------------
router.post("/profiles/upload", async (req, res) => {});

//-----------------------PUT http://localhost:5000/api/profiles/experience -------------------------------------------
router.put("/profiles/experience", async (req, res) => {});

//-----------------------DELETE http://localhost:5000/api/profiles/experience/:exp_id --------------------------------
router.delete("/profiles/experience/:exp_id", async (req, res) => {});

//-----------------------PUT http://localhost:5000/api/profiles/education --------------------------------------------
router.put("/profiles/education", async (req, res) => {});

//-----------------------DELETE http://localhost:5000/api/profiles/education/:edu_id ---------------------------------
router.delete("/profiles/education/:edu_id", async (req, res) => {});

module.exports = router;
