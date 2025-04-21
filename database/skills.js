const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  skills: { type: [String], default: [] },
  interestedJobRoles: { type: [String], default: [] },
  preference: { type: String, default: "Remote" },
  experience: { type: Number, default: 0 },
  location: { type: String, default: "" },
});

module.exports = mongoose.model("Skill", skillSchema);