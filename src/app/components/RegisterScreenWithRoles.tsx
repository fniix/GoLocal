import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { createDriverProfile, createUserProfile } from "../../services/firebaseService";
import Waves from './ui/Waves';

interface RegisterScreenWithRolesProps {
  onBack: () => void;
  onLogin: () => void;
  onRegisterPassenger?: (name: string, city: string) => void;
  onRegisterDriver?: (name: string, city: string, vehicleType: string, vehiclePlate: string, driverLicense: string, permitNumber: string) => void;
  onNavigateHome?: () => void;
  onNavigateSettings?: () => void;
}

export function RegisterScreenWithRoles({ 
  onBack, 
  onLogin, 
  onRegisterPassenger, 
  onRegisterDriver, 
  onNavigateHome, 
  onNavigateSettings 
}: RegisterScreenWithRolesProps) {
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver'>('passenger');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [city, setCity] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [idCardImage, setIdCardImage] = useState<File | null>(null);
  const [driverLicenseImage, setDriverLicenseImage] = useState<File | null>(null);
  const [vehicleRegistrationImage, setVehicleRegistrationImage] = useState<File | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    vehicleType: '',
    vehiclePlate: '',
    driverLicenseNumber: '',
    permitNumber: '',
    idCardImage: '',
    driverLicenseImage: '',
    vehicleRegistrationImage: ''
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

  const validateConfirmPassword = (confirmPwd: string): { isValid: boolean; message: string } => {
    if (!confirmPwd) {
      return { isValid: false, message: 'Please confirm your password' };
    }
    if (confirmPwd !== password) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: '' };
  };

  const validateCity = (city: string): { isValid: boolean; message: string } => {
    if (!city) {
      return { isValid: false, message: 'Please select a city' };
    }
    return { isValid: true, message: '' };
  };

  const validateVehicleType = (type: string): { isValid: boolean; message: string } => {
    if (!type) {
      return { isValid: false, message: 'Please select a vehicle type' };
    }
    return { isValid: true, message: '' };
  };

  const validateVehiclePlate = (plate: string): { isValid: boolean; message: string } => {
    if (!plate.trim()) {
      return { isValid: false, message: 'Vehicle plate number is required' };
    }
    if (plate.trim().length < 3) {
      return { isValid: false, message: 'Please enter a valid plate number' };
    }
    return { isValid: true, message: '' };
  };

  const validateDriverLicenseNumber = (license: string): { isValid: boolean; message: string } => {
    if (!license.trim()) {
      return { isValid: false, message: 'Driver license number is required' };
    }
    if (license.trim().length < 5) {
      return { isValid: false, message: 'Please enter a valid license number' };
    }
    return { isValid: true, message: '' };
  };

  const validatePermitNumber = (permit: string): { isValid: boolean; message: string } => {
    if (!permit.trim()) {
      return { isValid: false, message: 'Permit number is required' };
    }
    if (permit.trim().length < 5) {
      return { isValid: false, message: 'Please enter a valid permit number' };
    }
    return { isValid: true, message: '' };
  };

  // Check if all fields are valid
  const isFormValid = (): boolean => {
    const nameValid = validateFullName(fullName).isValid;
    const phoneValid = validatePhoneNumber(phoneNumber).isValid;
    const emailValid = validateEmail(email).isValid;
    const passwordValid = validatePassword(password).isValid;
    const confirmPasswordValid = validateConfirmPassword(confirmPassword).isValid;
    const cityValid = validateCity(city).isValid;
    
    if (selectedRole === 'passenger') {
      return nameValid && phoneValid && emailValid && passwordValid && confirmPasswordValid && cityValid;
    } else {
      const vehicleTypeValid = validateVehicleType(vehicleType).isValid;
      const vehiclePlateValid = validateVehiclePlate(vehiclePlate).isValid;
      const driverLicenseValid = validateDriverLicenseNumber(driverLicenseNumber).isValid;
      const permitValid = validatePermitNumber(permitNumber).isValid;
      const idCardImageValid = idCardImage !== null;
      const driverLicenseImageValid = driverLicenseImage !== null;
      const vehicleRegImageValid = vehicleRegistrationImage !== null;
      
      return nameValid && phoneValid && emailValid && passwordValid && confirmPasswordValid && cityValid && 
             vehicleTypeValid && vehiclePlateValid && driverLicenseValid && permitValid && 
             idCardImageValid && driverLicenseImageValid && vehicleRegImageValid;
    }
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
      case 'confirmPassword':
        validation = validateConfirmPassword(value);
        break;
      case 'city':
        validation = validateCity(value);
        break;
      case 'vehicleType':
        validation = validateVehicleType(value);
        break;
      case 'vehiclePlate':
        validation = validateVehiclePlate(value);
        break;
      case 'driverLicenseNumber':
        validation = validateDriverLicenseNumber(value);
        break;
      case 'permitNumber':
        validation = validatePermitNumber(value);
        break;
      default:
        return;
    }
    
    if (!validation.isValid) {
      setErrors({ ...errors, [field]: validation.message });
    }
  };

  const registerPassenger = async (emailValue: string, passwordValue: string, nameValue: string, cityValue: string, phoneValue: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      await createUserProfile({
        uid: cred.user.uid,
        role: "user",
        name: nameValue,
        email: emailValue,
        phone: phoneValue,
        city: cityValue,
      });

      if (onRegisterPassenger) {
        onRegisterPassenger(nameValue, cityValue);
      }
    } catch (err) {
      alert("Error creating account: " + err);
    }
  };

  const registerDriver = async (
    emailValue: string,
    passwordValue: string,
    nameValue: string,
    cityValue: string,
    vehicleTypeValue: string,
    plateValue: string,
    licenseValue: string,
    permitValue: string
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      await createUserProfile({
        uid: cred.user.uid,
        role: "driver",
        name: nameValue,
        email: emailValue,
        phone: phoneNumber,
        city: cityValue,
        extra: {
          vehicleType: vehicleTypeValue,
          vehiclePlate: plateValue,
        },
      });
      await createDriverProfile({
        driverId: cred.user.uid,
        name: nameValue,
        email: emailValue,
        phone: phoneNumber,
        carType: vehicleTypeValue,
        area: cityValue,
      });

      alert("Your application has been submitted successfully. It will be reviewed by GoLocal administration.");
      if (onLogin) {
        onLogin();
      }
    } catch (err) {
      alert("Error creating driver account: " + err);
    }
  };

  const handleCreateAccount = () => {
    const newErrors = {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      city: '',
      vehicleType: '',
      vehiclePlate: '',
      driverLicenseNumber: '',
      permitNumber: '',
      idCardImage: '',
      driverLicenseImage: '',
      vehicleRegistrationImage: ''
    };

    // Validate all common fields
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

    const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      newErrors.confirmPassword = confirmPasswordValidation.message;
    }

    const cityValidation = validateCity(city);
    if (!cityValidation.isValid) {
      newErrors.city = cityValidation.message;
    }

    // Validate driver-specific fields
    if (selectedRole === 'driver') {
      const vehicleTypeValidation = validateVehicleType(vehicleType);
      if (!vehicleTypeValidation.isValid) {
        newErrors.vehicleType = vehicleTypeValidation.message;
      }

      const vehiclePlateValidation = validateVehiclePlate(vehiclePlate);
      if (!vehiclePlateValidation.isValid) {
        newErrors.vehiclePlate = vehiclePlateValidation.message;
      }

      const driverLicenseValidation = validateDriverLicenseNumber(driverLicenseNumber);
      if (!driverLicenseValidation.isValid) {
        newErrors.driverLicenseNumber = driverLicenseValidation.message;
      }

      const permitValidation = validatePermitNumber(permitNumber);
      if (!permitValidation.isValid) {
        newErrors.permitNumber = permitValidation.message;
      }

      if (!idCardImage) {
        newErrors.idCardImage = 'ID Card image is required';
      }

      if (!driverLicenseImage) {
        newErrors.driverLicenseImage = 'Driver License image is required';
      }

      if (!vehicleRegistrationImage) {
        newErrors.vehicleRegistrationImage = 'Vehicle Registration image is required';
      }
    }

    setErrors(newErrors);

    // If no errors, proceed with registration
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (!hasErrors) {
      if (selectedRole === 'passenger') {
        registerPassenger(email, password, fullName, city, phoneNumber);
      } else if (selectedRole === 'driver') {
        registerDriver(email, password, fullName, city, vehicleType, vehiclePlate, driverLicenseNumber, permitNumber);
        setShowSuccessMessage(true);
      }
    }
  };

  return (
    <div className="size-full bg-[#0a0a0c] flex flex-col relative overflow-hidden">
      {/* Interactive Waves Background */}
      <div className="absolute inset-0 z-0">
        <Waves
          lineColor="rgba(139, 92, 246, 0.3)"
          backgroundColor="transparent"
          waveSpeedX={0.01}
          waveSpeedY={0.005}
          waveAmpX={50}
          waveAmpY={30}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      <div className="relative z-10 flex flex-col size-full">
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
      <div className="flex-1 overflow-y-auto px-6 pb-24">
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

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('passenger')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'passenger'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl mb-2 ${selectedRole === 'passenger' ? 'text-purple-600' : 'text-gray-600'}`}>
                    🚗
                  </div>
                  <div className={`text-sm font-semibold ${selectedRole === 'passenger' ? 'text-purple-600' : 'text-gray-700'}`}>
                    User
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('driver')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'driver'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl mb-2 ${selectedRole === 'driver' ? 'text-purple-600' : 'text-gray-600'}`}>
                    🚕
                  </div>
                  <div className={`text-sm font-semibold ${selectedRole === 'driver' ? 'text-purple-600' : 'text-gray-700'}`}>
                    Driver
                  </div>
                </div>
              </button>
            </div>
          </div>

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
              placeholder="+973 XXXXXXXX"
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

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                onBlur={(e) => handleFieldBlur('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* City Selector */}
          <div className="mb-4">
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
              className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.city ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all bg-white`}
            >
              <option value="">Select your city</option>
              <option value="Manama">Manama</option>
              <option value="Muharraq">Muharraq</option>
              <option value="Riffa">Riffa</option>
              <option value="Hamad Town">Hamad Town</option>
              <option value="Isa Town">Isa Town</option>
              <option value="Sitra">Sitra</option>
              <option value="Budaiya">Budaiya</option>
              <option value="Jidhafs">Jidhafs</option>
              <option value="Sanabis">Sanabis</option>
              <option value="Tubli">Tubli</option>
              <option value="Adliya">Adliya</option>
              <option value="Seef">Seef</option>
              <option value="Amwaj Islands">Amwaj Islands</option>
              <option value="Durrat Al Bahrain">Durrat Al Bahrain</option>
            </select>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          {/* Driver-Specific Fields */}
          {selectedRole === 'driver' && (
            <>
              {/* Vehicle Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => {
                    setVehicleType(e.target.value);
                    setErrors({ ...errors, vehicleType: '' });
                  }}
                  onBlur={(e) => handleFieldBlur('vehicleType', e.target.value)}
                  className={`w-full px-4 py-3 border ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.vehicleType ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all bg-white`}
                >
                  <option value="">Select vehicle type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                  <option value="luxury">Luxury</option>
                </select>
                {errors.vehicleType && (
                  <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>
                )}
              </div>

              {/* Vehicle Plate Number Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Plate Number
                </label>
                <input
                  type="text"
                  placeholder="Enter vehicle plate number"
                  value={vehiclePlate}
                  onChange={(e) => {
                    setVehiclePlate(e.target.value.toUpperCase());
                    setErrors({ ...errors, vehiclePlate: '' });
                  }}
                  onBlur={(e) => handleFieldBlur('vehiclePlate', e.target.value)}
                  className={`w-full px-4 py-3 border ${errors.vehiclePlate ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.vehiclePlate ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
                />
                {errors.vehiclePlate && (
                  <p className="text-red-500 text-xs mt-1">{errors.vehiclePlate}</p>
                )}
              </div>

              {/* Driver License Number Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver License Number
                </label>
                <input
                  type="text"
                  placeholder="Enter driver license number"
                  value={driverLicenseNumber}
                  onChange={(e) => {
                    setDriverLicenseNumber(e.target.value);
                    setErrors({ ...errors, driverLicenseNumber: '' });
                  }}
                  onBlur={(e) => handleFieldBlur('driverLicenseNumber', e.target.value)}
                  className={`w-full px-4 py-3 border ${errors.driverLicenseNumber ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.driverLicenseNumber ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
                />
                {errors.driverLicenseNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.driverLicenseNumber}</p>
                )}
              </div>

              {/* Permit Number Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Number
                </label>
                <input
                  type="text"
                  placeholder="Enter permit number"
                  value={permitNumber}
                  onChange={(e) => {
                    setPermitNumber(e.target.value);
                    setErrors({ ...errors, permitNumber: '' });
                  }}
                  onBlur={(e) => handleFieldBlur('permitNumber', e.target.value)}
                  className={`w-full px-4 py-3 border ${errors.permitNumber ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.permitNumber ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
                />
                {errors.permitNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.permitNumber}</p>
                )}
              </div>

              {/* ID Card Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload ID Card Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setIdCardImage(e.target.files?.[0] || null);
                    setErrors({ ...errors, idCardImage: '' });
                  }}
                  className={`w-full px-4 py-3 border ${errors.idCardImage ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.idCardImage ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
                />
                {idCardImage && <p className="text-green-600 text-xs mt-1">✓ {idCardImage.name}</p>}
                {errors.idCardImage && (
                  <p className="text-red-500 text-xs mt-1">{errors.idCardImage}</p>
                )}
              </div>

              {/* Driver License Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Driver License Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setDriverLicenseImage(e.target.files?.[0] || null);
                    setErrors({ ...errors, driverLicenseImage: '' });
                  }}
                  className={`w-full px-4 py-3 border ${errors.driverLicenseImage ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.driverLicenseImage ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
                />
                {driverLicenseImage && <p className="text-green-600 text-xs mt-1">✓ {driverLicenseImage.name}</p>}
                {errors.driverLicenseImage && (
                  <p className="text-red-500 text-xs mt-1">{errors.driverLicenseImage}</p>
                )}
              </div>

              {/* Vehicle Registration Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Vehicle Registration Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setVehicleRegistrationImage(e.target.files?.[0] || null);
                    setErrors({ ...errors, vehicleRegistrationImage: '' });
                  }}
                  className={`w-full px-4 py-3 border ${errors.vehicleRegistrationImage ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 ${errors.vehicleRegistrationImage ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
                />
                {vehicleRegistrationImage && <p className="text-green-600 text-xs mt-1">✓ {vehicleRegistrationImage.name}</p>}
                {errors.vehicleRegistrationImage && (
                  <p className="text-red-500 text-xs mt-1">{errors.vehicleRegistrationImage}</p>
                )}
              </div>
            </>
          )}

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

      {/* Driver Success Message Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your application has been submitted successfully.<br /><br />
                It will be reviewed by GoLocal administration.<br /><br />
                You will receive approval by email before you can log in.
              </p>
              <button 
                onClick={onLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}

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
