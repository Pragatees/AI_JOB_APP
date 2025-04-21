const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "resumes.files" // Reference to GridFS files collection
  }
});

module.exports = mongoose.model("User", userSchema);