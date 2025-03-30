import { useState, FormEvent, ChangeEvent } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn } from "lucide-react";
import { COLORS } from "../utils/constants";
import { motion } from "framer-motion";

interface Credentials {
  email: string;
  password: string;
}

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({ email: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Clear error message when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await login(credentials);
      
      if (res.data && res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        navigate("/", { replace: true });
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)"
  };
  
  const inputStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: COLORS.textPrimary
  };

  return (
    <div className="flex justify-center items-center min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-animation z-0"></div>
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#112C70]/80 to-[#0A2353]/80 z-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-[#5B58EB]/20 to-[#BB63FF]/20 blur-xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-[#56E1E9]/20 to-[#5B58EB]/20 blur-xl"></div>
      </div>
      
      <motion.div 
        className="z-30 relative w-full max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form 
          onSubmit={handleSubmit} 
          className="rounded-xl p-8"
          style={glassStyle}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(91, 88, 235, 0.3)" }}>
              <LogIn size={32} color={COLORS.cyan} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>Welcome Back</h2>
            <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>Sign in to your account</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-900/20 text-red-400 border border-red-900/30">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} color={COLORS.textSecondary} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-500"
                style={inputStyle}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} color={COLORS.textSecondary} />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-500"
                style={inputStyle}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white font-medium transition-all flex items-center justify-center"
            style={{ 
              background: loading 
                ? 'rgba(91, 88, 235, 0.7)' 
                : `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
              boxShadow: '0 4px 10px rgba(91, 88, 235, 0.3)'
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className="mt-6 text-center">
            <p style={{ color: COLORS.textSecondary }}>
              <span className="text-sm">Don't have an account? </span>
              <a 
                href="/register" 
                className="text-sm font-medium hover:underline transition-all"
                style={{ color: COLORS.cyan }}
              >
                Sign up
              </a>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}