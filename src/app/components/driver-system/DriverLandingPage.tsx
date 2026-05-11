interface DriverLandingPageProps {
  onEnterSystem: () => void;
}

export function DriverLandingPage({ onEnterSystem }: DriverLandingPageProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-600 via-blue-500 to-purple-700 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl overflow-hidden">
            <img src="/logo.png" alt="GoLocal Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
          GoLocal Driver System
        </h1>

        {/* Subtitle */}
        <p className="text-2xl text-white/90 mb-12 font-light">
          Smart mobility and delivery management platform
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🚗</div>
            <h3 className="text-white font-semibold text-lg mb-2">Smart Routing</h3>
            <p className="text-white/80 text-sm">Optimized delivery routes</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-white font-semibold text-lg mb-2">Flexible Pricing</h3>
            <p className="text-white/80 text-sm">Set your own rates</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-white font-semibold text-lg mb-2">Track Performance</h3>
            <p className="text-white/80 text-sm">Monitor ratings & earnings</p>
          </div>
        </div>

        {/* Enter System Button */}
        <button
          onClick={onEnterSystem}
          className="bg-white text-purple-600 px-12 py-5 rounded-full text-2xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
        >
          Enter System
        </button>

        {/* Footer Note */}
        <p className="text-white/60 text-sm mt-8">
          Demo Environment • No Login Required
        </p>
      </div>
    </div>
  );
}
