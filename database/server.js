const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const empmodel = require("./user");
const jobModel = require("./job");
const Skill = require("./skills");

dotenv.config(); // Load env variables

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB Atlas connection
let gfs;
let profilePicsBucket; // Separate bucket for profile pictures
mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
    gfs = new GridFSBucket(mongoose.connection.db, {
      bucketName: "resumes"
    });
    profilePicsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "profilePics"
    });
  })
  .catch((err) => console.error("❌ Connection failed:", err));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ---------------------- Signup ---------------------- */
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await empmodel.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists ❌" });

    const user = new empmodel({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- Login + JWT ---------------------- */
app.post("/login", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await empmodel.findOne({ username });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- JWT Middleware ---------------------- */
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token required ❌" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token ❌" });
    req.user = decoded;
    next();
  });
};

// ====================== NEW SKILLS AND PROFILE PICTURE ROUTES ======================

/* ---------------------- Get User Data (with skills) ---------------------- */
app.get("/getuser", authenticate, async (req, res) => {
  try {
    const user = await empmodel.findOne({ username: req.user.username })
      .select("-password -__v")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- Get Skills ---------------------- */
app.get("/getskills", authenticate, async (req, res) => {
  try {
    const skills = await Skill.findOne({ username: req.user.username });
    if (!skills) {
      // Return an empty skills object instead of 404
      return res.json({
        skills: [],
        interestedJobRoles: [],
        preference: "Remote",
        experience: 0,
        location: ""
      });
    }
    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------------------- Add or Update Skills ---------------------- */
app.post("/addskills", authenticate, async (req, res) => {
  try {
    const { skills, interestedJobRoles, preference, experience, location } = req.body;

    let skillData = await Skill.findOne({ username: req.user.username });

    if (!skillData) {
      // Create new skill entry if doesn't exist
      skillData = new Skill({
        username: req.user.username,
        skills,
        interestedJobRoles,
        preference,
        experience,
        location
      });
    } else {
      // Update existing entry
      skillData.skills = skills;
      skillData.interestedJobRoles = interestedJobRoles;
      skillData.preference = preference;
      skillData.experience = experience;
      skillData.location = location;
    }

    await skillData.save();
    res.json(skillData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/* ---------------------- Update Skills ---------------------- */
app.patch("/updateskills", authenticate, async (req, res) => {
  try {
    const { skills, interestedJobRoles, preference, experience, location } = req.body;

    const skillData = await Skill.findOne({ username: req.user.username });
    if (!skillData) {
      return res.status(404).json({ message: "Skills not found" });
    }

    if (skills) skillData.skills = skills;
    if (interestedJobRoles) skillData.interestedJobRoles = interestedJobRoles;
    if (preference) skillData.preference = preference;
    if (experience) skillData.experience = experience;
    if (location) skillData.location = location;

    await skillData.save();
    res.json(skillData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/* ---------------------- Upload/Update Resume ---------------------- */
app.post("/upload-resume", authenticate, upload.single("resume"), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    const username = req.user.username;

    // Delete existing resume if present
    const user = await empmodel.findOne({ username });
    if (user.resume) {
      try {
        await gfs.delete(user.resume);
      } catch (err) {
        console.warn("Warning: Could not delete existing resume:", err);
      }
    }

    // Upload new resume to GridFS
    const writeStream = gfs.openUploadStream(`${username}_resume.pdf`, {
      contentType: file.mimetype,
      metadata: { username }
    });

    writeStream.end(file.buffer);

    writeStream.on("finish", async () => {
      await empmodel.updateOne(
        { username },
        { $set: { resume: writeStream.id } }
      );
      res.status(201).json({ 
        message: "Resume uploaded successfully ✅", 
        fileId: writeStream.id 
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error uploading resume:", err);
      res.status(500).json({ message: "Error uploading resume" });
    });
  } catch (err) {
    console.error("Error in upload-resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- Get Resume ---------------------- */
app.get("/get-resume", authenticate, async (req, res) => {
  try {
    const username = req.user.username;

    // Find the file in GridFS using metadata.username
    const file = await mongoose.connection.db.collection('resumes.files').findOne({
      "metadata.username": username
    });

    if (!file) {
      return res.status(404).json({ message: "Resume not found for this user" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'resumes'
    });

    // Set proper headers
    res.set("Content-Type", file.contentType || "application/pdf");
    res.set("Content-Disposition", `attachment; filename="${username}_resume.pdf"`);

    // Stream the file to response
    bucket.openDownloadStream(file._id).pipe(res).on("error", (err) => {
      console.error("Error streaming resume:", err);
      res.status(500).json({ message: "Error retrieving resume" });
    });

  } catch (err) {
    console.error("Error in get-resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- Delete Resume ---------------------- */
app.delete("/delete-resume", authenticate, async (req, res) => {
  try {
    const username = req.user.username;
    const user = await empmodel.findOne({ username });
    
    if (!user || !user.resume) {
      return res.status(404).json({ message: "No resume found for this user" });
    }

    // Delete from GridFS
    await gfs.delete(user.resume);
    
    // Remove reference from user document
    await empmodel.updateOne(
      { username },
      { $unset: { resume: "" } }
    );

    res.status(200).json({ message: "Resume deleted successfully ✅" });
  } catch (err) {
    console.error("Error deleting resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- Get Users ---------------------- */
app.get("/getusers", authenticate, async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ message: "Username required" });

  try {
    const users = await empmodel.find({ username });
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- Add Job ---------------------- */
app.post("/addjob", authenticate, async (req, res) => {
  try {
    const { companyName, role, skillsRequired, interviewDate, status, username } = req.body;

    if (!companyName || !role || !interviewDate || !status || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedDate = new Date(interviewDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid interviewDate format" });
    }

    const validStatuses = ["Applied", "Interviewing", "Offered", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (username !== req.user.username) {
      return res.status(403).json({ message: "Unauthorized: username mismatch" });
    }

    const job = new jobModel({
      username,
      companyName,
      role,
      skillsRequired: skillsRequired || "",
      interviewDate: parsedDate,
      status,
    });

    await job.save();
    res.status(201).json({ message: "Job application added ✅", job });
  } catch (err) {
    console.error("Add job error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: err.errors });
    }
    res.status(500).json({ message: "Server error", details: err.message });
  }
});

/* ---------------------- Retrieve Jobs ---------------------- */
app.get("/getjobs", authenticate, async (req, res) => {
  try {
    const username = req.user.username;
    const jobs = await jobModel.find({ username });
    res.json(jobs);
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- Update Job Status ---------------------- */
app.patch("/updatejob/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Applied", "Interviewing", "Offered", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status value" });
    }

    const job = await jobModel.findOne({ _id: id, username: req.user.username });
    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    job.status = status;
    await job.save();

    res.status(200).json({ message: "Job status updated ✅", job });
  } catch (err) {
    console.error("Update job error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: err.errors });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    res.status(500).json({ message: "Server error", details: err.message });
  }
});

/* ---------------------- Test Route ---------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Server running with MongoDB Atlas and JWT!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live on http://localhost:${PORT}`);
});