const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  skillsRequired: {
    type: String,
    trim: true,
    default: "",
  },
  interviewDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Applied", "Interviewing", "Offered", "Rejected"],
    default: "Applied",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);