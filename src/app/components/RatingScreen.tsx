import { ArrowLeft, Star, ThumbsUp, Heart, Gift, MapPin, Clock, DollarSign, Home, Search, Bell, User as UserIcon, Send, Zap, SmilePlus, MessageCircle, TrendingUp, Shield } from 'lucide-react';
import { useState } from 'react';

interface RatingScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  onNavigateSearch?: () => void;
  onNavigateActivity?: () => void;
  onNavigateProfile?: () => void;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  pickupLocation: string;
  dropoffLocation: string;
  fareAmount: number;
  onSubmit?: () => void;
}

export function RatingScreen({ onBack, onNavigateHome, onNavigateSearch, onNavigateActivity, onNavigateProfile, driverName, driverPhoto, driverRating, pickupLocation, dropoffLocation, fareAmount, onSubmit }: RatingScreenProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    driving: 0,
    cleanliness: 0,
    communication: 0,
    punctuality: 0
  });
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tipAmount, setTipAmount] = useState(0);

  const maxFeedbackLength = 500;

  const feedbackTags = [
    { id: 'friendly', label: 'Friendly', icon: '😊' },
    { id: 'professional', label: 'Professional', icon: '👔' },
    { id: 'clean-car', label: 'Clean Car', icon: '✨' },
    { id: 'safe-driving', label: 'Safe Driving', icon: '🛡️' },
    { id: 'punctual', label: 'On Time', icon: '⏰' },
    { id: 'helpful', label: 'Helpful', icon: '🤝' },
    { id: 'quiet', label: 'Respectful', icon: '🤫' },
    { id: 'smooth-ride', label: 'Smooth Ride', icon: '🚗' }
  ];

  const tipOptions = [
    { amount: 0, label: 'No Tip' },
    { amount: 0.50, label: 'BD 0.50' },
    { amount: 1.00, label: 'BD 1.00' },
    { amount: 2.00, label: 'BD 2.00' },
    { amount: 3.00, label: 'BD 3.00' }
  ];

  const categories = [
    { id: 'driving', label: 'Driving', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cleanliness', label: 'Cleanliness', icon: <Zap className="w-4 h-4" /> },
    { id: 'communication', label: 'Communication', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'punctuality', label: 'Punctuality', icon: <Clock className="w-4 h-4" /> }
  ];

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const renderStars = (rating: number, setRating: (rating: number) => void, hoverState?: number, setHoverState?: (rating: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverState?.(star)}
            onMouseLeave={() => setHoverState?.(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= (hoverState || rating)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderSmallStars = (rating: number, categoryId: keyof typeof categoryRatings) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setCategoryRatings(prev => ({ ...prev, [categoryId]: star }))}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= categoryRatings[categoryId]
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = () => {
    if (overallRating === 0) return 'Tap to rate';
    if (overallRating === 5) return 'Excellent! 🌟';
    if (overallRating === 4) return 'Great! 😊';
    if (overallRating === 3) return 'Good 👍';
    if (overallRating === 2) return 'Fair 😐';
    return 'Needs Improvement 😕';
  };

  const isSubmitEnabled = overallRating > 0;

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-2xl font-bold">Rate Your Ride</h1>
            <p className="text-white/90 text-sm">Help us improve your experience</p>
          </div>

          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors shrink-0"
              aria-label="Go to home"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Driver Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Driver Photo */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-white">
              {driverPhoto}
            </div>

            {/* Driver Details */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{driverName}</h2>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-700">{driverRating}</span>
                <span className="text-sm text-gray-500">• Your driver</span>
              </div>
            </div>

            {/* Thank You Badge */}
            <div className="text-center">
              <div className="text-3xl mb-1">🙏</div>
              <p className="text-xs text-gray-600 font-medium">Thank you!</p>
            </div>
          </div>

          {/* Trip Summary */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <MapPin className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Route</p>
              <p className="text-sm font-semibold text-gray-800">A → B</p>
            </div>
            <div>
              <Clock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-gray-800">18 min</p>
            </div>
            <div>
              <DollarSign className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Fare</p>
              <p className="text-sm font-semibold text-gray-800">BD {fareAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-44">
        {/* Overall Rating */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">How was your ride?</h3>
            <p className="text-sm text-gray-600">Rate your overall experience</p>
          </div>

          <div className="flex justify-center mb-3">
            {renderStars(overallRating, setOverallRating, hoveredStar, setHoveredStar)}
          </div>

          <p className="text-center text-lg font-semibold text-purple-600">
            {getRatingText()}
          </p>
        </div>

        {/* Category Ratings */}
        {overallRating > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <SmilePlus className="w-5 h-5 text-purple-600" />
              Rate Specific Areas
            </h3>
            <p className="text-sm text-gray-600 mb-4">Help us understand your experience better</p>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      {category.icon}
                    </div>
                    <span className="font-medium text-gray-800">{category.label}</span>
                  </div>
                  {renderSmallStars(categoryRatings[category.id as keyof typeof categoryRatings], category.id as keyof typeof categoryRatings)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Feedback Tags */}
        {overallRating > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">What did you like?</h3>
            <p className="text-sm text-gray-600 mb-4">Select all that apply</p>

            <div className="flex flex-wrap gap-2">
              {feedbackTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span className="text-sm">{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Written Feedback */}
        {overallRating > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Additional Feedback</h3>
            <p className="text-sm text-gray-600 mb-4">Share more about your experience (optional)</p>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, maxFeedbackLength))}
              placeholder="Tell us what made this ride special or how we can improve..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">Your feedback helps us improve</p>
              <p className={`text-xs ${feedback.length >= maxFeedbackLength ? 'text-red-600' : 'text-gray-500'}`}>
                {feedback.length}/{maxFeedbackLength}
              </p>
            </div>
          </div>
        )}

        {/* Tip Section */}
        {overallRating >= 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-800">Add a Tip</h3>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {driverName} did a great job! Show your appreciation
            </p>

            <div className="grid grid-cols-5 gap-2">
              {tipOptions.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => setTipAmount(option.amount)}
                  className={`py-3 rounded-xl font-medium transition-all text-sm ${
                    tipAmount === option.amount
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {tipAmount > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600 fill-green-600" />
                <p className="text-sm text-green-800">
                  Thank you for adding a <strong>BD {tipAmount.toFixed(2)}</strong> tip! 💚
                </p>
              </div>
            )}
          </div>
        )}

        {/* Privacy Notice */}
        {overallRating > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 mb-4">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Your feedback is private</p>
              <p className="text-xs text-blue-700">
                We use your ratings to improve service quality. Your review helps other riders too.
              </p>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {overallRating === 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 text-center">
            <div className="text-5xl mb-3">⭐</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Rate Your Experience</h3>
            <p className="text-gray-600">
              Your feedback helps us maintain high-quality service and reward excellent drivers.
            </p>
          </div>
        )}
      </div>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          disabled={!isSubmitEnabled}
          onClick={() => onSubmit?.()}
          className={`w-full py-4 rounded-full text-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
            isSubmitEnabled
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-xl active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
          {tipAmount > 0 ? `Submit Review & Tip (BD ${tipAmount.toFixed(2)})` : 'Submit Review'}
        </button>
        
        {isSubmitEnabled && (
          <p className="text-center text-xs text-gray-500 mt-2">
            {tipAmount > 0 
              ? `Your review and tip will be submitted`
              : 'Your honest feedback helps us improve'}
          </p>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            type="button"
            onClick={() => onNavigateHome?.()}
            className="flex flex-col items-center text-purple-600 transition-colors"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSearch?.()}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">Search</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateActivity?.()}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs">Activity</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateProfile?.()}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}