// Extended mock data for recycling centers
export const recyclingCenters = [
  {
    id: 1,
    name: "EcoTech Recycling Center",
    address: "123 Green Street, Seattle, WA 98101",
    coordinates: [47.6062, -122.3321],
    phone: "(206) 555-0123",
    email: "contact@ecotech.com",
    hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
    materials: ["Electronics", "Batteries", "Computers", "Mobile Phones"],
    rating: 4.8,
    reviews: 124,
    status: "active"
  },
  {
    id: 2,
    name: "Green Valley Electronics",
    address: "456 Eco Drive, Portland, OR 97201",
    coordinates: [45.5152, -122.6784],
    phone: "(503) 555-0456",
    email: "info@greenvalley.com",
    hours: "Mon-Sat: 8AM-7PM",
    materials: ["Electronics", "Computers", "Printers", "TVs"],
    rating: 4.6,
    reviews: 89,
    status: "active"
  },
  {
    id: 3,
    name: "Pacific Northwest Recycling",
    address: "789 Recycle Road, Vancouver, WA 98660",
    coordinates: [45.6387, -122.6615],
    phone: "(360) 555-0789",
    email: "contact@pnwrecycling.com",
    hours: "Tue-Sat: 9AM-5PM",
    materials: ["Electronics", "Batteries", "Appliances", "Mobile Phones"],
    rating: 4.7,
    reviews: 156,
    status: "active"
  },
  {
    id: 4,
    name: "Tacoma Tech Disposal",
    address: "321 Tech Avenue, Tacoma, WA 98402",
    coordinates: [47.2529, -122.4443],
    phone: "(253) 555-0321",
    email: "service@tacomatech.com",
    hours: "Mon-Fri: 10AM-6PM",
    materials: ["Computers", "Mobile Phones", "Printers"],
    rating: 4.5,
    reviews: 67,
    status: "active"
  },
  {
    id: 5,
    name: "Bellevue E-Waste Solutions",
    address: "654 Innovation Blvd, Bellevue, WA 98004",
    coordinates: [47.6101, -122.2015],
    phone: "(425) 555-0654",
    email: "hello@bellevueewaste.com",
    hours: "Mon-Fri: 9AM-5PM, Sat: 10AM-3PM",
    materials: ["Electronics", "Batteries", "Computers", "TVs", "Appliances"],
    rating: 4.9,
    reviews: 203,
    status: "active"
  },
  // Example of a pending approval center (submitted via form)
  {
    id: 6,
    name: "Community Green Center",
    address: "987 Community Way, Renton, WA 98055",
    coordinates: [47.4829, -122.2171],
    phone: "(425) 555-0987",
    email: "info@communitygreen.org",
    hours: "Mon-Fri: 8AM-4PM",
    materials: ["Electronics", "Batteries"],
    rating: 0,
    reviews: 0,
    status: "pending_approval",
    createdAt: "2024-12-12T10:30:00.000Z"
  }
];

// Processing statistics for centers
export const centerStats = [
  {
    centerId: 1,
    month: "2024-01",
    totalProcessed: 12500, // kg
    itemsProcessed: 1250,
    recyclingRate: 95,
    energySaved: 8500, // kWh
    co2Reduced: 4200, // kg
    materialsBreakdown: {
      electronics: 7500,
      batteries: 2000,
      computers: 2500,
      phones: 500
    }
  },
  {
    centerId: 2,
    month: "2024-01",
    totalProcessed: 18750,
    itemsProcessed: 1875,
    recyclingRate: 92,
    energySaved: 12800,
    co2Reduced: 6300,
    materialsBreakdown: {
      electronics: 9000,
      appliances: 6000,
      computers: 3000,
      printers: 750
    }
  },
  {
    centerId: 3,
    month: "2024-01",
    totalProcessed: 9000,
    itemsProcessed: 900,
    recyclingRate: 98,
    energySaved: 6200,
    co2Reduced: 3100,
    materialsBreakdown: {
      electronics: 4500,
      batteries: 1500,
      computers: 2000,
      tvs: 1000
    }
  }
];

