import { useState, FormEvent, ChangeEvent } from "react";
import { register } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Mail, UserPlus, ArrowLeft } from "lucide-react";
import { COLORS } from "../utils/constants";
import { motion } from "framer-motion";

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterData>({ 
    fullName: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Clear general error message when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Omit confirmPassword from what we send to the API
      const { confirmPassword, ...registerData } = formData;
      
      const res = await register(registerData);
      
      if (res.data && res.data.accessToken) {
        // Token is already stored in localStorage by the register function
        navigate("/", { replace: true });
      } else {
        // If for some reason we don't get a token back but the request was successful
        setError("Registration successful. Please sign in to continue.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                         "Registration failed. Please try again.";
      
      // Handle specific error cases
      if (err.response?.status === 400 && 
          err.response?.data?.message?.includes("email")) {
        setError("This email is already registered. Please use a different email or sign in.");
      } else {
        setError(errorMessage);
      }
      
      console.error("Registration failed", err);
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
  
  const getInputStyle = (fieldName: string) => {
    return {
      ...inputStyle,
      border: errors[fieldName] 
        ? "1px solid rgba(239, 68, 68, 0.5)" 
        : "1px solid rgba(255, 255, 255, 0.1)"
    };
  };

  return (
    <div className="flex justify-center items-center min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-animation z-0"></div>
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#112C70]/80 to-[#0A2353]/80 z-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-20">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-[#BB63FF]/20 to-[#5B58EB]/20 blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-[#5B58EB]/20 to-[#56E1E9]/20 blur-xl"></div>
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
              <UserPlus size={32} color={COLORS.cyan} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>Create Account</h2>
            <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>Join the Galaxy platform</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-900/20 text-red-400 border border-red-900/30">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} color={COLORS.textSecondary} />
              </div>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className="w-full py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-500"
                style={getInputStyle("fullName")}
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.fullName && (
              <p className="text-xs mt-1" style={{ color: COLORS.error }}>{errors.fullName}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} color={COLORS.textSecondary} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-500"
                style={getInputStyle("email")}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1" style={{ color: COLORS.error }}>{errors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
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
                placeholder="Create a password"
                className="w-full py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-500"
                style={getInputStyle("password")}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: COLORS.error }}>{errors.password}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} color={COLORS.textSecondary} />
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className="w-full py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-500"
                style={getInputStyle("confirmPassword")}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs mt-1" style={{ color: COLORS.error }}>{errors.confirmPassword}</p>
            )}
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="mt-6 flex justify-center">
            <Link 
              to="/login"
              className="text-sm font-medium flex items-center hover:underline transition-all"
              style={{ color: COLORS.cyan }}
            >
              <ArrowLeft size={14} className="mr-1" />
              Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}