import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AnimatedGradientText } from '../components/ui/animated-gradient-text';
import { MagicCard } from '../components/ui/magic-card';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { Meteors } from '../components/ui/meteors';
import { mockApi } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Ensure Leaflet is properly initialized
if (typeof window !== 'undefined') {
  // Additional Leaflet setup for browser environment
  L.Icon.Default.imagePath = '/';
}

const FindRecyclingCentersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    centerName: '',
    address: '',
    operatingHours: '',
    phone: '',
    email: '',
    acceptedMaterials: [],
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);

  const materials = ["Electronics", "Batteries", "Computers", "Mobile Phones", "Appliances", "Printers", "TVs"];

  // Load recycling centers on component mount
  useEffect(() => {
    const loadCenters = async () => {
      try {
        setLoading(true);
        const response = await mockApi.getRecyclingCenters();
        setCenters(response.centers);
        setFilteredCenters(response.centers);
      } catch (err) {
        setError('Failed to load recycling centers');
        console.error('Error loading centers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  // Filter centers based on search and materials
  useEffect(() => {
    const filtered = centers.filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          center.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMaterials = selectedMaterials.length === 0 ||
                              selectedMaterials.every(material => center.materials.includes(material));
      
      return matchesSearch && matchesMaterials;
    });
    
    setFilteredCenters(filtered);
  }, [searchQuery, selectedMaterials, centers]);

  // Set map as loaded after a short delay to ensure proper rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleMaterialToggle = (material) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const handleFormMaterialToggle = (material) => {
    setFormData(prev => ({
      ...prev,
      acceptedMaterials: prev.acceptedMaterials.includes(material)
        ? prev.acceptedMaterials.filter(m => m !== material)
        : [...prev.acceptedMaterials, material]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.centerName || !formData.address || !formData.operatingHours || 
          !formData.phone || !formData.email || formData.acceptedMaterials.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      // Submit to mock API
      const response = await mockApi.addRecyclingCenter({
        name: formData.centerName,
        address: formData.address,
        hours: formData.operatingHours,
        phone: formData.phone,
        email: formData.email,
        materials: formData.acceptedMaterials,
        additionalInfo: formData.additionalInfo
      });

      console.log('Center submitted:', response.center);
      setSubmitSuccess(true);
      
      // Add the new center to the list immediately (it will show as pending)
      setCenters(prev => [...prev, response.center]);
      setFilteredCenters(prev => [...prev, response.center]);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          centerName: '',
          address: '',
          operatingHours: '',
          phone: '',
          email: '',
          acceptedMaterials: [],
          additionalInfo: ''
        });
        setIsFormOpen(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error.message);
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading recycling centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <Meteors number={20} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedGradientText>Find Recycling Centers</AnimatedGradientText>
          
          
          <p className="mt-4 text-xl text-gray-300">
            Locate certified recycling centers near you for responsible e-waste disposal
          </p>
          {/* Add Center Button - Hidden for PUBLIC users */}
          {!(isAuthenticated && user?.role === 'PUBLIC') && (
            <div className="mt-6 mb-4">
              <ShimmerButton
                onClick={() => setIsFormOpen(true)}
                className="px-8 py-3"
              >
                Add Your Recycling Center
              </ShimmerButton>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Search and Filter Section */}
        <MagicCard className="mb-8">
          <div className="space-y-6">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-300">
                Search by name or location
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recycling centers..."
                className="mt-1 block w-full rounded-md bg-gray-800/50 border border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2"
              />
            </div>

            {/* Material Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by accepted materials
              </label>
              <div className="flex flex-wrap gap-2">
                {materials.map(material => (
                  <button
                    key={material}
                    onClick={() => handleMaterialToggle(material)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedMaterials.includes(material)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </MagicCard>

        {/* Add Center Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <MagicCard className="bg-slate-900/95 backdrop-blur-lg border border-white/10 p-8">
                {/* Close button */}
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Form Header */}
                <div className="text-center mb-8">
                  <AnimatedGradientText className="text-3xl font-bold mb-4">
                    Add Your Recycling Center
                  </AnimatedGradientText>
                  <p className="text-slate-300">
                    Join our network of certified recycling centers
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Successfully Submitted!</h3>
                    <p className="text-gray-300 mb-4">
                      Your recycling center has been submitted for review. We'll contact you soon.
                    </p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-sm text-emerald-300">
                      <p className="font-semibold mb-2">📍 Location Processing</p>
                      <p>
                        We've automatically determined your center's location based on the address provided. 
                        Once approved, your center will appear on the map for users to find.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Center Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Center Name *
                      </label>
                      <input
                        type="text"
                        name="centerName"
                        required
                        value={formData.centerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter your center's name"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter your center's full address (include city and state)"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        💡 Include city name for accurate map placement (e.g., "123 Main St, Seattle, WA")
                      </p>
                    </div>

                    {/* Operating Hours */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Operating Hours *
                      </label>
                      <input
                        type="text"
                        name="operatingHours"
                        required
                        value={formData.operatingHours}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* Accepted Materials */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Accepted Materials *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {materials.map(material => (
                          <button
                            type="button"
                            key={material}
                            onClick={() => handleFormMaterialToggle(material)}
                            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              formData.acceptedMaterials.includes(material)
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                            }`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Additional Information (Optional)
                      </label>
                      <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        placeholder="Any additional information about your center..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <ShimmerButton
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Center'}
                      </ShimmerButton>
                    </div>
                  </form>
                )}
              </MagicCard>
            </div>
          </div>
        )}

        {/* Map and Centers List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Centers List */}
          <div className="lg:col-span-1 space-y-4">
            {filteredCenters.length === 0 ? (
              <MagicCard className="text-center py-8">
                <p className="text-gray-300">No recycling centers found matching your criteria.</p>
              </MagicCard>
            ) : (
              filteredCenters.map(center => (
              <MagicCard
                key={center.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    selectedCenter?.id === center.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => setSelectedCenter(center)}
              >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{center.name}</h3>
                    {center.status === 'pending_approval' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Pending Approval
                      </span>
                    )}
                  </div>
                <p className="text-gray-300 text-sm mb-2">{center.address}</p>
                <p className="text-gray-400 text-sm mb-2">{center.hours}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {center.materials.map(material => (
                    <span
                      key={material}
                      className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                    >
                      {material}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <p>{center.phone}</p>
                  <p>{center.email}</p>
                    {center.rating && (
                      <p className="text-emerald-400">
                        ⭐ {center.rating}/5 ({center.reviews} reviews)
                      </p>
                    )}
                </div>
              </MagicCard>
              ))
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <MagicCard className="h-[600px] overflow-hidden">
              <div className="h-full w-full relative map-container">
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-lg z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                      <p className="text-slate-300">Loading map...</p>
                    </div>
                  </div>
                )}
              <MapContainer
                center={[47.6062, -122.3321]}
                zoom={11}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                  className="z-0"
                  ref={mapRef}
                  whenReady={(map) => {
                    setMapLoaded(true);
                    // Force map to invalidate size after container is ready
                    setTimeout(() => {
                      map.invalidateSize();
                    }, 100);
                  }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredCenters.map(center => (
                  <Marker
                    key={center.id}
                    position={center.coordinates}
                    eventHandlers={{
                      click: () => setSelectedCenter(center),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{center.name}</h3>
                          {center.status === 'pending_approval' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{center.address}</p>
                        <p className="text-sm">{center.hours}</p>
                        <p className="text-sm">{center.phone}</p>
                        {center.rating && (
                          <p className="text-sm">⭐ {center.rating}/5</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindRecyclingCentersPage; 