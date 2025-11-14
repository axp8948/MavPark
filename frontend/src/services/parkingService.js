import config from '../conf/config';

/**
 * Parking Service - Handles all parking-related API calls
 */

// Mock data fallback (remove when backend is ready)
const mockData = {
  stats: {
    available: 24,
    occupied: 16,
    total: 40,
  },
};

/**
 * Fetch parking statistics (available, occupied, total spots)
 */
export const getParkingStats = async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.parkingStats}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch parking stats');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available, using mock data:', error.message);
    // Return mock data if backend is not available
    return mockData.stats;
  }
};

/**
 * Fetch all parking spots with their status
 */
export const getParkingSpots = async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.parkingSpots}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch parking spots');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available:', error.message);
    return [];
  }
};

/**
 * Fetch parking spots for a specific lot by ID
 */
export const getParkingSpotsByLot = async (lotId) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.parkingSpots}?lotId=${lotId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch parking spots');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available, using mock data:', error.message);
    // Return mock data - 12 spots
    return [
      { id: 1, number: 'A1', status: 'available' },
      { id: 2, number: 'A2', status: 'occupied' },
      { id: 3, number: 'A3', status: 'unknown' },
      { id: 4, number: 'A4', status: 'available' },
      { id: 5, number: 'A5', status: 'occupied' },
      { id: 6, number: 'A6', status: 'available' },
      { id: 7, number: 'B1', status: 'available' },
      { id: 8, number: 'B2', status: 'unknown' },
      { id: 9, number: 'B3', status: 'occupied' },
      { id: 10, number: 'B4', status: 'available' },
      { id: 11, number: 'B5', status: 'unknown' },
      { id: 12, number: 'B6', status: 'occupied' },
    ];
  }
};

/**
 * Fetch all parking lots
 */
export const getParkingLots = async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.parkingLots || '/parking-lots'}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch parking lots');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available, using mock data:', error.message);
    // Return mock data
    return [
      {
        id: 1,
        name: 'Lot 1',
        location: 'Maybank',
        totalSpots: 12,
        availableSpots: 5,
      },
    ];
  }
};

/**
 * Update parking spot status (for future use)
 */
export const updateSpotStatus = async (spotId, status) => {
  try {
    const response = await fetch(
      `${config.apiBaseUrl}${config.endpoints.parkingSpots}/${spotId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update spot status');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating spot status:', error);
    throw error;
  }
};

/**
 * Get current parking status from Spring backend
 * Endpoint: GET /api/parking/status
 * 
 * Returns: ParkingUpdateRequest
 * {
 *   parkingLotName: string,
 *   totalSpots: number,
 *   freeSpots: number,
 *   occupiedSpots: number
 * }
 */
export const getParkingStatus = async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.parkingStatus}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch parking status');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching parking status:', error);
    throw error;
  }
};

/**
 * Update parking data (triggers WebSocket broadcast)
 * Endpoint: POST /api/parking/update
 * 
 * This will update the parking data on the backend AND
 * broadcast the update to all connected WebSocket clients
 * 
 * @param {Object} parkingData - Parking update data
 * @param {string} parkingData.parkingLotName - Name of the parking lot
 * @param {number} parkingData.totalSpots - Total parking spots
 * @param {number} parkingData.freeSpots - Available spots
 * @param {number} parkingData.occupiedSpots - Occupied spots
 */
export const updateParkingData = async (parkingData) => {
  try {
    const response = await fetch(
      `${config.apiBaseUrl}${config.endpoints.parkingUpdate}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parkingData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update parking data');
    }
    
    const result = await response.text();
    console.log('Parking data updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating parking data:', error);
    throw error;
  }
};

