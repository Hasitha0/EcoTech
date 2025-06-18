// Mock data for collection requests
export const collectionRequests = [
  {
    id: 1,
    userId: 1, // John Public
    status: 'pending',
    itemTypes: ['Computers/Laptops', 'Mobile Phones', 'Batteries'],
    quantities: '2 old laptops, 3 mobile phones, 5 batteries',
    preferredDate: '2024-01-15',
    preferredTime: '9:00 AM - 12:00 PM',
    address: '123 Main St, Seattle, WA 98101',
    contactPhone: '+1-206-555-0123',
    specialInstructions: 'Please call when arriving, apartment 2B',
    collectorId: null,
    recyclingCenterId: null,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
    estimatedWeight: '15 kg',
    priority: 'medium'
  },
  {
    id: 2,
    userId: 1,
    status: 'assigned',
    itemTypes: ['Printers', 'Monitors/TVs'],
    quantities: '1 old printer, 2 CRT monitors',
    preferredDate: '2024-01-12',
    preferredTime: '12:00 PM - 3:00 PM',
    address: '456 Oak Ave, Bellevue, WA 98004',
    contactPhone: '+1-425-555-0456',
    specialInstructions: 'Items are in garage, side entrance',
    collectorId: 2, // Sarah Collector
    recyclingCenterId: 1,
    createdAt: '2024-01-08T14:30:00.000Z',
    updatedAt: '2024-01-09T09:15:00.000Z',
    estimatedWeight: '25 kg',
    priority: 'high',
    scheduledDate: '2024-01-12',
    scheduledTime: '12:00 PM - 3:00 PM'
  },
  {
    id: 3,
    userId: 1,
    status: 'in_progress',
    itemTypes: ['Small Appliances', 'Cables/Chargers'],
    quantities: '1 microwave, 1 toaster, box of cables',
    preferredDate: '2024-01-11',
    preferredTime: '3:00 PM - 6:00 PM',
    address: '789 Pine St, Redmond, WA 98052',
    contactPhone: '+1-425-555-0789',
    specialInstructions: 'Ring doorbell twice',
    collectorId: 2,
    recyclingCenterId: 2,
    createdAt: '2024-01-07T16:45:00.000Z',
    updatedAt: '2024-01-11T15:30:00.000Z',
    estimatedWeight: '18 kg',
    priority: 'medium',
    scheduledDate: '2024-01-11',
    scheduledTime: '3:00 PM - 6:00 PM',
    collectorNotes: 'On route to pickup location'
  },
  {
    id: 4,
    userId: 1,
    status: 'completed',
    itemTypes: ['Tablets', 'Other Electronics'],
    quantities: '2 old tablets, 1 gaming console',
    preferredDate: '2024-01-05',
    preferredTime: '9:00 AM - 12:00 PM',
    address: '321 Elm St, Seattle, WA 98115',
    contactPhone: '+1-206-555-0321',
    specialInstructions: 'Leave with building manager if not home',
    collectorId: 2,
    recyclingCenterId: 1,
    createdAt: '2024-01-03T11:20:00.000Z',
    updatedAt: '2024-01-05T14:45:00.000Z',
    completedAt: '2024-01-05T14:45:00.000Z',
    estimatedWeight: '8 kg',
    actualWeight: '7.5 kg',
    priority: 'low',
    scheduledDate: '2024-01-05',
    scheduledTime: '9:00 AM - 12:00 PM',
    collectorNotes: 'Pickup completed successfully',
    processingStatus: 'processed',
    recyclingNotes: 'All items processed and recycled'
  }
];

// Mock data for collector tasks (from collector perspective)
export const collectorTasks = [
  {
    id: 1,
    requestId: 2,
    collectorId: 2,
    status: 'assigned',
    priority: 'high',
    customerName: 'John Public',
    customerPhone: '+1-425-555-0456',
    address: '456 Oak Ave, Bellevue, WA 98004',
    items: ['Printers', 'Monitors/TVs'],
    estimatedWeight: '25 kg',
    scheduledDate: '2024-01-12',
    scheduledTime: '12:00 PM - 3:00 PM',
    specialInstructions: 'Items are in garage, side entrance',
    assignedAt: '2024-01-09T09:15:00.000Z'
  },
  {
    id: 2,
    requestId: 3,
    collectorId: 2,
    status: 'in_progress',
    priority: 'medium',
    customerName: 'John Public',
    customerPhone: '+1-425-555-0789',
    address: '789 Pine St, Redmond, WA 98052',
    items: ['Small Appliances', 'Cables/Chargers'],
    estimatedWeight: '18 kg',
    scheduledDate: '2024-01-11',
    scheduledTime: '3:00 PM - 6:00 PM',
    specialInstructions: 'Ring doorbell twice',
    assignedAt: '2024-01-10T08:30:00.000Z',
    startedAt: '2024-01-11T15:30:00.000Z'
  }
];

// Mock data for recycling center deliveries
export const deliveries = [
  {
    id: 1,
    requestId: 4,
    collectorId: 2,
    recyclingCenterId: 1,
    status: 'delivered',
    items: ['Tablets', 'Other Electronics'],
    estimatedWeight: '8 kg',
    actualWeight: '7.5 kg',
    deliveredAt: '2024-01-05T16:00:00.000Z',
    processedAt: '2024-01-05T18:30:00.000Z',
    processingNotes: 'All items successfully processed and recycled',
    collectorNotes: 'Items delivered in good condition'
  },
  {
    id: 2,
    requestId: 3,
    collectorId: 2,
    recyclingCenterId: 2,
    status: 'pending_delivery',
    items: ['Small Appliances', 'Cables/Chargers'],
    estimatedWeight: '18 kg',
    expectedDelivery: '2024-01-11T18:00:00.000Z'
  }
];

// Status options for requests
export const requestStatuses = [
  { value: 'pending', label: 'Pending Assignment', color: 'yellow' },
  { value: 'assigned', label: 'Assigned to Collector', color: 'blue' },
  { value: 'scheduled', label: 'Pickup Scheduled', color: 'purple' },
  { value: 'in_progress', label: 'Collection in Progress', color: 'orange' },
  { value: 'collected', label: 'Items Collected', color: 'teal' },
  { value: 'delivered', label: 'Delivered to Center', color: 'indigo' },
  { value: 'completed', label: 'Processing Complete', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'failed', label: 'Pickup Failed', color: 'red' }
];

// Item types for e-waste
export const itemTypes = [
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

// Time slots for pickup scheduling
export const timeSlots = [
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM',
  '3:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM'
];

// Priority levels
export const priorityLevels = [
  { value: 'low', label: 'Low Priority', color: 'gray' },
  { value: 'medium', label: 'Medium Priority', color: 'yellow' },
  { value: 'high', label: 'High Priority', color: 'red' },
  { value: 'urgent', label: 'Urgent', color: 'red' }
]; 