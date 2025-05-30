import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "student", 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
        { withCredentials: true }
      );
      if (response.status === 201) {
        navigate("/dashboard"); 
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      console.error("Registration error:", error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-tertiary to-quaternary opacity-80 animate-gradient"></div>
      <div className="absolute w-[600px] h-[600px] bg-teal opacity-10 rounded-full blur-3xl -top-40 -left-40 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-yellow opacity-10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse-slow"></div>

      

      
      <div className="relative bg-tertiary p-8 rounded-xl shadow-2xl w-full max-w-md border border-quaternary transform transition-all hover:scale-105 z-10">
        <h2 className="text-4xl font-extrabold text-teal mb-6 text-center tracking-wide animate-fade-in">
          Join CodeUp
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
              disabled={loading}
              className={`w-full px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-300 placeholder-senary ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
              disabled={loading}
              className={`w-full px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-300 placeholder-senary ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder="Create a password"
            />
          </div>
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-senary mb-2 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              id="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-300 placeholder-senary ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder="Choose your display name"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-senary mb-2 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              Role
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg shadow-md text-sm font-semibold uppercase tracking-wide transition-all duration-300 ${
                loading
                  ? "bg-teal opacity-50 cursor-not-allowed text-background"
                  : "bg-teal text-background hover:bg-hover-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              } animate-fade-in-up`}
              style={{ animationDelay: "0.4s" }}
            >
              {loading ? "Registering..." : "Start Coding"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-senary text-sm animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          Already with us?{" "}
          <Link to="/login" className="text-yellow hover:text-hover-yellow transition-colors duration-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;