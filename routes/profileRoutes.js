const express = require("express");
const router = express.Router();
const profile = require("../controllers/profilecontroller");
const { authenticate } = require("../middlewares/authorizedUser");
const profileupload = require("../middlewares/profileupload"); 

router.get("/", authenticate, profile.getProfile);

router.put("/update", authenticate, profile.updateProfile);

router.put(
  "/upload-image",
  authenticate,
  profileupload.single("profileImage"),
  profile.updateProfileImage
);

router.put(
  "/change-password",
  authenticate,
  profile.changePassword
);

module.exports = router;
