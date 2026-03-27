import {
  spotCoordinates as f12SpotCoordinates,
  lotCenter as f12LotCenter,
  totalSpots as f12TotalSpots,
  SPOT_ID_OFFSET as f12SpotIdOffset,
} from './spotCoordinates';

const lotConfigs = {
  1: {
    name: 'Lot A',
    code: 'F-12',
    location: 'Faculty/Staff',
    center: f12LotCenter,
    overlayBounds: {
      north: 32.733611,
      south: 32.732686,
      east: -97.111062,
      west: -97.112063,
    },
    overlayImage: '/f12-overlay.png',
    spotCoordinates: f12SpotCoordinates,
    totalSpots: f12TotalSpots,
    spotIdOffset: f12SpotIdOffset,
    zoom: 19,
  },
  2: {
    name: 'Lot B',
    code: 'F-10',
    location: 'Student',
    center: { lat: 32.727754, lng: -97.110486 },
    overlayBounds: {
      north: 32.728389,
      south: 32.727119,
      east: -97.109986,
      west: -97.110986,
    },
    overlayImage: '/f10-overlay.png',
    spotCoordinates: {},
    totalSpots: 0,
    spotIdOffset: 700,
    zoom: 19,
  },
};

export default lotConfigs;
