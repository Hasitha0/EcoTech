import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import RequestPickupForm from '../components/RequestPickupForm';
import { useAuth } from '../context/AuthContext';
import { MagicCard } from '../components/ui/magic-card';
import { BorderBeam } from '../components/ui/border-beam';
import { TextReveal } from '../components/ui/text-reveal';
import { AnimatedShinyText } from '../components/ui/animated-shiny-text';
import { ShineEffect } from '../components/ui/shine-effect';
import { WarpBackground } from '../components/ui/warp-background';
import { displayAuthConfiguration, validateAuthConfig } from '../utils/supabase-auth-config';


// How It Works Steps Data
const steps = [
  {
    id: 1,
    title: 'Find Recycling Centers',
    description: 'Locate nearby recycling centers on our interactive map. Filter by the type of materials you need to recycle.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="M11 11h.01" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Schedule Pickup',
    description: 'Request a convenient pickup time for your recyclables directly from your doorstep.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Earn Rewards',
    description: 'Get points for every recycling session that can be redeemed for discounts and eco-friendly products.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Track Impact',
    description: 'Monitor your environmental impact with detailed analytics showing how much waste you have diverted from landfills.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

// Features Data
const features = [
  {
    id: 1,
    title: 'Environmental Impact Tracking',
    description: 'Visualize your direct contribution to environmental conservation with real-time metrics and achievements.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    bgColorDark: 'from-emerald-900/90 to-emerald-700/80',
    bgColorLight: 'from-emerald-200/90 to-emerald-300/80',
  },
  {
    id: 2,
    title: 'Rewards Ecosystem',
    description: 'Earn points, discounts, and exclusive offers from eco-friendly partners when you recycle regularly.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    bgColorDark: 'from-teal-900/90 to-cyan-800/80',
    bgColorLight: 'from-teal-200/90 to-cyan-300/80',
  },
  {
    id: 3,
    title: 'Community Engagement',
    description: 'Connect with like-minded individuals and participate in local environmental initiatives and clean-up events.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    bgColorDark: 'from-emerald-900/90 to-teal-800/80',
    bgColorLight: 'from-emerald-200/90 to-teal-300/80',
  },
  {
    id: 4,
    title: 'Educational Resources',
    description: 'Access guides, tutorials, and expert insights on sustainable living practices and proper recycling methods.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    bgColorDark: 'from-teal-900/90 to-emerald-800/80',
    bgColorLight: 'from-teal-200/90 to-emerald-300/80',
  },
  {
    id: 5,
    title: 'Seamless Scheduling',
    description: 'Book recycling pickups with a few taps, receive reminders, and manage your recycling calendar effortlessly.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
    bgColorDark: 'from-emerald-900/90 to-cyan-800/80',
    bgColorLight: 'from-emerald-200/90 to-cyan-300/80',
  },
];

// Testimonials Data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Community Member',
    image: 'https://i.pravatar.cc/150?img=1',
    content: 'EcoTech has transformed how I approach recycling. The rewards system makes it fun and engaging, and I love seeing my environmental impact grow!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Business Owner',
    image: 'https://i.pravatar.cc/150?img=2',
    content: 'As a business owner, partnering with EcoTech has been incredible. Their platform has helped us implement effective recycling programs and engage our customers.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Environmental Activist',
    image: 'https://i.pravatar.cc/150?img=3',
    content: 'The educational resources and community features are outstanding. EcoTech is creating real change by making recycling accessible and rewarding.',
    rating: 5,
  },
];

