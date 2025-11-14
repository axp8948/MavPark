// API Configuration
const config = {
  // Backend API base URL - update this when your backend is running
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // API endpoints
  endpoints: {
    parkingStats: '/parking/stats',
    parkingSpots: '/parking/spots',
  },
};

export default config;

