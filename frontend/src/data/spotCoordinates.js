// Parking spot coordinates for MavPark
// Each spot ID maps to an array of {lat, lng} points forming a polygon
// Generated from GeoJSON center points - 87 spots total

// Helper to create a rectangle polygon from a center point
// Size adjusted for visibility on satellite view (~3m x 5m parking spot)
const createSpotPolygon = (centerLat, centerLng, halfWidth = 0.00005, halfHeight = 0.00003) => [
  { lat: centerLat - halfHeight, lng: centerLng - halfWidth },
  { lat: centerLat - halfHeight, lng: centerLng + halfWidth },
  { lat: centerLat + halfHeight, lng: centerLng + halfWidth },
  { lat: centerLat + halfHeight, lng: centerLng - halfWidth },
];

// Raw center points from GeoJSON (lng, lat format converted to lat, lng)
const spotCenters = [
  // Column 1 - Eastern column (spots 401-414)
  { id: "401", lat: 32.7335508154797, lng: -97.11199152166708 },
  { id: "402", lat: 32.7335237147943, lng: -97.11198773144226 },
  { id: "403", lat: 32.73349183162486, lng: -97.11198583632981 },
  { id: "404", lat: 32.73347110755846, lng: -97.11198583632981 },
  { id: "405", lat: 32.73343444189044, lng: -97.11198773144226 },
  { id: "406", lat: 32.733408332246285, lng: -97.11198268489025 },
  { id: "407", lat: 32.73338048054518, lng: -97.11198452431499 },
  { id: "408", lat: 32.73335108151913, lng: -97.1119882031655 },
  { id: "409", lat: 32.733321682482554, lng: -97.1119882031655 },
  { id: "410", lat: 32.733293830754405, lng: -97.11198084546497 },
  { id: "411", lat: 32.733265979018356, lng: -97.11199372144125 },
  { id: "412", lat: 32.733238127273594, lng: -97.11199188201599 },
  { id: "413", lat: 32.73321182283965, lng: -97.11198636374026 },
  { id: "414", lat: 32.7331793291163, lng: -97.11198636374026 },

  // Column 2 - Second column (spots 415-442)
  { id: "415", lat: 32.73351664433201, lng: -97.11186128282579 },
  { id: "416", lat: 32.7334841507198, lng: -97.1118576039753 },
  { id: "417", lat: 32.73344856246496, lng: -97.11185576455051 },
  { id: "418", lat: 32.73342844735788, lng: -97.1118576039753 },
  { id: "419", lat: 32.733399048346854, lng: -97.11186128282579 },
  { id: "420", lat: 32.73336655469177, lng: -97.11186312225102 },
  { id: "421", lat: 32.73334025029574, lng: -97.11186496167626 },
  { id: "422", lat: 32.73331239857416, lng: -97.11185944340053 },
  { id: "423", lat: 32.73327990488747, lng: -97.11186496167626 },
  { id: "424", lat: 32.73324741118894, lng: -97.11186496167626 },
  { id: "425", lat: 32.73322265407785, lng: -97.11186496167626 },
  { id: "426", lat: 32.733190160358475, lng: -97.11186496167626 },
  { id: "427", lat: 32.733163855910334, lng: -97.11186496167626 },
  { id: "428", lat: 32.73312981484857, lng: -97.11186312225102 },
  { id: "429", lat: 32.733103510382676, lng: -97.11186312225102 },
  { id: "430", lat: 32.73307101662064, lng: -97.11186496167626 },
  { id: "431", lat: 32.733048124100605, lng: -97.11186784270308 },
  { id: "432", lat: 32.73301801044384, lng: -97.11186926530652 },
  { id: "433", lat: 32.73298845617391, lng: -97.11186926530652 },
  { id: "434", lat: 32.732951768100605, lng: -97.11186684230736 },
  { id: "435", lat: 32.73292629026349, lng: -97.11186563080749 },
  { id: "436", lat: 32.73289673596264, lng: -97.11186441930822 },
  { id: "437", lat: 32.7328620860804, lng: -97.11186805380663 },
  { id: "438", lat: 32.73283660821767, lng: -97.11186563080749 },
  { id: "439", lat: 32.73280807300233, lng: -97.11186926530652 },
  { id: "440", lat: 32.73278157600858, lng: -97.11187047680579 },
  { id: "441", lat: 32.732749983428405, lng: -97.11187047680579 },
  { id: "442", lat: 32.73271737172176, lng: -97.11187289980494 },

  // Column 1 continued - Southern section (spots 443-447)
  { id: "443", lat: 32.732923232922204, lng: -97.11199041526149 },
  { id: "444", lat: 32.73288858305081, lng: -97.11199889575819 },
  { id: "445", lat: 32.732793805391026, lng: -97.11199526125979 },
  { id: "446", lat: 32.73284781847825, lng: -97.11199647275903 },
  { id: "447", lat: 32.73275813635345, lng: -97.11199768425892 },

  // Column 3 - Third column (spots 448-476)
  { id: "448", lat: 32.733515335809784, lng: -97.11180964409134 },
  { id: "449", lat: 32.733485781704246, lng: -97.11180479809366 },
  { id: "450", lat: 32.733449093835674, lng: -97.11180600959293 },
  { id: "451", lat: 32.73342361614068, lng: -97.1118072210928 },
  { id: "452", lat: 32.733396100221356, lng: -97.11180358659377 },
  { id: "453", lat: 32.733366546076795, lng: -97.11180358659377 },
  { id: "454", lat: 32.73334004924904, lng: -97.11180358659377 },
  { id: "455", lat: 32.73330641864872, lng: -97.11179995209537 },
  { id: "456", lat: 32.73327380714515, lng: -97.11179995209537 },
  { id: "457", lat: 32.73324731028981, lng: -97.11180479809366 },
  { id: "458", lat: 32.7332177560954, lng: -97.11180600959293 },
  { id: "459", lat: 32.73319329744466, lng: -97.1118072210928 },
  { id: "460", lat: 32.733152533012, lng: -97.11180358659377 },
  { id: "461", lat: 32.73312909345442, lng: -97.1118072210928 },
  { id: "462", lat: 32.73310055833278, lng: -97.1118072210928 },
  { id: "463", lat: 32.73307303616785, lng: -97.11180600180928 },
  { id: "464", lat: 32.73303940546681, lng: -97.11180842480844 },
  { id: "465", lat: 32.7330149467671, lng: -97.11180842480844 },
  { id: "466", lat: 32.73298233515689, lng: -97.11180479031003 },
  { id: "467", lat: 32.73295379998825, lng: -97.11180721330918 },
  { id: "468", lat: 32.732919150128225, lng: -97.11180721330918 },
  { id: "469", lat: 32.73289265316744, lng: -97.11180721330918 },
  { id: "470", lat: 32.73286207974128, lng: -97.11180842480844 },
  { id: "471", lat: 32.732835582763585, lng: -97.11180842480844 },
  { id: "472", lat: 32.73280359539791, lng: -97.11180787389715 },
  { id: "473", lat: 32.732773614258264, lng: -97.11181291101022 },
  { id: "474", lat: 32.732750159492056, lng: -97.11181550472665 },
  { id: "475", lat: 32.73272070466096, lng: -97.11181550472665 },

  // Column 1 - Additional spots (spots 476-479)
  { id: "476", lat: 32.732953264465536, lng: -97.11198992067185 },
  { id: "477", lat: 32.73305381282748, lng: -97.1119883158321 },
  { id: "478", lat: 32.73315614306854, lng: -97.11198831579675 },
  { id: "479", lat: 32.73358770897717, lng: -97.11199436032726 },

  // Column 4 - Western column (spots 480-487)
  { id: "480", lat: 32.732713162005865, lng: -97.1117028273823 },
  { id: "481", lat: 32.73274557742687, lng: -97.11170131621974 },
  { id: "482", lat: 32.73277545045201, lng: -97.11169602715098 },
  { id: "483", lat: 32.73280341667973, lng: -97.11169149366333 },
  { id: "484", lat: 32.732832654089265, lng: -97.11169376040695 },
  { id: "485", lat: 32.73285998470291, lng: -97.11168771575711 },
  { id: "486", lat: 32.732891128880794, lng: -97.11168922691968 },
  { id: "487", lat: 32.73291212888079, lng: -97.11168922691968 },
];

// Generate polygon coordinates for each spot
export const spotCoordinates = {};
spotCenters.forEach((spot) => {
  spotCoordinates[spot.id] = createSpotPolygon(spot.lat, spot.lng);
});

// Also export as a function for custom spot sizes
export const getSpotPolygon = (spotId, halfWidth = 0.00005, halfHeight = 0.00003) => {
  const spot = spotCenters.find((s) => s.id === spotId);
  if (!spot) return null;
  return createSpotPolygon(spot.lat, spot.lng, halfWidth, halfHeight);
};

// Lot center point (calculated from spot positions)
export const lotCenter = {
  lat: 32.7331,  // Center of all spots (avg of min/max lat)
  lng: -97.1118, // Center of all spots (avg of min/max lng)
};

// Lot boundary (approximate - adjust as needed)
export const lotBoundary = [
  { lat: 32.7327, lng: -97.1120 },
  { lat: 32.7336, lng: -97.1120 },
  { lat: 32.7336, lng: -97.1116 },
  { lat: 32.7327, lng: -97.1116 },
];

// Total spots count
export const totalSpots = spotCenters.length;

// Export raw centers if needed
export const rawSpotCenters = spotCenters;
