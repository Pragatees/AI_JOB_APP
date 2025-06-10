import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Profile = () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const history = useHistory();
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [skillsData, setSkillsData] = useState({
    skills: [],
    interestedJobRoles: [],
    preference: "Remote",
    experience: 0,
    location: "",
  });
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [jobStats, setJobStats] = useState({
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [editMode, setEditMode] = useState(null); // "user", "skills", or "resume"
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    skills: "",
    interestedJobRoles: "",
    preference: "Remote",
    experience: 0,
    location: "",
    resume: null,
  });
  const [error, setError] = useState("");

  // Fetch all necessary data on mount
  useEffect(() => {
    if (!username || !token) {
      history.push("/");
    } else {
      fetchUserData();
      fetchSkills();
      fetchJobs();
      checkResume();
    }
  }, [username, token, history]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/getuser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
      setFormData((prev) => ({ ...prev, username: res.data.username, email: res.data.email }));
    } catch (err) {
      console.error("Error fetching user data:", err);
      alert("Failed to fetch user data. Please try again.");
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axios.get("http://localhost:5000/getskills", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkillsData(res.data);
      setFormData((prev) => ({
        ...prev,
        skills: res.data.skills.join(", "),
        interestedJobRoles: res.data.interestedJobRoles.join(", "),
        preference: res.data.preference,
        experience: res.data.experience,
        location: res.data.location,
      }));
    } catch (err) {
      console.error("Error fetching skills:", err);
      alert("Failed to fetch skills. Please try again.");
    }
  };

  const fetchJobs = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get("http://localhost:5000/getjobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rejected = res.data.filter((job) => job.status === "Rejected");
      setRejectedJobs(rejected);
      calculateJobStats(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      alert("Failed to fetch jobs. Please try again.");
    } finally {
      setLoadingStats(false);
    }
  };

  const checkResume = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get-resume", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setResumeAvailable(true);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error checking resume:", err);
        alert("Failed to check resume. Please try again.");
      }
    }
  };

  const calculateJobStats = (jobs) => {
    const stats = {
      applied: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
    };

    jobs.forEach((job) => {
      switch (job.status) {
        case "Applied":
          stats.applied += 1;
          break;
        case "Interviewing":
          stats.interviewing += 1;
          break;
        case "Offered":
          stats.offered += 1;
          break;
        case "Rejected":
          stats.rejected += 1;
          break;
        default:
          break;
      }
    });

    setJobStats(stats);
  };

  const handlePasswordSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/verify-password",
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPasswordModal(false);
      setPassword("");
      setError("");
      if (editMode === "user") {
        setUserData({ ...userData, editing: true });
      } else if (editMode === "skills") {
        setSkillsData({ ...skillsData, editing: true });
      } else if (editMode === "resume") {
        setFormData((prev) => ({ ...prev, editingResume: true }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify password. Please try again.");
    }
  };

  const handleEdit = (type) => {
    setEditMode(type);
    setShowPasswordModal(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData((prev) => ({ ...prev, resume: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUserUpdate = async () => {
    try {
      const res = await axios.patch(
        "http://localhost:5000/update-user",
        { username: formData.username, email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData({ ...res.data.user, editing: false });
      localStorage.setItem("username", res.data.user.username);
      alert("User details updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user details. Please try again.");
    }
  };

  const handleSkillsUpdate = async () => {
    try {
      const skillsArray = formData.skills.split(",").map((skill) => skill.trim());
      const rolesArray = formData.interestedJobRoles.split(",").map((role) => role.trim());
      await axios.patch(
        "http://localhost:5000/updateskills",
        {
          skills: skillsArray,
          interestedJobRoles: rolesArray,
          preference: formData.preference,
          experience: parseInt(formData.experience),
          location: formData.location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkillsData({
        ...skillsData,
        skills: skillsArray,
        interestedJobRoles: rolesArray,
        preference: formData.preference,
        experience: parseInt(formData.experience),
        location: formData.location,
        editing: false,
      });
      alert("Skills updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update skills. Please try again.");
    }
  };

  const handleResumeUpdate = async () => {
    if (!formData.resume) {
      alert("Please select a PDF file.");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("resume", formData.resume);
    try {
      await axios.post("http://localhost:5000/upload-resume", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setResumeAvailable(true);
      setFormData((prev) => ({ ...prev, resume: null, editingResume: false }));
      alert("Resume uploaded successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload resume. Please try again.");
    }
  };

  const handleDownloadResume = () => {
    window.open("http://localhost:5000/get-resume", "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    history.push("/");
  };

  const handleInterviewTipsClick = () => {
    history.push("/search");
  };

  const handleResumeAnalyzerClick = () => {
    history.push("/res");
  };

  const handleskills = () => {
    history.push("/ski");
  };

  const getProfileInitial = () => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`w-screen h-screen flex ${darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"} overflow-hidden`}>
      {/* Sidebar (Unchanged) */}
      <div className={`h-full ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border-r flex flex-col transition-all duration-300 ${isSidebarOpen ? "w-72 p-8" : "w-0 p-0 overflow-hidden"}`}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex justify-center items-center text-white text-4xl font-bold mb-4">
            {getProfileInitial()}
          </div>
          <div className="text-xl font-bold text-center mb-4">{username}</div>
        </div>

        {/* Job Stats Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Job Application Stats</h3>
          {loadingStats ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                <span className={`font-medium ${darkMode ? "text-green-300" : "text-green-700"}`}>Applied</span>
                <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-gray-600 text-green-300" : "bg-green-100 text-green-800"}`}>
                  {jobStats.applied}
                </span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-amber-50"}`}>
                <span className={`font-medium ${darkMode ? "text-amber-300" : "text-amber-700"}`}>Interviewing</span>
                <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-gray-600 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
                  {jobStats.interviewing}
                </span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-purple-50"}`}>
                <span className={`font-medium ${darkMode ? "text-purple-300" : "text-purple-700"}`}>Offered</span>
                <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-gray-600 text-purple-300" : "bg-purple-100 text-purple-800"}`}>
                  {jobStats.offered}
                </span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-red-50"}`}>
                <span className={`font-medium ${darkMode ? "text-red-300" : "text-red-700"}`}>Rejected</span>
                <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-gray-600 text-red-300" : "bg-red-100 text-red-800"}`}>
                  {jobStats.rejected}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Interview Tips Button */}
        <div className="mb-4">
          <button
            onClick={handleInterviewTipsClick}
            className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border p-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium cursor-pointer transition-all duration-200 w-full`}
          >
            <span role="img" aria-label="interview-tips" className="text-lg">
              💡
            </span>
            Interview Tips
          </button>
        </div>

        {/* Resume Analyzer Button */}
        <div className="mb-8">
          <button
            onClick={handleResumeAnalyzerClick}
            className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border p-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium cursor-pointer transition-all duration-200 w-full`}
          >
            <span role="img" aria-label="resume-analyzer" className="text-lg">
              📄
            </span>
            Resume Analyzer
          </button>
        </div>

        <div className="mb-8">
          <button
            onClick={handleskills}
            className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border p-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium cursor-pointer transition-all duration-200 w-full`}
          >
            <span role="img" aria-label="resume-analyzer" className="text-lg">
              🧠
            </span>
            My skills
          </button>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border p-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium cursor-pointer transition-all duration-200 mt-auto`}
        >
          <span role="img" aria-label="logout" className="text-lg">
            🚪
          </span>
          Logout
        </button>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-4 ${isSidebarOpen ? "left-72" : "left-0"} z-10 p-2 rounded-r-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"} shadow-md transition-all duration-300`}
      >
        {isSidebarOpen ? "☰" : "☰"}
      </button>

      {/* Main Content */}
      <div className={`flex-1 p-8 overflow-auto ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            👤 My Profile
          </h2>
          <button
            className={`${darkMode ? "bg-gray-100 text-gray-800" : "bg-gray-800 text-gray-100"} rounded-full px-5 py-2.5 cursor-pointer flex items-center gap-2 text-sm transition-all duration-300`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* User Details Section */}
        <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-white"} mb-6 ${darkMode ? "shadow-lg shadow-gray-900/30" : "shadow-md"}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Personal Information</h3>
            {!userData.editing && (
              <button
                onClick={() => handleEdit("user")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
            )}
          </div>
          {userData.editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleUserUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setUserData({ ...userData, editing: false })}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-white"} mb-6 ${darkMode ? "shadow-lg shadow-gray-900/30" : "shadow-md"}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Skills & Preferences</h3>
            {!skillsData.editing && (
              <button
                onClick={() => handleEdit("skills")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
            )}
          </div>
          {skillsData.editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Interested Job Roles (comma separated)</label>
                <input
                  type="text"
                  name="interestedJobRoles"
                  value={formData.interestedJobRoles}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Work Preference</label>
                <select
                  name="preference"
                  value={formData.preference}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Preferred Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleSkillsUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setSkillsData({ ...skillsData, editing: false })}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Skills:</strong> {skillsData.skills.length > 0 ? skillsData.skills.join(", ") : "None"}</p>
              <p><strong>Interested Job Roles:</strong> {skillsData.interestedJobRoles.length > 0 ? skillsData.interestedJobRoles.join(", ") : "None"}</p>
              <p><strong>Work Preference:</strong> {skillsData.preference}</p>
              <p><strong>Years of Experience:</strong> {skillsData.experience}</p>
              <p><strong>Preferred Location:</strong> {skillsData.location || "Not specified"}</p>
            </div>
          )}
        </div>

        {/* Resume Section */}
        <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-white"} mb-6 ${darkMode ? "shadow-lg shadow-gray-900/30" : "shadow-md"}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Resume</h3>
            {!formData.editingResume && (
              <button
                onClick={() => handleEdit("resume")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                {resumeAvailable ? "Update Resume" : "Upload Resume"}
              </button>
            )}
          </div>
          {formData.editingResume ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Upload Resume (PDF only)</label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleChange}
                  accept=".pdf"
                  className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleResumeUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setFormData({ ...formData, editingResume: false, resume: null })}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {resumeAvailable ? (
                <button
                  onClick={handleDownloadResume}
                  className="text-blue-500 hover:underline"
                >
                  Download Resume
                </button>
              ) : (
                <p>No resume uploaded.</p>
              )}
            </div>
          )}
        </div>

        {/* Rejected Jobs Section */}
        <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-white"} ${darkMode ? "shadow-lg shadow-gray-900/30" : "shadow-md"}`}>
          <h3 className="text-xl font-bold mb-4">Rejected Job Applications</h3>
          {rejectedJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedJobs.map((job) => (
                <div
                  key={job._id}
                  className={`p-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-gray-50"}`}
                >
                  <h4 className="font-semibold">{job.companyName}</h4>
                  <p><strong>Role:</strong> {job.role}</p>
                  <p><strong>Skills:</strong> {job.skillsRequired || "Not specified"}</p>
                  <p><strong>Interview Date:</strong> {new Date(job.interviewDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> ❌ Rejected</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No rejected job applications.</p>
          )}
        </div>

        {/* Password Verification Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"} p-8 rounded-xl w-11/12 max-w-md shadow-2xl`}>
              <h3 className="text-xl font-bold mb-4">Enter Password to Edit</h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full p-2 border rounded-md mb-4 ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handlePasswordSubmit}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setError("");
                    setEditMode(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;