import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import pdfToText from 'react-pdftotext';

// Styles for PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 15
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    borderBottom: '1 solid #000',
    paddingBottom: 5
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5
  },
  date: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 20
  }
});

// PDF Document Component for Cover Letter
const CoverLetterDocument = ({ coverLetter = "", companyName = "Unknown Company", role = "Unknown Role", username = "User" }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text>Cover Letter for {role} at {companyName}</Text>
      </View>
      <View style={styles.date}>
        <Text>{new Date().toLocaleDateString()}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.content}>Dear Hiring Manager,</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.content}>{coverLetter || "No cover letter content provided."}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.content}>Sincerely,</Text>
        <Text style={styles.content}>{username}</Text>
      </View>
    </Page>
  </Document>
);

const ResumeAnalyzer = () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const history = useHistory();
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 640);
  const [resumeText, setResumeText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLetterData, setCoverLetterData] = useState({
    companyName: "",
    role: ""
  });
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [resumeFileUrl, setResumeFileUrl] = useState("");
  const [jobStats, setJobStats] = useState({
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [analysisLoadingProgress, setAnalysisLoadingProgress] = useState(0);

  // Check authentication and fetch data on mount
  useEffect(() => {
    if (!username || !token) {
      history.push("/");
    } else {
      fetchStoredResume();
      fetchJobStats();
    }
  }, [username, token, history]);

  // Update sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Simulate analysis progress
  useEffect(() => {
    if (loadingAnalysis) {
      const timer = setInterval(() => {
        setAnalysisLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(timer);
    } else {
      setAnalysisLoadingProgress(0);
    }
  }, [loadingAnalysis]);

  // Fetch stored resume file
  const fetchStoredResume = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get-resume", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setResumeFileUrl(url);
      const file = new File([response.data], `${username}_resume.pdf`, { type: "application/pdf" });
      const text = await extractTextFromPdf(file);
      if (text) {
        handleAnalyzeResume(text);
      }
    } catch (err) {
      console.error("Error fetching stored resume:", err);
      if (err.response?.status === 404) {
        setPdfError("No resume found. Please upload your resume.");
      } else {
        setPdfError("Failed to fetch stored resume. Please try again.");
      }
    }
  };

  // Fetch job stats
  const fetchJobStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get("http://localhost:5000/getjobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      calculateJobStats(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setPdfError("Failed to fetch job stats. Please try again.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Calculate job stats
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

  const extractTextFromPdf = async (file) => {
    try {
      const text = await pdfToText(file);
      setResumeText(text);
      setPdfError("");
      return text;
    } catch (err) {
      console.error('Failed to extract text from PDF:', err);
      setPdfError('Failed to extract text from PDF. Please ensure the PDF is text-based.');
      return null;
    }
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      try {
        setUploadSuccess("Uploading resume...");
        const formData = new FormData();
        formData.append("resume", file);
        await axios.post("http://localhost:5000/upload-resume", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setUploadSuccess("Resume uploaded successfully!");
        setTimeout(() => setUploadSuccess(""), 3000);

        const url = window.URL.createObjectURL(file);
        setResumeFileUrl(url);

        const text = await extractTextFromPdf(file);
        if (text) {
          handleAnalyzeResume(text);
        } else {
          setPdfError("Failed to extract text for analysis");
        }
      } catch (err) {
        console.error("Error uploading resume:", err);
        setPdfError("Failed to upload resume to server");
      }
    } else {
      setPdfError("Please upload a valid PDF file.");
    }
  };

  const handleDeleteResume = async () => {
    try {
      await axios.delete("http://localhost:5000/delete-resume", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumeFileUrl("");
      setResumeText("");
      setAnalysisResult(null);
      setShowDeleteConfirm(false);
      setUploadSuccess("Resume deleted successfully!");
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting resume:", err);
      setPdfError("Failed to delete resume. Please try again.");
    }
  };

  const handleAnalyzeResume = async (resumeText) => {
    if (!resumeText.trim()) {
      setPdfError("No resume text to analyze");
      return;
    }

    setLoadingAnalysis(true);
    try {
      const response = await axios.post("http://localhost:2000/analyze-resume", {
        resume: resumeText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysisResult(response.data);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setPdfError("Failed to analyze resume. Please try again.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!resumeText.trim() || !coverLetterData.companyName.trim() || !coverLetterData.role.trim()) {
      alert("Please provide resume text, company name, and job role");
      return;
    }

    setLoadingCoverLetter(true);
    try {
      const response = await axios.post("http://localhost:2000/generate-cover-letter", {
        resume: resumeText,
        company: coverLetterData.companyName,
        role: coverLetterData.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoverLetter(response.data.coverLetter);
      setShowCoverLetterModal(false);
    } catch (err) {
      console.error("Error generating cover letter:", err);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setLoadingCoverLetter(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    history.push("/");
  };

  const handleGoToHome = () => {
    history.push("/job");
  };

  const getProfileInitial = () => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-[-100%]"
        } ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border-r p-4 sm:p-6 flex flex-col transition-transform duration-300`}
      >
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500 flex justify-center items-center text-white text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            {getProfileInitial()}
          </div>
          <div className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">{username}</div>
        </div>

        {/* Job Stats Section */}
        <div className="mb-6 sm:mb-8 flex-1">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Job Application Stats</h3>
          {loadingStats ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                <span className={`font-medium ${darkMode ? "text-green-300" : "text-green-700"}`}>Applied</span>
                <span className={`px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${darkMode ? "bg-gray-600 text-green-300" : "bg-green-100 text-green-800"}`}>
                  {jobStats.applied}
                </span>
              </div>
              <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-amber-50"}`}>
                <span className={`font-medium ${darkMode ? "text-amber-300" : "text-amber-700"}`}>Interviewing</span>
                <span className={`px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${darkMode ? "bg-gray-600 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
                  {jobStats.interviewing}
                </span>
              </div>
              <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-purple-50"}`}>
                <span className={`font-medium ${darkMode ? "text-purple-300" : "text-purple-700"}`}>Offered</span>
                <span className={`px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${darkMode ? "bg-gray-600 text-purple-300" : "bg-purple-100 text-purple-800"}`}>
                  {jobStats.offered}
                </span>
              </div>
              <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-red-50"}`}>
                <span className={`font-medium ${darkMode ? "text-red-300" : "text-red-700"}`}>Rejected</span>
                <span className={`px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${darkMode ? "bg-gray-600 text-red-300" : "bg-red-100 text-red-800"}`}>
                  {jobStats.rejected}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Home Button */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={handleGoToHome}
            className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border p-3 sm:p-4 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium cursor-pointer transition-all duration-200 w-full`}
          >
            <span role="img" aria-label="home" className="text-base sm:text-lg">
              🏠
            </span>
            Go to Home
          </button>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border p-3 sm:p-4 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium cursor-pointer transition-all duration-200 mt-auto`}
        >
          <span role="img" aria-label="logout" className="text-base sm:text-lg">
            🚪
          </span>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-4 sm:p-8 overflow-auto flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-0 sm:ml-72" : "ml-0"}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleSidebar}
              className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"} rounded-full p-2 text-sm sm:text-base transition-all duration-300 flex items-center justify-center`}
            >
              {isSidebarOpen ? (
                <span className="text-xl">☰</span>
              ) : (
                <span className="text-xl">☰</span>
              )}
            </button>
            <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              📄 AI Resume Analyzer
            </h2>
          </div>
          <button
            className={`${darkMode ? "bg-gray-100 text-gray-800" : "bg-gray-800 text-gray-100"} rounded-full px-4 sm:px-5 py-2 sm:py-2.5 cursor-pointer flex items-center gap-2 text-xs sm:text-sm transition-all duration-300`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Stored Resume Display */}
        {resumeFileUrl && (
          <div className={`rounded-xl p-4 sm:p-6 ${darkMode ? "bg-gray-700" : "bg-white"} shadow-md mb-6 sm:mb-8`}>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Stored Resume</h3>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href={resumeFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 sm:px-4 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-xs sm:text-sm"
              >
                👀 View Resume
              </a>
              <a
                href={resumeFileUrl}
                download={`${username}_resume.pdf`}
                className="py-2 px-3 sm:px-4 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-xs sm:text-sm"
              >
                📄 Download Resume
              </a>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2 px-3 sm:px-4 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-all duration-200 text-xs sm:text-sm"
              >
                🗑️ Delete Resume
              </button>
              <p className="text-xs sm:text-sm">Resume stored for {username}</p>
            </div>
          </div>
        )}

        {/* Resume Upload Form */}
        <div className={`rounded-xl p-4 sm:p-6 ${darkMode ? "bg-gray-700" : "bg-white"} shadow-md mb-6 sm:mb-8`}>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{resumeFileUrl ? "Update Your Resume" : "Upload Your Resume"}</h3>
          <div className="mb-4 sm:mb-6">
            <label className="block mb-2 font-medium text-sm sm:text-base">Upload PDF Resume:</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className={`w-full p-2 sm:p-3 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-xs sm:text-sm`}
            />
            {pdfError && <p className={`mt-2 text-xs sm:text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>{pdfError}</p>}
            {uploadSuccess && <p className={`mt-2 text-xs sm:text-sm ${darkMode ? "text-green-300" : "text-green-600"}`}>{uploadSuccess}</p>}
          </div>
          <div className="mb-4 sm:mb-6">
            <label className="block mb-2 font-medium text-sm sm:text-base">Extracted Resume Text:</label>
            <textarea
              value={resumeText}
              readOnly
              placeholder="Resume text will be extracted automatically..."
              className={`w-full h-32 sm:h-40 p-3 sm:p-4 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-xs sm:text-sm`}
            />
          </div>
        </div>

        {/* Analysis Loading Indicator */}
        {loadingAnalysis && (
          <div className={`rounded-xl p-4 sm:p-6 ${darkMode ? "bg-gray-700" : "bg-white"} shadow-md mb-6 sm:mb-8`}>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Analyzing Your Resume</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 sm:mb-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${analysisLoadingProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-xs sm:text-sm">Processing your resume... {analysisLoadingProgress}%</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className={`rounded-xl p-4 sm:p-6 ${darkMode ? "bg-gray-700" : "bg-white"} shadow-md mb-6 sm:mb-8`}>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Resume Analysis Results</h3>
            <div className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 ${darkMode ? "bg-gray-600" : "bg-blue-50"}`}>
              <h4 className="font-bold text-base sm:text-lg mb-2">Overall Score: {analysisResult.score ?? 'N/A'}/100</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${analysisResult.score ?? 0}%` }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm">{analysisResult.summary ?? 'Comprehensive analysis of your resume content'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-blue-50"}`}>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2 text-base sm:text-lg">💼</span> Suggested Job Roles
                </h4>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {(analysisResult.suggestedRoles?.length > 0 ? analysisResult.suggestedRoles : ['No roles suggested']).map((role, index) => (
                    <li key={index}>{role}</li>
                  ))}
                </ul>
              </div>
              <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-green-50"}`}>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2 text-base sm:text-lg">✅</span> Strengths
                </h4>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {(analysisResult.strengths?.length > 0 ? analysisResult.strengths : ['No strengths identified']).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-amber-50"}`}>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2 text-base sm:text-lg">⚠️</span> Areas for Improvement
                </h4>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {(analysisResult.improvements?.length > 0 ? analysisResult.improvements : ['No improvements suggested']).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-purple-50"}`}>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2 text-base sm:text-lg">🔑</span> Recommended Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(analysisResult.keywords?.length > 0 ? analysisResult.keywords : ['No keywords recommended']).map((word, index) => (
                    <span key={index} className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${darkMode ? "bg-gray-500 text-gray-100" : "bg-purple-100 text-purple-800"}`}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-indigo-50"}`}>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center">
                  <span className="mr-2 text-base sm:text-lg">💡</span> Optimization Tips
                </h4>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {(analysisResult.tips?.length > 0 ? analysisResult.tips : ['No tips provided']).map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
              {analysisResult.missingSkills?.length > 0 && (
                <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-red-50"}`}>
                  <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center">
                    <span className="mr-2 text-base sm:text-lg">❌</span> Potential Missing Skills
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    {analysisResult.missingSkills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowCoverLetterModal(true)}
                className="w-full sm:w-auto py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200 flex items-center text-xs sm:text-sm"
              >
                ✉️ Generate Cover Letter
              </button>
              <button
                onClick={() => handleAnalyzeResume(resumeText)}
                className="w-full sm:w-auto py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center text-xs sm:text-sm"
              >
                🔄 Re-analyze Resume
              </button>
            </div>
          </div>
        )}

        {/* Cover Letter Display */}
        {coverLetter && (
          <div className={`rounded-xl p-4 sm:p-6 ${darkMode ? "bg-gray-700" : "bg-white"} shadow-md mb-6 sm:mb-8`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3">
              <h3 className="text-lg sm:text-xl font-bold">Generated Cover Letter</h3>
              <button
                onClick={() => setCoverLetter("")}
                className="py-1 px-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-all duration-200 text-xs sm:text-sm"
              >
                Clear
              </button>
            </div>
            <div className={`p-3 sm:p-4 mb-3 sm:mb-4 rounded-lg ${darkMode ? "bg-gray-600" : "bg-gray-50"}`}>
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{coverLetter}</pre>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <PDFDownloadLink
                document={
                  <CoverLetterDocument
                    coverLetter={coverLetter}
                    companyName={coverLetterData.companyName}
                    role={coverLetterData.role}
                    username={username}
                  />
                }
                fileName={`Cover_Letter_${coverLetterData.companyName.replace(/\s+/g, '_')}.pdf`}
              >
                {({ loading }) => (
                  <button
                    disabled={loading}
                    className="py-2 px-3 sm:px-4 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-xs sm:text-sm"
                  >
                    {loading ? 'Preparing PDF...' : '📄 Download PDF'}
                  </button>
                )}
              </PDFDownloadLink>
              <button
                onClick={() => navigator.clipboard.writeText(coverLetter)}
                className="py-2 px-3 sm:px-4 rounded-lg font-bold bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200 text-xs sm:text-sm"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"} p-4 sm:p-6 rounded-xl w-11/12 max-w-md shadow-2xl`}>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Confirm Delete</h3>
            <p className="mb-4 sm:mb-6 text-xs sm:text-sm">Are you sure you want to delete your resume? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2 px-4 sm:px-5 rounded-lg font-bold bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResume}
                className="py-2 px-4 sm:px-5 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-all duration-200 text-xs sm:text-sm"
              >
                Delete Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Generator Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"} p-4 sm:p-6 rounded-xl w-11/12 max-w-lg sm:max-w-2xl shadow-2xl`}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Generate Cover Letter</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block mb-2 font-medium text-sm sm:text-base">Company Name:</label>
                <input
                  type="text"
                  value={coverLetterData.companyName}
                  onChange={(e) => setCoverLetterData({ ...coverLetterData, companyName: e.target.value })}
                  className={`w-full p-2 sm:p-3 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-xs sm:text-sm`}
                  placeholder="e.g. Google, Microsoft"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm sm:text-base">Job Role:</label>
                <input
                  type="text"
                  value={coverLetterData.role}
                  onChange={(e) => setCoverLetterData({ ...coverLetterData, role: e.target.value })}
                  className={`w-full p-2 sm:p-3 rounded-lg border ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"} text-xs sm:text-sm`}
                  placeholder="e.g. Software Engineer, Product Manager"
                />
              </div>
              <div className="flex justify-end space-x-3 sm:space-x-4 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowCoverLetterModal(false)}
                  className="py-2 px-4 sm:px-5 rounded-lg font-bold bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={loadingCoverLetter}
                  className={`py-2 px-4 sm:px-5 rounded-lg font-bold text-white ${loadingCoverLetter ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} transition-all duration-200 flex items-center text-xs sm:text-sm`}
                >
                  {loadingCoverLetter ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Cover Letter"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;