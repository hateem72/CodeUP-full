import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tilt } from "react-tilt";
import { TypeAnimation } from "react-type-animation";
import Particles from "react-particles";
import Logo from "../assets/Clogo.png";
import { loadFull } from "tsparticles"; // Use loadFull for full functionality

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faPlay,
  faCode,
  faTerminal,
  faUsersCog,
  faFileCode,
  faLaptopCode,
  faSyncAlt,
  faArrowRight,
  faCheckCircle,
  faBrain,
  faChalkboardTeacher,
  faRobot,
  faShieldAlt,
  faChartLine,
  faMagic,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseEnter = () => setHidden(false);
    const handleMouseLeave = () => setHidden(true);
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    const handleLinkHover = () => setLinkHovered(true);
    const handleLinkLeave = () => setLinkHovered(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    const links = document.querySelectorAll("a, button");
    links.forEach(link => {
      link.addEventListener("mouseenter", handleLinkHover);
      link.addEventListener("mouseleave", handleLinkLeave);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);

      links.forEach(link => {
        link.removeEventListener("mouseenter", handleLinkHover);
        link.removeEventListener("mouseleave", handleLinkLeave);
      });
    };
  }, []);

  return (
    <motion.div
      className={`fixed w-8 h-8 rounded-full pointer-events-none z-50 mix-blend-difference ${
        linkHovered ? "bg-yellow w-12 h-12" : "bg-teal"
      }`}
      animate={{
        x: position.x - (linkHovered ? 24 : 16),
        y: position.y - (linkHovered ? 24 : 16),
        scale: clicked ? 0.8 : linkHovered ? 1.5 : 1,
        opacity: hidden ? 0 : 1
      }}
      transition={{ type: "spring", mass: 0.1 }}
    />
  );
};