const Home = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Debug logging
  React.useEffect(() => {
    console.log('Home page - Auth state:', {
      loading,
      isAuthenticated,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      } : null
    });
  }, [loading, isAuthenticated, user]);
  
  // Show pickup form only for authenticated public users
  const showPickupForm = isAuthenticated && user?.role === 'PUBLIC';

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Premium Star Rating Component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-6 h-6 transition-all duration-500 ${
              index < rating 
                ? 'text-yellow-400 drop-shadow-lg' 
                : 'text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  useEffect(() => {
    // In development or localhost, display auth configuration
    if (window.location.hostname === 'localhost' || process.env.NODE_ENV === 'development') {
      validateAuthConfig();
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Hero />
      
      {/* Premium How It Works Section */}
      <section className="relative py-24 bg-black overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/60 to-black"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-radial from-emerald-950/20 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="relative inline-block mb-6">
              <TextReveal className="text-5xl font-bold text-white tracking-tight">
                How It Works
              </TextReveal>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full"></div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
              Our simple process makes recycling easier than ever before, helping you contribute to a more sustainable future with premium convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step, index) => (
              <BorderBeam key={step.id} className="h-full" duration={3 + index * 0.5}>
                <MagicCard className="group relative p-8 rounded-2xl h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-400/20">
                  <div className="flex flex-col items-center text-center h-full relative z-10">
                    {/* Premium icon container */}
                    <div className="relative mb-8">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600/25 to-teal-600/25 backdrop-blur-sm border border-emerald-300/40 group-hover:scale-110 transition-all duration-500">
                        <div className="text-emerald-300 group-hover:text-emerald-200 transition-colors duration-500">
                          {step.icon}
                        </div>
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-emerald-300/25 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-200 transition-colors duration-500">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-6 flex-grow">
                      {step.description}
                    </p>
                    
                    {/* Premium step number */}
                    <div className="relative">
                      <div className="flex items-center justify-center rounded-full w-12 h-12 font-bold text-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40 group-hover:scale-110 transition-all duration-500">
                        {step.id}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                    </div>
                  </div>

                  {/* Premium background effects */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="relative overflow-hidden py-28 bg-black">
        <WarpBackground className="opacity-30" />
        
        {/* Premium background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/40 to-black"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-emerald-500/12 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-teal-500/8 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="relative inline-block mb-8">
              <TextReveal>
                <AnimatedShinyText 
                  className="text-6xl font-bold text-white tracking-tight"
                  animationType="gradient"
                >
                  Features & Benefits
                </AnimatedShinyText>
              </TextReveal>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full"></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="mx-auto max-w-4xl text-xl text-gray-300 leading-relaxed">
              Our platform offers innovative tools and rewards to make recycling more 
              accessible, enjoyable, and impactful for everyone in the modern world.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <BorderBeam key={feature.id} className="h-full" duration={3 + index * 0.3}>
                <MagicCard className="h-full group">
                  <ShineEffect>
                    <div className="relative h-full flex flex-col rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 bg-gray-900/50 border border-gray-700/50 hover:border-emerald-400/50 overflow-hidden hover:shadow-2xl hover:shadow-emerald-400/20">
                      {/* Premium gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        {/* Premium icon container */}
                        <div className="relative mb-6">
                          <div className="rounded-2xl p-4 w-20 h-20 flex items-center justify-center backdrop-blur-sm border border-emerald-300/40 bg-gradient-to-br from-emerald-600/25 to-teal-600/25 group-hover:scale-110 transition-all duration-500">
                            <div className="text-emerald-300 group-hover:text-emerald-200 transition-colors duration-500">
                              {feature.icon}
                            </div>
                          </div>
                          {/* Icon glow effect */}
                          <div className="absolute inset-0 rounded-2xl bg-emerald-300/25 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        <TextReveal>
                          <h3 className="mb-6 text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors duration-500">
                            {feature.title}
                          </h3>
                        </TextReveal>
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {feature.description}
                        </p>

                        {/* Premium accent line */}
                        <div className="mt-6 h-[2px] w-16 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full group-hover:w-24 transition-all duration-500"></div>
                      </div>

                                             {/* Premium floating particles */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-300/70 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-6 left-6 w-1 h-1 bg-teal-300/70 rounded-full animate-pulse delay-1000"></div>
                    </div>
                  </ShineEffect>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>

      {showPickupForm && (
        <div id="pickup-form-section">
          <RequestPickupForm />
        </div>
      )}

      {/* Premium Testimonials Section */}
      <section className="relative py-28 bg-black overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-teal-500/12 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-radial from-emerald-500/12 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="relative inline-block mb-8">
              <TextReveal>
                <AnimatedShinyText className="text-5xl font-bold text-white tracking-tight">
                  What Our Users Say
                </AnimatedShinyText>
              </TextReveal>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full"></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
              Join thousands of satisfied users who are making a difference with
              EcoTech's innovative recycling platform and premium experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <BorderBeam key={testimonial.id} className="h-full" duration={3 + index * 0.4}>
                <MagicCard className="group relative p-8 rounded-2xl h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-400/20">
                  <div className="flex flex-col h-full relative z-10">
                    {/* Premium user info */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-300/40 group-hover:ring-emerald-300/60 transition-all duration-500"
                        />
                        {/* Avatar glow effect */}
                        <div className="absolute inset-0 rounded-full bg-emerald-300/25 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-200 transition-colors duration-500">
                          {testimonial.name}
                        </h3>
                        <p className="text-gray-400 text-lg">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Premium star rating */}
                    <div className="mb-6">
                      <StarRating rating={testimonial.rating} />
                    </div>

                    {/* Premium quote */}
                    <blockquote className="flex-grow">
                      <div className="relative">
                        {/* Quote icon */}
                        <div className="absolute -top-2 -left-2 text-emerald-300/40 text-4xl font-serif">"</div>
                        <p className="text-gray-300 italic text-lg leading-relaxed pl-6">
                          {testimonial.content}
                        </p>
                        <div className="absolute -bottom-2 -right-2 text-emerald-300/40 text-4xl font-serif rotate-180">"</div>
                      </div>
                    </blockquote>

                    {/* Premium accent line */}
                    <div className="mt-6 h-[2px] w-12 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full group-hover:w-20 transition-all duration-500"></div>
                  </div>

                  {/* Premium background effects */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/8 to-teal-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Premium floating particles */}
                  <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-emerald-300/70 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 left-8 w-1 h-1 bg-teal-300/70 rounded-full animate-pulse delay-700"></div>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 