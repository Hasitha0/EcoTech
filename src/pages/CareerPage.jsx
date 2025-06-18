import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedGradientText } from '../components/ui/animated-gradient-text';
import { MagicCard } from '../components/ui/magic-card';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { Meteors } from '../components/ui/meteors';

const CareerPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    vehicleType: '',
    licenseNumber: '',
    coverageArea: '',
    availability: '',
    preferredSchedule: '',
    additionalInfo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement actual registration logic
      console.log('Form submitted:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <Meteors number={20} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedGradientText>Join Our Waste Collection Team</AnimatedGradientText>
          <p className="mt-4 text-xl text-gray-300">
            Make a difference in environmental sustainability while building a rewarding career
          </p>
        </div>

        {/* Main Form */}
        <MagicCard className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-300">
                    Years of Experience
                  </label>
                  <select
                    name="experience"
                    id="experience"
                    required
                    value={formData.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Vehicle Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-300">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    id="vehicleType"
                    required
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="pickup">Pickup</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-300">
                    Driver's License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    id="licenseNumber"
                    required
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Work Preferences */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Work Preferences</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="coverageArea" className="block text-sm font-medium text-gray-300">
                    Preferred Coverage Area
                  </label>
                  <input
                    type="text"
                    name="coverageArea"
                    id="coverageArea"
                    required
                    value={formData.coverageArea}
                    onChange={handleChange}
                    placeholder="e.g., North Seattle, Downtown"
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-300">
                    Availability
                  </label>
                  <select
                    name="availability"
                    id="availability"
                    required
                    value={formData.availability}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  >
                    <option value="">Select availability</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-300">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    id="additionalInfo"
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Tell us about your relevant experience and why you'd be a great fit..."
                    className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="w-full justify-center"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </ShimmerButton>
            </div>
          </form>
        </MagicCard>
      </div>
    </div>
  );
};

export default CareerPage; 