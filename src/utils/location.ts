
// Haversine formula to calculate distance between two points in kilometers
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get current user location
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    }
  });
}

// Check if user is within submission radius (in meters)
export async function isWithinSubmissionRadius(
  requiredLat: number,
  requiredLng: number,
  radiusInMeters: number = 100
): Promise<boolean> {
  try {
    const position = await getCurrentLocation();
    const { latitude, longitude } = position.coords;
    
    // Calculate distance in kilometers
    const distanceInKm = calculateDistance(
      latitude,
      longitude,
      requiredLat,
      requiredLng
    );
    
    // Convert to meters and check
    const distanceInMeters = distanceInKm * 1000;
    return distanceInMeters <= radiusInMeters;
  } catch (error) {
    console.error("Error getting location:", error);
    throw error;
  }
}
