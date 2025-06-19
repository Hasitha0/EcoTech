import React from 'react';

const SimpleConfirmTest = () => {
  console.log('🟢 SimpleConfirmTest component loaded!');
  
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">
          🟢 SIMPLE CONFIRM TEST WORKS! 🟢
        </h1>
        <p className="text-gray-700 mb-4">
          If you can see this, the routing to /confirm is working!
        </p>
        <p className="text-gray-700 mb-4">
          Current URL: {window.location.href}
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default SimpleConfirmTest; 