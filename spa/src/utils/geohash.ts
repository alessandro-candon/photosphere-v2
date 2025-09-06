/**
 * Decodes a geohash string into latitude and longitude coordinates.
 * This implementation is self-contained and does not require external libraries.
 *
 * @param geohash The geohash string to decode.
 * @returns An object containing the latitude and longitude of the geohash's center.
 */
const decodeGeohash = (geohash: string): { latitude: number; longitude: number } => {
    const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let isEvenBit = true;
    const latRange = { min: -90.0, max: 90.0 };
    const lonRange = { min: -180.0, max: 180.0 };

    // Process each character of the geohash
    for (let i = 0; i < geohash.length; i++) {
        const char = geohash[i];
        const charIndex = BASE32.indexOf(char);

        if (charIndex === -1) {
            throw new Error('Invalid character in geohash');
        }

        // Each character represents 5 bits
        for (let j = 0; j < 5; j++) {
            const bit = (charIndex >> (4 - j)) & 1;

            if (isEvenBit) {
                // Even bits refine longitude
                const mid = (lonRange.min + lonRange.max) / 2;
                if (bit === 1) {
                    lonRange.min = mid;
                } else {
                    lonRange.max = mid;
                }
            } else {
                // Odd bits refine latitude
                const mid = (latRange.min + latRange.max) / 2;
                if (bit === 1) {
                    latRange.min = mid;
                } else {
                    latRange.max = mid;
                }
            }
            isEvenBit = !isEvenBit;
        }
    }

    // The center of the final bounding box is our coordinate
    const latitude = (latRange.min + latRange.max) / 2;
    const longitude = (lonRange.min + lonRange.max) / 2;

    return { latitude, longitude };
};

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 *
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance between the two points in meters.
 */
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = lat1 * Math.PI / 180; // φ, λ in radians
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Checks if a geohash is inside a given radius from a central coordinate point.
 *
 * This function works by decoding the geohash to find its center point and then
 * calculating the distance between that center and the center of the radius.
 * Given the high precision of a 9-character geohash (approx. 4.77m x 4.77m),
 * checking its center point is a very effective and efficient approximation.
 *
 * @param geohash The 9-character geohash string.
 * @param lat The latitude of the circle's center.
 * @param lon The longitude of the circle's center.
 * @param radius The radius of the circle in meters.
 * @returns A boolean indicating if the geohash's center is within the radius.
 */
export const isThisGeohashInsideThisCoordinatesRadius = (geohash: string, lat: number, lon: number, radius: number): boolean => {
  console.log('isThisGeohashInsideThisCoordinatesRadius', geohash, lat, lon, radius);
  try {
        // 1. Decode the geohash to get the coordinates of its center.
        const geohashCoords = decodeGeohash(geohash);

        // 2. Calculate the distance between the geohash's center and the circle's center.
        const distance = haversineDistance(
            lat,
            lon,
            geohashCoords.latitude,
            geohashCoords.longitude
        );

        // 3. Return true if the distance is less than or equal to the specified radius.
        return distance <= radius;
    } catch (error) {
        console.error(error);
        return false; // Return false if the geohash is invalid
    }
};
