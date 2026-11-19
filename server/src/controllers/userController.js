
const User = require("../models/User");

// Get logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile.",
    });
  }
};

// Update logged-in user's profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      updates.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }

      updates.phone = phone.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates, $unset: { profileImage: "" } },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
