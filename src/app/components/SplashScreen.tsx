import React from 'react';
import Waves from './ui/Waves';

interface SplashScreenProps {
  onLogin: () => void;
  onCreateAccount: () => void;
}

export function SplashScreen({ onLogin, onCreateAccount }: SplashScreenProps) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden">
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
      <div className="absolute inset-0 z-1 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full max-w-md px-6 py-20">
        {/* Logo and Tagline Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-10 relative">
            {/* Animated Glow Effect behind logo */}
            <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full animate-pulse" />
            
            {/* Logo Circle */}
            <div className="w-36 h-36 rounded-[2.5rem] bg-white p-1 shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden relative z-10 border border-white/20">
              <img src="/logo.png" alt="GoLocal Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Tagline */}
          <h1 className="text-white text-3xl font-bold text-center mt-4 tracking-tight">
            GoLocal
          </h1>
          <p className="text-gray-400 text-lg text-center mt-2 font-medium">
            Your Local Ride, Anytime
          </p>
        </div>

        {/* Buttons Section */}
        <div className="w-full space-y-5">
          <button 
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4.5 rounded-2xl text-xl font-bold shadow-[0_10px_25px_-5px_rgba(139,92,246,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(139,92,246,0.6)] active:scale-[0.98] transition-all"
          >
            Login
          </button>
          
          <button 
            onClick={onCreateAccount}
            className="w-full bg-white/5 border border-white/10 text-white py-4.5 rounded-2xl text-xl font-bold backdrop-blur-xl hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
