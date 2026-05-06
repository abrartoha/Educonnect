// Project lat/lng pairs into local meters relative to a fixed centre so
// Three.js can use sensible numbers instead of WGS84.
//
// Equirectangular approximation — good for ≤ 1km radii where curvature is
// negligible. x → east, z → south (Three.js right-handed, y up).

const EARTH_R = 6378137; // metres

const toRad = (d) => (d * Math.PI) / 180;

export function latLngToLocal(lat, lng, centre) {
  const dLat = toRad(lat - centre.lat);
  const dLng = toRad(lng - centre.lng);
  const meanLat = toRad((lat + centre.lat) / 2);
  const x = EARTH_R * dLng * Math.cos(meanLat);
  const z = -EARTH_R * dLat; // north positive lat → negative z (we walk +z south)
  return [x, 0, z];
}

export function distanceMeters(lat1, lng1, lat2, lng2) {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lng2 - lng1);
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
}
