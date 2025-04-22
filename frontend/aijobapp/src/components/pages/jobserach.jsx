import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const JobManagement = () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const history = useHistory();
  const [jobs, setJobs] = useState([]);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [jobStats, setJobStats] = useState({
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedRole, setSelectedRole] = useState("");
  const [tipData, setTipData] = useState({
    advice: "",
    tips: [],
    questions: [],
  });
  const [tipError, setTipError] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Status color map for job cards
  const statusColors = {
    Applied: "bg-green-100 text-green-800",
    Interviewing: "bg-amber-100 text-amber-800",
    Offered: "bg-purple-100 text-purple-800",
    Rejected: "bg-red-100 text-red-800",
  };

  const statusBorderColors = {
    Applied: "border-green-200",
    Interviewing: "border-amber-200",
    Offered: "border-purple-200",
    Rejected: "border-red-200",
  };

  useEffect(() => {
    if (!username || !token) {
      history.push("/");
    } else {
      fetchJobs();
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(mobile ? false : true); // Close sidebar on mobile, open on desktop
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [username, token, history]);

  const fetchJobs = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get("http://localhost:5000/getjobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
      calculateJobStats(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      alert("Failed to fetch jobs. Please try again.");
    } finally {
      setLoadingStats(false);
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

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    history.push("/");
  };

  const handleInterviewTipsClick = () => {
    history.push("/job");
  };

  const handleGetTip = async (role) => {
    setSelectedRole(role);
    setTipError("");
    setTipData({ advice: "", tips: [], questions: [] });
    setTipLoading(true);
    setShowTipsModal(true);

    try {
      const response = await axios.post("http://localhost:2000/", { role });
      if (response.status === 200) {
        const data = response.data;
        setTipData({
          advice: data.advice || "",
          tips: data.tips || [],
          questions: data.questions || [],
        });
      } else {
        setTipError("Failed to get response from server.");
      }
    } catch (error) {
      setTipError("Error connecting to server.");
    } finally {
      setTipLoading(false);
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "Applied":
        return "📝";
      case "Interviewing":
        return "🤝";
      case "Offered":
        return "🎉";
      case "Rejected":
        return "❌";
      default:
        return "📌";
    }
  };

  const getJobCardColor = (companyName) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-amber-500 to-amber-600",
      "from-red-500 to-red-600",
      "from-indigo-500 to-indigo-600",
      "from-pink-500 to-pink-600",
      "from-teal-500 to-teal-600",
    ];

    const hash = companyName.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const getProfileInitial = () => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`w-screen h-screen flex ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} overflow-hidden`}>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-20 top-4 ${sidebarOpen ? "left-72" : "left-0"} p-2 rounded-r-md ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-900"} transition-all duration-300 shadow-md`}
      >
        {sidebarOpen ? "☰" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`h-full ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r flex flex-col transition-all duration-300 overflow-hidden ${sidebarOpen ? "w-72 p-8" : "w-0 p-0"}`}
      >
        <div className={`${!sidebarOpen && "hidden"} flex flex-col h-full`}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex justify-center items-center text-white text-4xl font-bold mb-4">
              {getProfileInitial()}
            </div>
            <div className="text-xl font-bold text-center mb-4">{username}</div>
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
              </div>
            )}
          </div>

          {/* Interview Tips Button */}
          <div className="mb-8">
            <button
              onClick={handleInterviewTipsClick}
              className={`p-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium cursor-pointer transition-all duration-200 w-full ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              <span role="img" aria-label="interview-tips" className="text-lg">🏠</span>
              Home
            </button>
          </div>

          {/* Logout button */}
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
      <div className={`flex-1 p-8 overflow-auto transition-all duration-300`}>
        SecondaryHeader
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Your Job Applications
          </h2>
          <div className="flex items-center gap-4">
            <button
              className={`rounded-full px-5 py-2.5 cursor-pointer flex items-center gap-2 text-sm transition-all duration-300 ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-96 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No Job Applications Yet</h3>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>You haven't added any job applications</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobs.filter(job => job.status !== "Rejected").map((job) => {
              const gradientClass = getJobCardColor(job.companyName);
              const statusEmoji = getStatusEmoji(job.status);

              return (
                <div
                  key={job._id}
                  className={`rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 h-96 flex flex-col`}
                >
                  {/* Company Header with Gradient */}
                  <div className={`h-24 bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                    <h3 className="text-xl font-bold text-white text-center px-4">{job.companyName}</h3>
                  </div>

                  {/* Job Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${statusColors[job.status]} ${statusBorderColors[job.status]} border`}>
                      <span className="mr-1">{statusEmoji}</span>
                      {job.status}
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Role</h4>
                      <p className="text-lg font-medium">{job.role}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Skills Required</h4>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {job.skillsRequired || "Not specified"}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Interview Date</h4>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {new Date(job.interviewDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        onClick={() => handleGetTip(job.role)}
                        className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                      >
                        <span>💡</span> Get Interview Tips
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips Modal */}
        {showTipsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className={`rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    Interview Insights for <span className="text-blue-500">{selectedRole}</span>
                  </h2>
                  <button
                    onClick={() => setShowTipsModal(false)}
                    className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  >
                    ✕
                  </button>
                </div>

                {tipLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {tipError ? (
                      <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-red-900 text-red-100" : "bg-red-100 text-red-900"}`}>
                        {tipError}
                      </div>
                    ) : (
                      <>
                        {tipData.advice && (
                          <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                              <span className="mr-2">📌</span> Career Advice
                            </h3>
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                              <p className="whitespace-pre-line">{tipData.advice}</p>
                            </div>
                          </div>
                        )}

                        {tipData.tips.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                              <span className="mr-2">💡</span> Interview Tips
                            </h3>
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-amber-50"}`}>
                              <ul className="space-y-3">
                                {tipData.tips.map((tip, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span className="whitespace-pre-line">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {tipData.questions.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                              <span className="mr-2">❓</span> Mock Interview Questions
                            </h3>
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                              <ol className="space-y-3">
                                {tipData.questions.map((q, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">{idx + 1}.</span>
                                    <span className="whitespace-pre-line">{q}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobManagement;