import { Home, FileText, Inbox, Truck, DollarSign, Star, User, Calendar } from 'lucide-react';

interface ReviewsProps {
  onNavigateToDashboard: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToProfile: () => void;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  route: string;
  serviceType: string;
}

export function Reviews({
  onNavigateToDashboard,
  onNavigateToMyOffers,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToProfile,
}: ReviewsProps) {
  const reviews: Review[] = [
    {
      id: '1',
      customerName: 'Sara Ahmed',
      rating: 5,
      comment: 'Excellent service! Very professional driver and the car was clean. Arrived on time and drove safely. Would definitely book again!',
      date: 'January 18, 2026',
      route: 'Manama → Riffa',
      serviceType: 'Private Driver',
    },
    {
      id: '2',
      customerName: 'Mohammed Ali',
      rating: 5,
      comment: 'Great experience! Driver was friendly and helpful with my luggage. Smooth ride from the airport.',
      date: 'January 18, 2026',
      route: 'Muharraq → Seef',
      serviceType: 'OnTheWay',
    },
    {
      id: '3',
      customerName: 'Fatima Hassan',
      rating: 4,
      comment: 'Good service overall. Driver was polite and the ride was comfortable. Just a bit of delay in pickup.',
      date: 'January 18, 2026',
      route: 'Adliya → Juffair',
      serviceType: 'Private Driver',
    },
    {
      id: '4',
      customerName: 'Ali Khan',
      rating: 5,
      comment: 'Perfect delivery service! Fast and reliable. Package was handled with care.',
      date: 'January 18, 2026',
      route: 'Sitra → Manama',
      serviceType: 'Mandoob',
    },
    {
      id: '5',
      customerName: 'Noora Saleh',
      rating: 5,
      comment: 'Wonderful driver! Very courteous and professional. Made the journey pleasant with great conversation.',
      date: 'January 18, 2026',
      route: 'Hamad Town → Riffa',
      serviceType: 'Private Driver',
    },
    {
      id: '6',
      customerName: 'Khalid Ahmed',
      rating: 4,
      comment: 'Good ride. Driver knew the best routes to avoid traffic. Appreciated the professionalism.',
      date: 'January 17, 2026',
      route: 'Budaiya → Manama',
      serviceType: 'Private Driver',
    },
    {
      id: '7',
      customerName: 'Maryam Ali',
      rating: 5,
      comment: 'Outstanding service! Helped me with my bags and made sure I was comfortable throughout the journey.',
      date: 'January 17, 2026',
      route: 'Seef → Airport',
      serviceType: 'Private Driver',
    },
    {
      id: '8',
      customerName: 'Ahmed Hassan',
      rating: 5,
      comment: 'Reliable and punctual. Great communication and friendly attitude. Highly recommend!',
      date: 'January 16, 2026',
      route: 'Jidhafs → Tubli',
      serviceType: 'OnTheWay',
    },
  ];

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="size-full flex bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Fixed Left Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-600 to-blue-600 text-white flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Driver System</h2>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <button 
            onClick={onNavigateToDashboard}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            onClick={onNavigateToMyOffers}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <FileText className="w-5 h-5" />
            My Offers
          </button>
          
          <button 
            onClick={onNavigateToIncomingRequests}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Inbox className="w-5 h-5" />
            Incoming Requests
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </button>
          
          <button 
            onClick={onNavigateToActiveDeliveries}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Truck className="w-5 h-5" />
            Active Deliveries
            <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
          </button>
          
          <button 
            onClick={onNavigateToEarnings}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <DollarSign className="w-5 h-5" />
            Earnings
          </button>
          
          <button className="w-full px-6 py-3 flex items-center gap-3 bg-white/10 border-l-4 border-white text-white font-semibold">
            <Star className="w-5 h-5" />
            Reviews
          </button>
          
          <button 
            onClick={onNavigateToProfile}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <User className="w-5 h-5" />
            Profile
          </button>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Driver</p>
              <p className="text-xs text-white/70">Ahmed Al-Khalifa</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customer Reviews</h1>
            <p className="text-slate-500 mt-1">See what customers are saying about your service</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-gray-800">{averageRating.toFixed(1)}</p>
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">5-Star Reviews</p>
              <p className="text-3xl font-bold text-gray-800">{fiveStarCount}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-800">{reviews.length}</p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {review.customerName}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{review.serviceType}</span>
                      </div>
                      <p className="text-sm text-gray-500">{review.route}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{review.date}</span>
                  </div>
                </div>

                <div className="pl-16">
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