const FloatingParticles = ({ count = 30 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-teal/20"
          initial={{
            x: Math.random() * 100,
            y: Math.random() * 100,
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            y: [null, (Math.random() - 0.5) * 100],
            x: [null, (Math.random() - 0.5) * 100],
            opacity: [null, Math.random() * 0.5 + 0.1]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Glow effect component
const GlowEffect = () => {
  return (
    <>
      <motion.div
        className="absolute w-[1200px] h-[1200px] bg-teal opacity-15 rounded-full blur-3xl -top-72 -left-72"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.2, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[1000px] h-[1000px] bg-yellow opacity-15 rounded-full blur-3xl -bottom-48 -right-48"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.2, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
};

// Interactive background grid
const BackgroundGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="grid grid-cols-12 grid-rows-12 h-full w-full opacity-5">
        {[...Array(144)].map((_, i) => (
          <motion.div
            key={i}
            className="border border-teal/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            transition={{ delay: i * 0.005 }}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [cursorText, setCursorText] = useState("");

  // Particle Background Config
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  const particlesOptions = {
    fullScreen: false,
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    particles: {
      color: {
        value: ["#3DFFA2", "#FFD700"],
      },
      links: {
        color: "#3DFFA2",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        random: true,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  // Feature carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Interactive text effects
  const scrambleText = (text) => {
    return text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        whileHover={{ scale: 1.2, color: "#3DFFA2" }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <div className="bg-background text-octonary min-h-screen font-sans overflow-x-hidden relative font-fira-code">
      <CustomCursor />

      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <BackgroundGrid />
      <FloatingParticles count={50} />

      {/* Floating Try Now Widget */}
      <motion.div
        className="fixed bottom-10 right-10 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        onHoverStart={() => setCursorText("Try Now!")}
        onHoverEnd={() => setCursorText("")}
      >
        <button
          onClick={() => navigate("/register")}
          className="bg-gradient-to-r from-teal to-hover-teal text-background px-10 py-5 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3 transform hover:scale-110 font-orbitron text-xl relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          <FontAwesomeIcon icon={faPlay} className="animate-pulse" />
          <span>Try Now</span>
          <span className="absolute inset-0 border-2 border-teal rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow pointer-events-none"></span>
        </button>
      </motion.div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-background via-tertiary to-quaternary overflow-hidden z-10">
        <GlowEffect />

        <motion.h1
          className="text-6xl md:text-9xl font-bold mb-12 font-orbitron"
          initial={{ y: -150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
        >
          <motion.img
    src= {Logo} // Make sure the image is in your public folder
    alt="CodeUp Logo"
    className="h-32 md:h-64 w-auto" 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    whileHover={{ 
      scale: 1.1,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 } 
    }}
  />
        
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <TypeAnimation
            sequence={[
              "> Turbocharge your coding skills",
              2000,
              "> Collaborate like a pro",
              2000,
              "> Auto-generate assignments in seconds",
              2000,
              "> AI-powered code reviews",
              2000,
              "> Real-time team coding",
              2000,
            ]}
            wrapper="p"
            speed={30}
            repeat={Infinity}
            className="text-xl md:text-4xl text-senary max-w-3xl mb-14 font-fira-code tracking-wide"
          />
        </motion.div>

        <motion.div
          className="flex gap-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tilt options={{ max: 20, scale: 1.1 }}>
            <button
              onClick={() => navigate("/login")}
              className="bg-teal text-background px-16 py-6 rounded-lg hover:bg-hover-teal transition-all duration-300 text-2xl font-semibold shadow-lg hover:shadow-2xl flex items-center space-x-4 font-orbitron relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <FontAwesomeIcon icon={faRocket} className="animate-pulse" />
              <span>Login</span>
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-500"></span>
            </button>
          </Tilt>

          <Tilt options={{ max: 20, scale: 1.1 }}>
            <button
              onClick={() => navigate("/register")}
              className="bg-yellow text-background px-16 py-6 rounded-lg hover:bg-hover-yellow transition-all duration-300 text-2xl font-semibold shadow-lg hover:shadow-2xl flex items-center space-x-4 font-orbitron relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <FontAwesomeIcon icon={faRocket} className="animate-pulse" />
              <span>Register</span>
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-500"></span>
            </button>
          </Tilt>
        </motion.div>

        {/* Animated scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm text-senary mb-2">Scroll Down</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Code Ecosystem Section */}
      <section className="py-48 px-6 bg-background animate-section relative z-10 overflow-hidden">
        <motion.h2
          className="text-center mb-28"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-5xl md:text-8xl font-bold font-orbitron">
            <span className="text-teal">Code</span>
            <span className="text-yellow">Up</span> Ecosystem
          </span>
        </motion.h2>

        <div className="absolute w-96 h-96 bg-teal opacity-10 rounded-full blur-3xl top-0 left-0 animate-pulse-slow"></div>

        {/* Animated feature carousel */}
        <div className="relative h-96 mb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="max-w-2xl mx-auto text-center">
                <FontAwesomeIcon
                  icon={[faBrain, faTerminal, faUsersCog, faFileCode][activeFeature]}
                  className="text-6xl mb-6 text-teal animate-bounce"
                />
                <h3 className="text-3xl font-bold text-teal mb-4 font-orbitron">
                  {["AI-Powered Coding", "Hinglish Mentor", "Collaboration Core", "Auto Assignment Generator"][activeFeature]}
                </h3>
                <p className="text-xl text-senary font-fira-code">
                  {[
                    "Real-time error detection and smart suggestions.",
                    "Learn coding with a bilingual AI guide.",
                    "Sync and code with peers instantly.",
                    "Transform your code into polished assignments in one click."
                  ][activeFeature]}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Feature indicators */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  activeFeature === i ? "bg-teal w-6" : "bg-senary"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 max-w-7xl mx-auto">
          <FeatureCard
            icon={faBrain}
            title="AI-Powered Coding"
            desc="Real-time error detection and smart suggestions."
            delay={0}
          />
          <FeatureCard
            icon={faTerminal}
            title="Hinglish Mentor"
            desc="Learn coding with a bilingual AI guide."
            delay={0.2}
          />
          <FeatureCard
            icon={faUsersCog}
            title="Collaboration Core"
            desc="Sync and code with peers instantly."
            delay={0.4}
          />
          <FeatureCard
            icon={faFileCode}
            title="Auto Assignment Generator"
            desc="Transform your code into polished assignments in one click."
            delay={0.6}
            highlight
          />
        </div>
      </section>

      {/* Live Coding Arena Section */}
      <section className="py-48 px-6 bg-gradient-to-br from-tertiary to-quaternary animate-section relative z-10 overflow-hidden">
        <motion.h2
          className="text-center mb-28"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-5xl md:text-8xl font-bold font-orbitron">
            <span className="text-teal">Code</span>
            <span className="text-yellow">Up</span> Live Arena
          </span>
        </motion.h2>

        <div className="absolute w-80 h-80 bg-yellow opacity-15 rounded-full blur-3xl bottom-0 right-0 animate-pulse-slow"></div>

        <motion.div
          className="max-w-4xl mx-auto bg-black p-10 rounded-xl shadow-2xl border border-teal/50 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Animated code background */}
          <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
            <div className="code-background"></div>
          </div>

          <div className="flex items-center space-x-6 mb-8 relative z-10">
            <FontAwesomeIcon icon={faLaptopCode} className="text-5xl text-teal animate-spin-slow" />
            <h3 className="text-4xl font-bold text-senary font-orbitron">Real-Time Coding Hub</h3>
          </div>

          <p className="text-xl text-senary font-fira-code mb-8 relative z-10">
            Dive into a live coding environment where you sync with your team, track changes, and build projects together effortlessly.
          </p>

          <motion.div
            className="flex justify-center relative z-10"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => navigate("/register")}
              className="bg-teal text-background px-10 py-4 rounded-lg hover:bg-hover-teal transition-all duration-300 text-xl font-semibold shadow-md flex items-center space-x-3 font-orbitron group"
            >
              <FontAwesomeIcon icon={faSyncAlt} className="animate-spin group-hover:animate-none" />
              <span>Join the Arena</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Teacher's Command Center Section */}
      <section className="py-48 px-6 bg-background animate-section relative z-10 overflow-hidden">
        <motion.h2
          className="text-center mb-28"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-5xl md:text-8xl font-bold font-orbitron">
            <span className="text-teal">Code</span>
            <span className="text-yellow">Up</span> Teacher's Command
          </span>
        </motion.h2>

        <div className="absolute w-96 h-96 bg-teal opacity-10 rounded-full blur-3xl top-0 left-0 animate-pulse-slow"></div>

        <motion.div
          className="max-w-5xl mx-auto bg-quaternary p-10 rounded-xl shadow-2xl border border-yellow/50 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Animated chalkboard background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none chalkboard-bg"></div>

          <div className="flex items-center space-x-6 mb-8 relative z-10">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="text-5xl text-yellow animate-pulse" />
            <h3 className="text-4xl font-bold text-octonary font-orbitron">Empower Your Classroom</h3>
          </div>

          <p className="text-xl text-senary font-fira-code mb-8 relative z-10">
            Generate custom tests, invite students, and let AI evaluate submissions with detailed feedback in seconds — focus on teaching, not grading!
          </p>

          <motion.div
            className="flex justify-center relative z-10"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => navigate("/register")}
              className="bg-yellow text-background px-10 py-4 rounded-lg hover:bg-hover-yellow transition-all duration-300 text-xl font-semibold shadow-md flex items-center space-x-3 font-orbitron group"
            >
              <FontAwesomeIcon icon={faRobot} className="animate-bounce group-hover:animate-none" />
              <span>Start Teaching</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Mastery Blueprint Section */}
      <section className="py-48 px-6 bg-gradient-to-br from-tertiary to-quaternary animate-section relative z-10 overflow-hidden">
        <motion.h2
          className="text-center mb-28"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-5xl md:text-8xl font-bold font-orbitron">
            <span className="text-teal">Code</span>
            <span className="text-yellow">Up</span> Mastery Blueprint
          </span>
        </motion.h2>

        <div className="absolute w-80 h-80 bg-yellow opacity-15 rounded-full blur-3xl bottom-0 right-0 animate-pulse-slow"></div>

        <div className="max-w-6xl mx-auto space-y-24 relative">
          {/* Animated connecting lines */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 300">
            <motion.path
              d="M50 20 Q 50 80, 50 120 Q 50 180, 50 240"
              stroke="rgba(61, 255, 162, 0.2)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2 }}
              viewport={{ once: true }}
            />
          </svg>

          <MasteryStep
            icon={faCode}
            title="Code Precision"
            desc="Hone your skills with AI-driven insights and instant feedback."
            delay={0}
          />
          <MasteryStep
            icon={faUsersCog}
            title="Team Synergy"
            desc="Master collaboration with live coding and peer syncing."
            delay={0.2}
          />
          <MasteryStep
            icon={faFileCode}
            title="Assignment Automation"
            desc="Auto-generate professional assignments effortlessly — impress with every submission."
            delay={0.4}
            highlight
          />
        </div>
      </section>
{/* Subscription Plans Section */}
<section className="py-48 px-6 bg-background animate-section relative z-10 overflow-hidden">
  <motion.h2
    className="text-center mb-28"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    <span className="text-5xl md:text-8xl font-bold font-orbitron">
      <span className="text-teal">Code</span>
      <span className="text-yellow">Up</span> Plans
    </span>
  </motion.h2>

  <div className="absolute w-96 h-96 bg-teal opacity-10 rounded-full blur-3xl top-0 left-0 animate-pulse-slow"></div>

  {/* Plan Features Data */}
  {(() => {
    const plansData = {
      free: {
        name: "Starter",
        price: "Free Forever",
        description: "Great for students starting their coding journey",
        features: [
          "Basic code editor access",
          "AI code explanation (limited to 10/day)", 
          "Hinglish speech explanations (basic speed)", // Web Speech API with default rate
          "1 workspace creation", // From StudentDashboard (workspacesCreated)
          "Join up to 2 invited workspaces", // From invitedWorkspaces
          "Submit tests with standard feedback", // From submissions in StudentDashboard
          "Basic performance chart", // Bar chart in StudentDashboard
        ],
        cta: "Get Started",
        highlight: false,
      },
      pro: {
        name: "Pro Coder",
        price: "₹300/year",
        description: "For coders ready to master skills and collaborate",
        features: [
          "Unlimited AI code explanations", // Enhanced AIExplain usage
          "Hinglish speech with adjustable speed", // Web Speech API with rate customization
          "Unlimited workspace creation", // Expanded from StudentDashboard
          "Join unlimited invited workspaces", // Full collaboration
          "Advanced test submissions with detailed insights", // Enhanced SubmitTest
          "Interactive performance dashboard", // Bar chart + potential extras
          "Roadmap access for personalized learning", // From StudentDashboard roadmap block
          "Priority workspace support", // Hypothetical premium support
          "Customizable UI themes", // Potential future feature
          "Export test results to PDF", // Hypothetical premium feature
        ],
        cta: "Go Pro",
        highlight: true,
      },
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
        {Object.entries(plansData).map(([key, plan]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: key === 'pro' ? 0.2 : 0 }}
            viewport={{ once: true }}
          >
            <Tilt options={{ max: 15, scale: 1.03, perspective: 1000 }}>
              <div className={`h-full p-10 rounded-xl shadow-2xl border transition-all duration-300 transform hover:shadow-3xl relative overflow-hidden ${
                plan.highlight 
                  ? 'bg-gradient-to-br from-teal/20 to-yellow/20 border-yellow/50' 
                  : 'bg-quaternary border-teal/50'
              }`}>
                {/* Highlight badge */}
                {plan.highlight && (
                  <div className="absolute top-0 right-0 bg-yellow text-background px-6 py-2 rounded-bl-xl rounded-tr-xl font-bold font-orbitron transform rotate-3 translate-x-2 -translate-y-2 shadow-md">
                    POPULAR
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-4xl font-bold mb-2 font-orbitron ${
                    plan.highlight ? 'text-yellow' : 'text-teal'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-semibold text-senary mb-4">{plan.price}</p>
                  <p className="text-senary font-fira-code">{plan.description}</p>
                </div>

                <div className="mb-10">
                  <h4 className="text-xl font-semibold text-teal mb-4 font-orbitron border-b border-teal/30 pb-2">
                    Features
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FontAwesomeIcon 
                          icon={faCheckCircle} 
                          className={`mt-1 mr-3 ${
                            plan.highlight ? 'text-yellow' : 'text-teal'
                          }`} 
                        />
                        <span className="text-senary font-fira-code">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => navigate("/register")}
                    className={`px-10 py-4 rounded-lg text-xl font-semibold shadow-md flex items-center justify-center space-x-3 font-orbitron group mx-auto ${
                      plan.highlight
                        ? 'bg-yellow text-background hover:bg-hover-yellow'
                        : 'bg-teal text-background hover:bg-hover-teal'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <FontAwesomeIcon 
                      icon={faRocket} 
                      className={`transition-transform duration-300 group-hover:translate-x-1 ${
                        plan.highlight ? 'animate-pulse' : ''
                      }`} 
                    />
                  </button>
                </div>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </div>
    );
  })()}

  {/* Enterprise Option */}
  <motion.div
    className="max-w-3xl mx-auto mt-24 text-center"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1, delay: 0.4 }}
    viewport={{ once: true }}
  >
    <p className="text-xl text-senary font-fira-code mb-6">
      Need something more? We offer custom enterprise plans for institutions and organizations.
    </p>
    <button
      onClick={() => navigate("/contact")}
      className="px-8 py-3 border-2 border-teal text-teal rounded-lg hover:bg-teal hover:text-background transition-all duration-300 font-semibold font-orbitron group"
    >
      <span className="flex items-center space-x-2">
        <span>Contact Us</span>
        <FontAwesomeIcon 
          icon={faMagic} 
          className="transition-transform duration-300 group-hover:rotate-12" 
        />
      </span>
    </button>
  </motion.div>
</section>
      {/* Call to Action Section */}
      <section className="py-48 px-6 bg-gradient-to-br from-background via-tertiary to-quaternary text-center animate-section relative overflow-hidden z-10">
        <GlowEffect />

        <motion.h2
          className="mb-14"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-6xl md:text-9xl font-bold font-orbitron">
            <span className="text-teal">Code</span>
            <span className="text-yellow">Up</span> Your Future!
          </span>
        </motion.h2>

        <motion.p
          className="text-xl md:text-4xl text-senary max-w-xl mx-auto mb-14 font-fira-code"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Unleash your coding potential today!
        </motion.p>

        <motion.div
          className="flex justify-center gap-14"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Tilt options={{ max: 20, scale: 1.1 }}>
            <button
              onClick={() => navigate("/login")}
              className="bg-teal text-background px-16 py-6 rounded-lg hover:bg-hover-teal transition-all duration-300 text-2xl font-semibold shadow-lg hover:shadow-2xl flex items-center space-x-4 font-orbitron relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <FontAwesomeIcon icon={faRocket} className="animate-pulse" />
              <span>Launch Now</span>
              <span className="absolute inset-0 border-2 border-teal rounded-lg opacity-0 group-hover:opacity-100 animate-ping-slow pointer-events-none"></span>
            </button>
          </Tilt>

          <Tilt options={{ max: 20, scale: 1.1 }}>
            <button
              onClick={() => navigate("/register")}
              className="bg-yellow text-background px-16 py-6 rounded-lg hover:bg-hover-yellow transition-all duration-300 text-2xl font-semibold shadow-lg hover:shadow-2xl flex items-center space-x-4 font-orbitron relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <FontAwesomeIcon icon={faRocket} className="animate-pulse" />
              <span>Join Now</span>
              <span className="absolute inset-0 border-2 border-yellow rounded-lg opacity-0 group-hover:opacity-100 animate-ping-slow pointer-events-none"></span>
            </button>
          </Tilt>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-tertiary text-center text-senary relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-xl font-fira-code mb-6">
            © 2025 <span className="text-teal">Code</span><span className="text-yellow">Up</span>
          </p>

          <p className="text-xl font-fira-code mb-10">
            Created by {" "}
            <span className="text-teal">CodelineCrew</span>
          </p>

          

          
        </div>
      </footer>
    </div>
  );
};

// Enhanced Feature Card Component
const FeatureCard = ({ icon, title, desc, delay, highlight = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    viewport={{ once: true }}
    whileHover={{ y: -10 }}
  >
    <Tilt options={{ max: 25, scale: 1.05, perspective: 1000 }}>
      <div
        className={`p-10 rounded-xl shadow-lg transition-all duration-300 transform hover:shadow-3xl border relative overflow-hidden ${
          highlight ? "bg-teal/20 border-teal" : "bg-quaternary border-teal/50"
        }`}
      >
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal/0 to-teal/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

        {/* Animated border */}
        <div className="absolute inset-0 rounded-xl border-2 border-teal/0 hover:border-teal/50 pointer-events-none transition-all duration-500"></div>

        <FontAwesomeIcon
          icon={icon}
          className={`text-6xl mb-6 ${highlight ? "text-yellow" : "text-teal"} ${
            highlight ? "animate-spin-slow" : "animate-bounce-slow"
          }`}
        />
        <h3 className="text-2xl font-semibold text-teal mb-4 font-orbitron">{title}</h3>
        <p className="text-senary text-base font-fira-code">{desc}</p>
      </div>
    </Tilt>
  </motion.div>
);

// Enhanced Mastery Step Component
const MasteryStep = ({ icon, title, desc, delay, highlight = false }) => (
  <motion.div
    className={`flex items-center gap-12 p-10 rounded-xl shadow-lg hover:bg-tertiary transition-all duration-300 border max-w-4xl mx-auto relative overflow-hidden ${
      highlight ? "bg-teal/20 border-teal" : "bg-quaternary border-teal/50"
    }`}
    initial={{ opacity: 0, x: -100 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 1, delay }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
  >
    {/* Hover effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-teal/0 to-teal/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

    {/* Animated icon background */}
    <div className={`absolute -left-10 w-32 h-32 rounded-full opacity-10 ${
      highlight ? "bg-yellow" : "bg-teal"
    } blur-xl`}></div>

    <FontAwesomeIcon
      icon={icon}
      className={`text-5xl relative z-10 ${
        highlight ? "text-yellow" : "text-teal"
      } ${highlight ? "animate-pulse" : "animate-spin-slow"}`}
    />
    <div className="relative z-10">
      <h3 className="text-3xl font-bold text-teal mb-4 font-orbitron">{title}</h3>
      <p className="text-lg text-senary font-fira-code">{desc}</p>
    </div>
  </motion.div>
);

export default LandingPage;
