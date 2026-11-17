
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/userController");

router.use(protect);

router.get("/me", getMyProfile);

router.patch("/me", updateMyProfile);

module.exports = router;
