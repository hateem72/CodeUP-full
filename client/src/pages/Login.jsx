import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-br from-background via-tertiary to-quaternary opacity-80 animate-gradient"></div>
      <div className="absolute w-[600px] h-[600px] bg-teal opacity-10 rounded-full blur-3xl -top-40 -left-40 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-yellow opacity-10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse-slow"></div>

      
      <div className="relative bg-tertiary p-8 rounded-xl shadow-2xl w-full max-w-md border border-quaternary transform transition-all hover:scale-105 z-10">
        <h2 className="text-4xl font-extrabold text-teal mb-6 text-center tracking-wide animate-fade-in">
          CodeUp Login
        </h2>
        {error && (
          <div className="mb-6 text-center text-octonary bg-quaternary p-3 rounded-lg border border-hover-teal animate-slide-in">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-senary mb-2 animate-fade-in-up"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-300 placeholder-senary"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-senary mb-2 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-300 placeholder-senary"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-teal text-background rounded-lg shadow-md hover:bg-hover-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-all duration-300 text-sm font-semibold uppercase tracking-wide animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Enter the CodeVerse
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-senary text-sm animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          New to CodeUp?{" "}
          <a href="/register" className="text-yellow hover:text-hover-yellow transition-colors duration-200">
            Register Now
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;