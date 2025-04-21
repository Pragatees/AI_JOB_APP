import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const JobManagement = () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const history = useHistory();
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    skillsRequired: "",
    interviewDate: "",
    status: "Applied",
  });
  const [jobStats, setJobStats] = useState({
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  // New state for interview alert
  const [showInterviewAlert, setShowInterviewAlert] = useState(false);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  // Status color map for job cards
  const statusColors = {
    Applied: "bg-green-400",
    Interviewing: "bg-amber-500",
    Offered: "bg-purple-500",
    Rejected: "bg-red-500",
  };

  // Status options for dropdowns
  const statusOptions = ["Applied", "Interviewing", "Offered", "Rejected"];

  useEffect(() => {
    if (!username || !token) {
      history.push("/");
    } else {
      fetchJobs();
    }
  }, [username, token, history]);

  const fetchJobs = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get("http://localhost:5000/getjobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
      calculateJobStats(res.data);
      checkUpcomingInterviews(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      alert("Failed to fetch jobs. Please try again.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Calculate job status counts and prepare chart data
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

    // Prepare chart data
    setChartData({
      labels: ["Applied", "Interviewing", "Offered", "Rejected"],
      datasets: [
        {
          label: "Job Applications",
          data: [stats.applied, stats.interviewing, stats.offered, stats.rejected],
          backgroundColor: [
            "rgba(74, 222, 128, 0.7)",
            "rgba(245, 158, 11, 0.7)",
            "rgba(168, 85, 247, 0.7)",
            "rgba(239, 68, 68, 0.7)",
          ],
          borderColor: [
            "rgba(74, 222, 128, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(168, 85, 247, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  // Check for interviews within the next 24 hours
  const checkUpcomingInterviews = (jobs) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const upcoming = jobs.filter((job) => {
      const interviewDate = new Date(job.interviewDate);
      return (
        job.status === "Interviewing" &&
        interviewDate >= now &&
        interviewDate <= tomorrow
      );
    });

    setUpcomingInterviews(upcoming);
    if (upcoming.length > 0) {
      setShowInterviewAlert(true);
    }
  };

  // Chart options (unchanged)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: { size: 14 },
          color: darkMode ? "#f3f4f6" : "#111827",
          padding: 15,
        },
      },
      title: {
        display: true,
        text: "Job Application Status Distribution",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 },
        color: darkMode ? "#f3f4f6" : "#111827",
      },
      tooltip: {
        backgroundColor: darkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: darkMode ? "#f3f4f6" : "#111827",
        bodyColor: darkMode ? "#f3f4f6" : "#111827",
        borderColor: darkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.3)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw} applications`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: darkMode ? "#9ca3af" : "#6b7280",
          font: { size: 12 },
          padding: 10,
        },
        grid: {
          color: darkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.3)",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Number of Applications",
          color: darkMode ? "#d1d5db" : "#4b5563",
          font: { size: 14, weight: "bold" },
        },
      },
      x: {
        ticks: {
          color: darkMode ? "#9ca3af" : "#6b7280",
          font: { size: 12 },
          padding: 10,
        },
        grid: { display: false },
        title: {
          display: true,
          text: "Application Status",
          color: darkMode ? "#d1d5db" : "#4b5563",
          font: { size: 14, weight: "bold" },
          padding: { top: 10 },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const parsedDate = new Date(formData.interviewDate);
      if (isNaN(parsedDate.getTime())) {
        alert("Please provide a valid interview date.");
        return;
      }

      await axios.post(
        "http://localhost:5000/addjob",
        { ...formData, username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({
        companyName: "",
        role: "",
        skillsRequired: "",
        interviewDate: "",
        status: "Applied",
      });
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      console.error("Error adding job:", err);
      const errorMessage = err.response?.data?.message || "Failed to add job. Please try again.";
      alert(errorMessage);
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/updatejob/${jobId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchJobs();
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMessage = err.response?.data?.message || "Failed to update status. Please try again.";
      alert(errorMessage);
    }
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
      "#f87685",
      "#f4a261",
      "#e9c46a",
      "#2a9d8f",
      "#e76f51",
      "#7209b7",
      "#4cc9f0",
      "#4d908e",
    ];

    const hash = companyName.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const getProfileInitial = () => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  const arrangedJobs = [...jobs];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`w-screen h-screen flex ${darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"} overflow-hidden`}>
      {/* Sidebar */}
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
      <div className={`flex-1 p-8 overflow-auto flex flex-col transition-all duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            👋 Welcome, {username}
          </h2>
          <button
            className={`${darkMode ? "bg-gray-100 text-gray-800" : "bg-gray-800 text-gray-100"} rounded-full px-5 py-2.5 cursor-pointer flex items-center gap-2 text-sm transition-all duration-300`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Job Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {arrangedJobs.map((job) => {
            const jobColor = getJobCardColor(job.companyName);
            const statusEmoji = getStatusEmoji(job.status);

            return (
              <div
                key={job._id}
                className={`rounded-xl p-6 ${darkMode ? "bg-gray-700" : "bg-white"} relative h-80 flex flex-col ${darkMode ? "shadow-lg shadow-gray-900/30" : "shadow-md"} transition-all duration-300 overflow-hidden`}
                style={{ borderTop: `5px solid ${jobColor}` }}
              >
                <div className={`inline-block px-3 py-1.5 rounded-xl text-sm font-bold text-white mb-3 ${statusColors[job.status] || "bg-gray-400"}`}>
                  {statusEmoji} {job.status}
                </div>
                <h3 className="m-0 mb-2 text-xl font-semibold">{job.companyName}</h3>
                <p className="text-base m-0 mb-3">Role: {job.role}</p>
                <p className="text-base m-0 mb-3 flex-1">Skills: {job.skillsRequired || "Not specified"}</p>
                <div className="text-sm mb-4">
                  🕒 Interview: {new Date(job.interviewDate).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <label className="block mb-2 font-bold">Update Status:</label>
                  <select
                    value={job.status}
                    onChange={(e) => handleUpdateStatus(job._id, e.target.value)}
                    className={`p-2.5 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-sm cursor-pointer w-full`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}

          {/* Add Job Box */}
          <div
            onClick={() => {
              setShowModal(true);
              setFormData({
                companyName: "",
                role: "",
                skillsRequired: "",
                interviewDate: "",
                status: "Applied",
              });
            }}
            className={`border-2 border-dashed ${darkMode ? "border-gray-500 bg-gray-700" : "border-gray-400 bg-white"} p-8 text-center cursor-pointer text-5xl rounded-xl h-80 flex flex-col justify-center items-center transition-all duration-300 ${darkMode ? "shadow-lg shadow-gray-900/30" : "shadow-md"}`}
          >
            <div>+</div>
          </div>
        </div>

        {/* Enhanced Bar Chart Section with more height */}
        <div className={`mt-auto p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-white"} ${darkMode ? "shadow-lg shadow-gray-900/30" : "shadow-md"} flex-1 flex flex-col`}>
          <h3 className="text-xl font-bold mb-6">Job Status Distribution</h3>
          <div className="flex-1 min-h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Interview Alert Modal */}
        {showInterviewAlert && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"} p-8 rounded-xl w-11/12 max-w-lg shadow-2xl`}>
              <h3 className="mt-0 text-xl font-bold">🔔 Upcoming Interview Alert</h3>
              <p className="mb-4">You have the following interviews scheduled within the next 24 hours:</p>
              <ul className="list-disc pl-5 mb-6">
                {upcomingInterviews.map((job) => (
                  <li key={job._id}>
                    <strong>{job.companyName}</strong> - {job.role} on{" "}
                    {new Date(job.interviewDate).toLocaleString()}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowInterviewAlert(false)}
                  className="py-3 px-5 rounded-lg border-none cursor-pointer font-bold transition-all duration-200 bg-emerald-500 text-white text-base"
                >
                  ✅ Acknowledge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Job Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"} p-8 rounded-xl w-11/12 max-w-lg shadow-2xl`}>
              <h3 className="mt-0 text-xl font-bold">➕ Create New Job Application</h3>
              <form onSubmit={handleAddJob}>
                <input
                  type="text"
                  name="companyName"
                  placeholder="🏢 Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className={`block w-full mb-4 p-3.5 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-base`}
                />
                <input
                  type="text"
                  name="role"
                  placeholder="💼 Role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className={`block w-full mb-4 p-3.5 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-base`}
                />
                <input
                  type="text"
                  name="skillsRequired"
                  placeholder="🛠️ Skills Required"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                  className={`block w-full mb-4 p-3.5 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-base`}
                />
                <div className="mb-6">
                  <label className="block mb-2 text-base">🕒 Interview Date</label>
                  <input
                    type="datetime-local"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleChange}
                    required
                    className={`block w-full p-3.5 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-base`}
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 text-base">📌 Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`block w-full p-3.5 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-base cursor-pointer`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-3 px-5 rounded-lg border-none cursor-pointer font-bold transition-all duration-200 bg-emerald-500 text-white text-base"
                  >
                    ✅ Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-3 px-5 rounded-lg border-none cursor-pointer font-bold transition-all duration-200 bg-red-500 text-white ml-4 text-base"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobManagement;