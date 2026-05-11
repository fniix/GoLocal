import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Orb from './ui/Orb';

interface RegisterScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onRegister?: (name: string, city: string) => void;
  onNavigateHome?: () => void;
  onNavigateSettings?: () => void;
}

export function RegisterScreen({ onBack, onLogin, onRegister, onNavigateHome, onNavigateSettings }: RegisterScreenProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    city: ''
  });

  const validateFullName = (name: string): { isValid: boolean; message: string } => {
    if (!name.trim()) {
      return { isValid: false, message: 'Full name is required' };
    }
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
      return { isValid: false, message: 'Full name must contain at least 2 words' };
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return { isValid: false, message: 'Full name must contain only letters' };
    }
    return { isValid: true, message: '' };
  };

  const validatePhoneNumber = (phone: string): { isValid: boolean; message: string } => {
    if (!phone.trim()) {
      return { isValid: false, message: 'Phone number is required' };
    }
    // Must start with +973 and have exactly 8 digits after
    const phoneRegex = /^\+973\s?\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, message: 'Phone must start with +973 and contain exactly 8 digits' };
    }
    return { isValid: true, message: '' };
  };

  const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (!email.trim()) {
      return { isValid: false, message: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address (example@domain.com)' };
    }
    return { isValid: true, message: '' };
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: '' };
  };

  const validateCity = (city: string): { isValid: boolean; message: string } => {
    if (!city) {
      return { isValid: false, message: 'Please select a city' };
    }
    return { isValid: true, message: '' };
  };

  // Check if all fields are valid
  const isFormValid = (): boolean => {
    const nameValid = validateFullName(fullName).isValid;
    const phoneValid = validatePhoneNumber(phoneNumber).isValid;
    const emailValid = validateEmail(email).isValid;
    const passwordValid = validatePassword(password).isValid;
    const cityValid = validateCity(city).isValid;
    
    return nameValid && phoneValid && emailValid && passwordValid && cityValid;
  };

  const handleFieldBlur = (field: string, value: string) => {
    let validation;
    switch (field) {
      case 'fullName':
        validation = validateFullName(value);
        break;
      case 'phoneNumber':
        validation = validatePhoneNumber(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'city':
        validation = validateCity(value);
        break;
      default:
        return;
    }
    
    if (!validation.isValid) {
      setErrors({ ...errors, [field]: validation.message });
    }
  };

  const handleCreateAccount = () => {
    const newErrors = {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      city: ''
    };

    // Validate all fields
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.message;
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.message;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    const cityValidation = validateCity(city);
    if (!cityValidation.isValid) {
      newErrors.city = cityValidation.message;
    }

    setErrors(newErrors);

    // If no errors, proceed with registration
    if (!newErrors.fullName && !newErrors.phoneNumber && !newErrors.email && !newErrors.password && !newErrors.city) {
      if (onRegister) {
        onRegister(fullName, city);
      }
    }
  };

  return (
    <div className="size-full bg-black flex flex-col relative overflow-hidden">
      {/* Dynamic Orb Background */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <Orb 
          hoverIntensity={0.5} 
          rotateOnHover={true} 
          hue={200} 
          forceHoverState={true}
          backgroundColor="#000000"
        />
      </div>

      <div className="relative z-10 flex flex-col size-full overflow-y-auto">
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
        <div className="flex-1 px-6 pb-24">
          <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-8 my-6 border border-white/20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Go</div>
                <div className="text-xl font-bold text-white -mt-1">Local</div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Create Account</h2>
          <p className="text-center text-gray-600 mb-6">Sign up to get started</p>

          {/* Full Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors({ ...errors, fullName: '' });
              }}
              onBlur={(e) => handleFieldBlur('fullName', e.target.value)}
              className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.fullName ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setErrors({ ...errors, phoneNumber: '' });
              }}
              onBlur={(e) => handleFieldBlur('phoneNumber', e.target.value)}
              className={`w-full px-4 py-3 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.phoneNumber ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              onBlur={(e) => handleFieldBlur('email', e.target.value)}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                onBlur={(e) => handleFieldBlur('password', e.target.value)}
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
            <p className="text-xs text-gray-500 mt-1">
              Must be 8+ characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* City Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setErrors({ ...errors, city: '' });
              }}
              onBlur={(e) => handleFieldBlur('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Select your city</option>
              <option value="manama">Manama</option>
              <option value="muharraq">Muharraq</option>
              <option value="riffa">Riffa</option>
              <option value="hamad-town">Hamad Town</option>
              <option value="isa-town">Isa Town</option>
              <option value="sitra">Sitra</option>
              <option value="budaiya">Budaiya</option>
              <option value="jidhafs">Jidhafs</option>
              <option value="sanabis">Sanabis</option>
              <option value="tubli">Tubli</option>
              <option value="adliya">Adliya</option>
              <option value="seef">Seef</option>
              <option value="amwaj">Amwaj Islands</option>
              <option value="durrat-al-bahrain">Durrat Al Bahrain</option>
            </select>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          {/* Create Account Button */}
          <button 
            onClick={handleCreateAccount}
            disabled={!isFormValid()}
            className={`w-full py-3 rounded-full text-lg font-semibold shadow-lg transition-all mb-6 ${
              isFormValid()
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-xl active:scale-95 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Account
          </button>

          {/* Login Link */}
          <div className="text-center">
            <button 
              onClick={onLogin}
              className="text-sm text-gray-600"
            >
              Already have an account?{' '}
              <span className="text-purple-600 font-semibold hover:text-purple-700">
                Login
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors" onClick={onNavigateHome}>
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>

          <button className="flex flex-col items-center text-purple-600 transition-colors" onClick={onNavigateSettings}>
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Account</span>
          </button>

          <button className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors" onClick={onNavigateSettings}>
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
}