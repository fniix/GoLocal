import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

interface LoginScreenProps {
  onBack: () => void;
  onCreateAccount: () => void;
  onLogin?: (userData: { name: string; email: string; phone: string; city: string }) => void;
  onLoginAsAdmin?: (userData: { name: string; email: string }) => void;
  onLoginAsDriver?: (userData: { name: string; email: string; phone: string; city: string; vehicleType: string; vehiclePlate: string }) => void;
  onNavigateHomeAsGuest?: () => void;
  onNavigateProfileAsGuest?: () => void;
}

export function LoginScreen({ onBack, onCreateAccount, onLogin, onLoginAsAdmin, onLoginAsDriver, onNavigateHomeAsGuest, onNavigateProfileAsGuest }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const newErrors = {
      email: '',
      password: ''
    };

    // Validate email
    if (!email) {
      newErrors.email = 'Email or phone number is required';
    } else if (email.includes('@') && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // If no errors, proceed with Firebase login
    if (!newErrors.email && !newErrors.password) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        // نقرأ بياناته من Firestore
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          alert("User data not found");
          return;
        }

        const data = snap.data();
        const role = data.role?.toLowerCase() || 'user'; // تحويل إلى أحرف صغيرة
        const userData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          vehicleType: data.vehicleType,
          vehiclePlate: data.vehiclePlate
        };

        if (role === "admin") {
          if (onLoginAsAdmin) {
            onLoginAsAdmin({ name: data.name, email: data.email });
          }
        }
        else if (role === "driver") {
          if (onLoginAsDriver) {
            onLoginAsDriver(userData);
          }
        }
        else {
          if (onLogin) {
            onLogin(userData);
          }
        }

      } catch (err) {
        alert("Invalid email or password");
      }
    }
  };

  return (
    <div className="size-full bg-gradient-to-b from-purple-600 to-blue-500 flex flex-col">
      {/* Header with Back Button */}
      <div className="p-4">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Go</div>
                <div className="text-xl font-bold text-white -mt-1">Local</div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</h2>

          {/* Phone/Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number or Email
            </label>
            <input
              type="text"
              placeholder="Enter your phone or email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-6">
            <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow mb-6"
          >
            Login
          </button>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 py-3 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 rounded-full font-medium hover:bg-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <button
              onClick={onCreateAccount}
              className="text-sm text-gray-600"
            >
              Don't have an account?{' '}
              <span className="text-purple-600 font-semibold hover:text-purple-700">
                Create a new account
              </span>
            </button>
          </div>

          {/* Continue as Guest */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                if (onLogin) {
                  onLogin({ name: '', email: '', phone: '', city: 'manama' });
                }
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Continue as Guest
            </button>
            <p className="text-xs text-gray-400 mt-2">
              You can browse services without creating an account.<br />
              Booking history and activities will not be saved.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => {
              if (onNavigateHomeAsGuest) {
                onNavigateHomeAsGuest();
              }
            }}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateProfileAsGuest) {
                onNavigateProfileAsGuest();
              }
            }}
            className="flex flex-col items-center text-purple-600 transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Account</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateProfileAsGuest) {
                onNavigateProfileAsGuest();
              }
            }}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}