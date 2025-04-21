import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import logo from 'D:\\AI_JOB_APP\\frontend\\aijobapp\\src\\components\\images\\logo.png';
import pragateeshImage from 'D:\\AI_JOB_APP\\frontend\\aijobapp\\src\\components\\images\\pragateesh.jpg';

const GetStartedPage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const history = useHistory();
  const menuRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const formRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    setShowMenu(false);
    setShowMobileMenu(false);
    history.push(path);
  };

  const scrollToFeatures = () => {
    featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    setShowMobileMenu(false);
  };

  const scrollToAbout = () => {
    aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    setShowMobileMenu(false);
  };

  const scrollToContact = () => {
    contactRef.current.scrollIntoView({ behavior: 'smooth' });
    setShowMobileMenu(false);
  };

  // Handle form submission with EmailJS
  const handleFormSubmit = (event) => {
    event.preventDefault();

    emailjs
      .sendForm('service_notify', 'template_3ap51jt', formRef.current, {
        publicKey: 'Ev1z07uMmVUbDYQj2',
      })
      .then(
        () => {
          console.log('SUCCESS!');
          alert('Message sent successfully!');
          formRef.current.reset();
        },
        (error) => {
          console.log('FAILED...', error.text);
          alert('Failed to send message. Please try again.');
        }
      );
  };

  return (
    <div className="flex flex-col bg-gray-800 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-20 rounded-b-xl">
        <div className="max-w-full mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-amber-600 tracking-tight">JobTrack AI</h1>
          <nav className="hidden md:flex gap-8">
            <button
              onClick={scrollToFeatures}
              className="text-gray-600 no-underline font-medium text-lg transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={scrollToAbout}
              className="text-gray-600 no-underline font-medium text-lg transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              About
            </button>
            <button
              onClick={scrollToContact}
              className="text-gray-600 no-underline font-medium text-lg transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              Contact
            </button>
          </nav>
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-600 bg-transparent border-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white shadow-md px-8 py-4 animate-fadeInUp">
            <button
              onClick={scrollToFeatures}
              className="block text-gray-600 no-underline font-medium text-lg py-2 transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={scrollToAbout}
              className="block text-gray-600 no-underline font-medium text-lg py-2 transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              About
            </button>
            <button
              onClick={scrollToContact}
              className="block text-gray-600 no-underline font-medium text-lg py-2 transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={() => handleNavigation('/login')}
              className="block text-gray-600 no-underline font-medium text-lg py-2 transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => handleNavigation('/signup')}
              className="block text-gray-600 no-underline font-medium text-lg py-2 transition-colors duration-300 hover:text-amber-600 bg-transparent border-none cursor-pointer"
            >
              Signup
            </button>
          </div>
        )}
      </header>

      {/* First Container: Content and Image Side by Side */}
      <div className="px-8 py-8 bg-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          {/* Content Section */}
          <div className="flex-1 text-left animate-fadeIn">
            <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Revolutionize Your Job Search
            </h2>
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              Streamline your applications, perfect your resume, and conquer interviews with cutting-edge AI insights.
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li className="flex items-center">
                <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-lg">AI-Optimized Resume Analyser</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-lg">Personalized Interview Prep</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-lg">Smart Application Dashboard</span>
              </li>
            </ul>
            <div className="mt-6 flex justify-start relative" ref={menuRef}>
              <button
                className="inline-block bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold text-lg border-none cursor-pointer transition-all duration-300 hover:bg-amber-700 hover:scale-105"
                onClick={() => setShowMenu(!showMenu)}
              >
                Get Started
              </button>
              {showMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-md rounded-lg z-10 min-w-[160px] animate-fadeInUp overflow-hidden">
                  <div
                    className="px-5 py-3 text-gray-600 text-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-amber-600 hover:pl-6"
                    onClick={() => handleNavigation('/login')}
                  >
                    Login
                  </div>
                  <div
                    className="px-5 py-3 text-gray-600 text-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-amber-600 hover:pl-6"
                    onClick={() => handleNavigation('/signup')}
                  >
                    Signup
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Image Section */}
          <div className="flex-1 max-w-md">
            <img
              src={logo}
              alt="JobTrack AI Logo"
              className="w-full h-auto rounded-xl shadow-xl object-contain"
            />
          </div>
        </div>
      </div>

      {/* Second Container: Features Section with Animations */}
      <section ref={featuresRef} className="bg-white py-8 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center animate-fadeIn">
            Our Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInLeft">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Secure User Authentication</h3>
              <p className="text-gray-600">
                Robust login and signup system with encrypted password storage and session management to keep your data safe and secure.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInLeft animation-delay-200">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Interview Reminders & Alerts</h3>
              <p className="text-gray-600">
                Automatic notifications and reminders sent one day before your scheduled interviews to ensure you never miss an opportunity.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInRight animation-delay-400">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Mobile-First Design</h3>
              <p className="text-gray-600">
                Fully responsive interface that works seamlessly across all devices, from desktops to smartphones, with optimized mobile experience.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInRight animation-delay-600">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Job Application Tracker</h3>
              <p className="text-gray-600">
                Easily add and manage job applications by entering company name, role, skills, and interview dates. Update statuses like Offered, Rejected, Interviewing, or Ongoing.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInLeft animation-delay-800">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">AI-Powered Interview Tips</h3>
              <p className="text-gray-600">
                Receive personalized interview advice, career tips, and practice questions tailored to the roles and skills of your applied jobs, powered by Gemini AI.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInRight animation-delay-1000">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Resume Analyzer</h3>
              <p className="text-gray-600">
                Store, modify, and analyze your resume with Gemini AI. Get insights on suggested job roles, strengths, areas for improvement, recommended keywords, and optimization tips.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInLeft animation-delay-1200">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Cover Letter Generator</h3>
              <p className="text-gray-600">
                Create professional cover letters tailored to your job applications with AI assistance, enhancing your chances of standing out to employers.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInRight animation-delay-1400">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Skill Set Management</h3>
              <p className="text-gray-600">
                Add and edit your skills and interested job roles. Receive AI-driven skill enhancement advice, personalized career development tips.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-slideInLeft animation-delay-1600">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Data Security</h3>
              <p className="text-gray-600">
                All your personal and job application data is securely stored with industry-standard encryption and protection measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Third Container: About Section */}
      <section ref={aboutRef} className="bg-gray-800 py-8 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-6 text-center animate-fadeIn">
            About Me
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Content Section */}
            <div className="flex-1 text-left animate-fadeIn">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Meet the Creator</h3>
              <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                JobTrack AI was single-handedly developed by Pragateesh, a passionate and skilled Frontend Developer. With a deep understanding of modern web technologies and a commitment to enhancing the job search experience, Pragateesh crafted this platform to empower job seekers with AI-driven tools.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                From designing an intuitive user interface to integrating advanced AI capabilities, Pragateesh's vision and dedication have made JobTrack AI a powerful ally for anyone navigating the job market.
              </p>
            </div>
            {/* Image Section */}
            <div className="flex-1 max-w-sm">
              <img
                src={pragateeshImage}
                alt="Pragateesh, Frontend Developer"
                className="w-full h-auto rounded-xl shadow-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fourth Container: Contact Section */}
      <section ref={contactRef} className="bg-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-amber-600 mb-8 text-center animate-fadeIn">
            Contact Us
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Contact Information */}
            <div className="flex-1 text-left animate-fadeIn">
              <p className="text-lg text-gray-900 mb-6 leading-relaxed">
                We're here to help you succeed in your job search! Whether you have questions, feedback, or need assistance with JobTrack AI, reach out to us through any of the following channels or use the form to send us a message.
              </p>
              <ul className="list-none p-0 m-0 flex flex-col gap-4">
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-900 text-lg">
                    Email: <a href="mailto:haripragateesh7@gamail.com" className="text-amber-600 hover:underline">haripragateesh7@gamail.com</a> or <a href="mailto:pragateesh.g2022ai-ds@sece.ac.in" className="text-amber-600 hover:underline">pragateesh.g2022ai-ds@sece.ac.in</a>
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03 blinked-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z" />
                  </svg>
                  <span className="text-gray-900 text-lg">
                    GitHub: <a href="https://github.com/Pragatees" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">github.com/Pragatees</a>
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span className="text-gray-900 text-lg">
                    LinkedIn: <a href="https://www.linkedin.com/in/pragateesh-g-42b703259/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">linkedin.com/in/pragateesh-g-42b703259/</a>
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-gray-900 text-lg">
                    Mobile: <a href="tel:+917010441464" className="text-amber-600 hover:underline">+91 7010441464</a>
                  </span>
                </li>
              </ul>
            </div>
            {/* Contact Form */}
            <div className="flex-1 animate-fadeIn">
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">Send Us a Message</h3>
              <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-600 focus:border-amber-600"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="user_email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="user_email"
                    name="user_email"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-600 focus:border-amber-600"
                    placeholder="Your Email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-600 focus:border-amber-600"
                    placeholder="Your Message"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold text-lg border-none cursor-pointer transition-all duration-300 hover:bg-amber-700"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-8 py-6 rounded-t-xl">
        <div className="max-w-full mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            <h3 className="text-xl font-bold text-white m-0">JobTrack AI</h3>
            <div className="hidden md:flex gap-8">
              <button
                onClick={scrollToFeatures}
                className="text-base text-white m-0 bg-transparent border-none cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={scrollToAbout}
                className="text-base text-white m-0 bg-transparent border-none cursor-pointer"
              >
                About
              </button>
              <button
                onClick={scrollToContact}
                className="text-base text-white m-0 bg-transparent border-none cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-sm text-gray-300 m-0 max-w-2xl">
              JobTrack AI is the premier platform for job seekers leveraging artificial intelligence to streamline the application process.
              Our comprehensive tools analyze job markets, optimize resumes, prepare candidates for interviews, and provide skill enhancement advice to thrive in a competitive world.
            </p>
            <p className="text-sm text-gray-300 m-0">© 2025 JobTrack AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GetStartedPage;