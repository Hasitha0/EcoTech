import React, { useState } from 'react';
import { MagicCard } from './ui/magic-card';
import { ShimmerButton } from './ui/shimmer-button';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { mockApi } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';

const RequestPickupForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    itemTypes: [],
    quantities: '',
    preferredDate: '',
    preferredTime: '',
    address: '',
    specialInstructions: '',
    contactPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const itemTypes = [
    'Computers/Laptops',
    'Mobile Phones',
    'Tablets',
    'Printers',
    'Monitors/TVs',
    'Batteries',
    'Cables/Chargers',
    'Small Appliances',
    'Other Electronics'
  ];

  const timeSlots = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemTypeToggle = (itemType) => {
    setFormData(prev => ({
      ...prev,
      itemTypes: prev.itemTypes.includes(itemType)
        ? prev.itemTypes.filter(item => item !== itemType)
        : [...prev.itemTypes, itemType]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.itemTypes.length === 0) {
      setError('Please select at least one item type');
      setLoading(false);
      return;
    }

    if (!formData.quantities || !formData.preferredDate || !formData.preferredTime || 
        !formData.address || !formData.contactPhone) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Submit to mock API
      const requestData = {
        userId: user?.id,
        itemTypes: formData.itemTypes,
        quantities: formData.quantities,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        address: formData.address,
        specialInstructions: formData.specialInstructions,
        contactPhone: formData.contactPhone
      };

      const response = await mockApi.createCollectionRequest(requestData);
      console.log('Pickup request submitted:', response.request);
      setSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000); // Give user time to see success message
      }
      
      // Reset form after successful submission
      setFormData({
        itemTypes: [],
        quantities: '',
        preferredDate: '',
        preferredTime: '',
        address: '',
        specialInstructions: '',
        contactPhone: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit pickup request. Please try again.');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <MagicCard className="text-center">
            <div className="py-12">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Request Submitted Successfully!
              </h2>
              <p className="text-gray-300 mb-6">
                Your e-waste pickup request has been submitted. We'll contact you within 24 hours to confirm the details and schedule your pickup.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Request ID: #{Date.now()}
              </p>
              <ShimmerButton onClick={() => setSuccess(false)}>
                Submit Another Request
              </ShimmerButton>
              </div>
            </div>
          </MagicCard>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <AnimatedGradientText>Schedule Your E-Waste Pickup</AnimatedGradientText>
          <p className="mt-4 text-xl text-gray-300">
            Ready to dispose of your electronic waste responsibly? Fill out the form below to schedule a pickup.
          </p>
        </div>

        <MagicCard>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Item Types Selection */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                What items do you need picked up? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {itemTypes.map(itemType => (
                  <button
                    type="button"
                    key={itemType}
                    onClick={() => handleItemTypeToggle(itemType)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.itemTypes.includes(itemType)
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                    }`}
                  >
                    {itemType}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantities */}
            <div>
              <label className="block text-lg font-medium text-white mb-2">
                Approximate quantities/description *
              </label>
              <textarea
                name="quantities"
                required
                value={formData.quantities}
                onChange={handleChange}
                rows={3}
                placeholder="e.g., 2 old laptops, 1 printer, 5 mobile phones..."
                className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-white mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  required
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-white mb-2">
                  Preferred Time Slot *
                </label>
                <select
                  name="preferredTime"
                  required
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-lg font-medium text-white mb-2">
                Pickup Address *
              </label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Enter your complete address including any special instructions for finding your location..."
                className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-lg font-medium text-white mb-2">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="Your phone number for pickup coordination"
                className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-lg font-medium text-white mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows={3}
                placeholder="Any special instructions for the pickup team (e.g., gate codes, parking instructions, etc.)"
                className="w-full rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
              />
            </div>

            <div className="text-center">
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="px-12 py-4 text-lg"
              >
                {loading ? 'Submitting Request...' : 'Schedule Pickup'}
              </ShimmerButton>
            </div>
          </form>
        </MagicCard>
      </div>
    </section>
  );
};

export default RequestPickupForm; 