// Center capacity and availability
export const centerCapacity = [
  {
    centerId: 1,
    date: "2024-01-15",
    currentLoad: 350, // kg
    maxCapacity: 500,
    availableSlots: 3,
    nextAvailable: "2024-01-16T09:00:00.000Z"
  },
  {
    centerId: 2,
    date: "2024-01-15",
    currentLoad: 600,
    maxCapacity: 750,
    availableSlots: 2,
    nextAvailable: "2024-01-15T14:00:00.000Z"
  },
  {
    centerId: 3,
    date: "2024-01-15",
    currentLoad: 180,
    maxCapacity: 300,
    availableSlots: 5,
    nextAvailable: "2024-01-15T10:00:00.000Z"
  }
];

// Material types accepted by centers
export const materialTypes = [
  {
    id: 1,
    name: "Electronics",
    description: "General electronic devices",
    examples: ["Radios", "Speakers", "Gaming consoles"],
    processingFee: 0,
    recyclingRate: 85
  },
  {
    id: 2,
    name: "Batteries",
    description: "All types of batteries",
    examples: ["AA/AAA", "Lithium-ion", "Car batteries"],
    processingFee: 0,
    recyclingRate: 95
  },
  {
    id: 3,
    name: "Computers",
    description: "Desktop and laptop computers",
    examples: ["Desktops", "Laptops", "Servers"],
    processingFee: 0,
    recyclingRate: 90
  },
  {
    id: 4,
    name: "Mobile Phones",
    description: "Smartphones and basic phones",
    examples: ["Smartphones", "Feature phones", "Tablets"],
    processingFee: 0,
    recyclingRate: 92
  },
  {
    id: 5,
    name: "Appliances",
    description: "Large and small appliances",
    examples: ["Refrigerators", "Microwaves", "Washing machines"],
    processingFee: 25, // for large appliances
    recyclingRate: 88
  },
  {
    id: 6,
    name: "Printers",
    description: "All types of printers",
    examples: ["Inkjet", "Laser", "3D printers"],
    processingFee: 0,
    recyclingRate: 87
  },
  {
    id: 7,
    name: "TVs",
    description: "Television sets and monitors",
    examples: ["LCD", "LED", "CRT", "Monitors"],
    processingFee: 15,
    recyclingRate: 89
  },
  {
    id: 8,
    name: "Cables/Chargers",
    description: "Cables, chargers, and accessories",
    examples: ["USB cables", "Power adapters", "HDMI cables"],
    processingFee: 0,
    recyclingRate: 95
  }
];

// Center reviews and ratings
export const centerReviews = [
  {
    id: 1,
    centerId: 1,
    userId: 1,
    rating: 5,
    comment: "Excellent service! Very professional and efficient pickup.",
    date: "2024-01-08T14:30:00.000Z",
    verified: true
  },
  {
    id: 2,
    centerId: 1,
    userId: 2,
    rating: 4,
    comment: "Good experience overall. Staff was helpful and knowledgeable.",
    date: "2024-01-05T10:15:00.000Z",
    verified: true
  },
  {
    id: 3,
    centerId: 2,
    userId: 3,
    rating: 5,
    comment: "Great facility with modern equipment. Highly recommend!",
    date: "2024-01-07T16:45:00.000Z",
    verified: true
  },
  {
    id: 4,
    centerId: 3,
    userId: 1,
    rating: 5,
    comment: "Fast processing and excellent customer service. Will use again.",
    date: "2024-01-06T11:20:00.000Z",
    verified: true
  }
];

// Center operating schedules
export const centerSchedules = [
  {
    centerId: 1,
    dayOfWeek: 1, // Monday
    openTime: "09:00",
    closeTime: "18:00",
    isOpen: true
  },
  {
    centerId: 1,
    dayOfWeek: 6, // Saturday
    openTime: "10:00",
    closeTime: "16:00",
    isOpen: true
  },
  {
    centerId: 1,
    dayOfWeek: 0, // Sunday
    openTime: null,
    closeTime: null,
    isOpen: false
  }
  // Add more schedule entries as needed
]; 