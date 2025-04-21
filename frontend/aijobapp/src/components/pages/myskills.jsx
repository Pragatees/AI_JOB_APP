import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const MySkills = () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const history = useHistory();
  const isMounted = useRef(true);

  const [skillData, setSkillData] = useState({
    skills: [],
    interestedJobRoles: [],
    preference: "Remote",
    experience: 0,
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newJobRole, setNewJobRole] = useState("");
  const [newPreference, setNewPreference] = useState("Remote");
  const [newExperience, setNewExperience] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [showAddSkillForm, setShowAddSkillForm] = useState(false);
  const [skillsAnalysis, setSkillsAnalysis] = useState(null);
  const [previousSkillsAnalysis, setPreviousSkillsAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showReanalyzeButton, setShowReanalyzeButton] = useState(false);
  const [jobStats, setJobStats] = useState({
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open by default
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detect mobile view

  useEffect(() => {
    isMounted.current = true;
    if (!username || !token) {
      history.push("/");
    } else {
      fetchSkillData();
      fetchJobStats();
    }

    // Handle responsive sidebar behavior
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(mobile ? false : true); // Close on mobile, open on desktop
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      isMounted.current = false;
      window.removeEventListener("resize", handleResize);
    };
  }, [username, token, history]);

  const fetchSkillData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/getskills", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isMounted.current) {
        const newSkillData = {
          skills: res.data.skills || [],
          interestedJobRoles: res.data.interestedJobRoles || [],
          preference: res.data.preference || "Remote",
          experience: res.data.experience || 0,
          location: res.data.location || "",
        };
        setSkillData(newSkillData);
        if (newSkillData.skills.length > 0 && newSkillData.interestedJobRoles.length > 0) {
          await handleAnalyzeSkills(newSkillData);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error fetching skill data:", err);
        setError("Failed to fetch skill data. Please try again.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const fetchJobStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get("http://localhost:5000/getjobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isMounted.current) {
        calculateJobStats(res.data);
      }
    } catch (err) {
      console.error("Error fetching job stats:", err);
    } finally {
      if (isMounted.current) {
        setLoadingStats(false);
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

  const handleAnalyzeSkills = async (data = skillData) => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const res = await axios.post(
        "http://localhost:2000/analyze-skills",
        {
          skills: data.skills,
          interestedJobRoles: data.interestedJobRoles,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (isMounted.current) {
        setSkillsAnalysis(res.data);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error analyzing skills:", err);
        setAnalysisError(err.response?.data?.error || "Failed to analyze skills. Please try again.");
      }
    } finally {
      if (isMounted.current) {
        setAnalysisLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    history.push("/");
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/addskills",
        {
          skills: newSkill.split(",").map((s) => s.trim()).filter((s) => s),
          interestedJobRoles: newJobRole
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r),
          preference: newPreference,
          experience: parseInt(newExperience) || 0,
          location: newLocation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (isMounted.current) {
        setSkillData(res.data);
        setNewSkill("");
        setNewJobRole("");
        setNewPreference("Remote");
        setNewExperience("");
        setNewLocation("");
        setShowAddSkillForm(false);
        if (res.data.skills.length > 0 && res.data.interestedJobRoles.length > 0) {
          await handleAnalyzeSkills(res.data);
        }
      }
    } catch (err) {
      console.error("Error adding skill:", err);
      alert(err.response?.data?.message || "Failed to add skill. Please try again.");
    }
  };

  const [editSkillsInput, setEditSkillsInput] = useState("");
  const [editJobRolesInput, setEditJobRolesInput] = useState("");

  useEffect(() => {
    if (editingSkill) {
      setEditSkillsInput(skillData.skills.join(", "));
      setEditJobRolesInput(skillData.interestedJobRoles.join(", "));
    }
  }, [editingSkill, skillData]);

  const handleUpdateSkill = async () => {
    try {
      if (skillsAnalysis) {
        setPreviousSkillsAnalysis(skillsAnalysis);
      }
      const res = await axios.patch(
        "http://localhost:5000/updateskills",
        {
          skills: editSkillsInput.split(",").map((s) => s.trim()).filter((s) => s),
          interestedJobRoles: editJobRolesInput
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r),
          preference: skillData.preference,
          experience: skillData.experience,
          location: skillData.location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (isMounted.current) {
        setSkillData(res.data);
        setEditingSkill(null);
        setEditSkillsInput("");
        setEditJobRolesInput("");
        setShowReanalyzeButton(true);
      }
    } catch (err) {
      console.error("Error updating skill:", err);
      alert(err.response?.data?.message || "Failed to update skill. Please try again.");
    }
  };

  const handleDeleteSkill = async (skill) => {
    const updatedSkills = skillData.skills.filter((s) => s !== skill);
    try {
      if (skillsAnalysis) {
        setPreviousSkillsAnalysis(skillsAnalysis);
      }
      const res = await axios.patch(
        "http://localhost:5000/updateskills",
        { skills: updatedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (isMounted.current) {
        setSkillData(res.data);
        setShowReanalyzeButton(true);
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
      alert(err.response?.data?.message || "Failed to delete skill. Please try again.");
    }
  };

  const getProfileInitial = () => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  const getImprovedSkills = () => {
    if (!previousSkillsAnalysis || !skillsAnalysis) return [];
    return previousSkillsAnalysis.skillsToImprove.filter(
      (skill) => !skillsAnalysis.skillsToImprove.includes(skill)
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`w-screen h-screen flex ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} overflow-hidden`}>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-20 top-4 ${isSidebarOpen ? "left-72" : "left-0"} p-2 rounded-r-md ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-900"} transition-all duration-300 shadow-md`}
      >
        {isSidebarOpen ? "☰" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r flex flex-col transition-all duration-300 overflow-hidden ${isSidebarOpen ? "w-72 p-8" : "w-0 p-0"}`}
      >
        <div className={`${!isSidebarOpen && "hidden"} flex flex-col h-full`}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex justify-center items-center text-white text-4xl font-bold mb-4">
              {getProfileInitial()}
            </div>
            <div className="text-xl font-bold text-center mb-4">{username || "User"}</div>
          </div>
          {/* Job Stats Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Job Application Stats</h3>
            {loadingStats ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                  <span className={`font-medium ${darkMode ? "text-green-300" : "text-green-700"}`}>Applied</span>
                  <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"}`}>
                    {jobStats.applied}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-amber-50"}`}>
                  <span className={`font-medium ${darkMode ? "text-amber-300" : "text-amber-700"}`}>Interviewing</span>
                  <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-800"}`}>
                    {jobStats.interviewing}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-purple-50"}`}>
                  <span className={`font-medium ${darkMode ? "text-purple-300" : "text-purple-700"}`}>Offered</span>
                  <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"}`}>
                    {jobStats.offered}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-red-50"}`}>
                  <span className={`font-medium ${darkMode ? "text-red-300" : "text-red-700"}`}>Rejected</span>
                  <span className={`px-3 py-1 rounded-full font-bold ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`}>
                    {jobStats.rejected}
                  </span>
                </div>
                <div className="mb-4">
                  <button
                    onClick={() => history.push("/job")}
                    className={`p-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium cursor-pointer transition-all duration-200 w-full ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                  >
                    <span role="img" aria-label="home" className="text-lg">🏠</span>
                    Home
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`p-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium cursor-pointer transition-all duration-200 mt-auto ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <span role="img" aria-label="logout" className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>My Skills</h2>
          <button
            className={`rounded-full px-5 py-2.5 cursor-pointer flex items-center gap-2 text-sm transition-all duration-300 ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {error ? (
          <div className={`rounded-xl ${darkMode ? "bg-red-900" : "bg-red-100"} p-6 text-center`}>
            <p className={`${darkMode ? "text-red-300" : "text-red-700"}`}>{error}</p>
            <button
              onClick={fetchSkillData}
              className={`mt-4 py-2 px-4 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} text-white font-medium`}
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : skillData.skills.length === 0 && !showAddSkillForm ? (
          <div className={`flex flex-col items-center justify-center h-96 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-6`}>
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No Skills Added Yet</h3>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Click below to add your skills and preferences.</p>
            <button
              onClick={() => setShowAddSkillForm(true)}
              className={`rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold ${darkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            >
              +
            </button>
          </div>
        ) : showAddSkillForm ? (
          <div className={`flex flex-col items-center justify-center h-96 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-2">Add Your Skills</h3>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Fill in the details below to add your skills and preferences.</p>
            <form onSubmit={handleAddSkill} className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                  placeholder="e.g., JavaScript, Python, React"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interested Job Roles (comma-separated)</label>
                <input
                  type="text"
                  value={newJobRole}
                  onChange={(e) => setNewJobRole(e.target.value)}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                  placeholder="e.g., Software Engineer, Data Scientist"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Work Preference</label>
                <select
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                >
                  <option value="Remote">Remote</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience (years)</label>
                <input
                  type="number"
                  value={newExperience}
                  onChange={(e) => setNewExperience(e.target.value)}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                  placeholder="e.g., 3"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} text-white font-medium`}
                >
                  Add Skills
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSkillForm(false)}
                  className={`w-full py-2 px-4 rounded-lg ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-300 hover:bg-gray-400"}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={`rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-6`}>
            {editingSkill ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Edit Skills & Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={editSkillsInput}
                      onChange={(e) => setEditSkillsInput(e.target.value)}
                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Interested Job Roles (comma-separated)</label>
                    <input
                      type="text"
                      value={editJobRolesInput}
                      onChange={(e) => setEditJobRolesInput(e.target.value)}
                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Work Preference</label>
                    <select
                      value={skillData.preference}
                      onChange={(e) => setSkillData({ ...skillData, preference: e.target.value })}
                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience (years)</label>
                    <input
                      type="number"
                      value={skillData.experience || 0}
                      onChange={(e) => setSkillData({ ...skillData, experience: parseInt(e.target.value) || 0 })}
                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={skillData.location || ""}
                      onChange={(e) => setSkillData({ ...skillData, location: e.target.value })}
                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleUpdateSkill}
                      className={`py-2 px-4 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} text-white font-medium`}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingSkill(null);
                        setEditSkillsInput("");
                        setEditJobRolesInput("");
                      }}
                      className={`py-2 px-4 rounded-lg ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-300 hover:bg-gray-400"}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Your Skills & Preferences</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setEditingSkill(true)}
                      className={`py-2 px-4 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} text-white font-medium`}
                    >
                      Edit
                    </button>
                    {showReanalyzeButton && (
                      <button
                        onClick={() => {
                          handleAnalyzeSkills();
                          setShowReanalyzeButton(false);
                        }}
                        className={`py-2 px-4 rounded-lg ${darkMode ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-600"} text-white font-medium`}
                        disabled={analysisLoading}
                      >
                        {analysisLoading ? "Analyzing..." : "Re-analyze Skills"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillData.skills.length > 0 ? (
                        skillData.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}
                          >
                            {skill}
                            <button
                              onClick={() => handleDeleteSkill(skill)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No skills added.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Interested Job Roles</h4>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {skillData.interestedJobRoles.length > 0 ? skillData.interestedJobRoles.join(", ") : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Work Preference</h4>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{skillData.preference || "Remote"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Experience</h4>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{skillData.experience || 0} years</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Location</h4>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{skillData.location || "Not specified"}</p>
                  </div>
                </div>
                {analysisError && (
                  <div className={`mt-6 rounded-xl ${darkMode ? "bg-red-900" : "bg-red-100"} p-6`}>
                    <p className={`${darkMode ? "text-red-300" : "text-red-700"}`}>{analysisError}</p>
                    <button
                      onClick={handleAnalyzeSkills}
                      className={`mt-4 py-2 px-4 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} text-white font-medium`}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {skillsAnalysis && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-semibold">Skills Analysis</h3>
                    {getImprovedSkills().length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Improved Skills</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getImprovedSkills().map((skill, idx) => (
                            <span
                              key={idx}
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${darkMode ? "bg-blue-700 text-blue-200" : "bg-blue-100 text-blue-800"}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Skills to Improve</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skillsAnalysis.skillsToImprove.length > 0 ? (
                          skillsAnalysis.skillsToImprove.map((skill, idx) => (
                            <span
                              key={idx}
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${darkMode ? "bg-yellow-700 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No improvements suggested.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Additional Skills to Learn</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skillsAnalysis.additionalSkills.length > 0 ? (
                          skillsAnalysis.additionalSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${darkMode ? "bg-green-700 text-green-200" : "bg-green-100 text-green-800"}`}
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No additional skills suggested.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Career Advice</h4>
                      <ul className={`list-disc pl-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {skillsAnalysis.careerAdvice.map((advice, idx) => (
                          <li key={idx}>{advice}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySkills;