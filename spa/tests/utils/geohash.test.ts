import { describe, it, expect } from 'vitest';
import { isThisGeohashInsideThisCoordinatesRadius } from '../../src/utils/geohash';

describe('isThisGeohashInsideThisCoordinatesRadius', () => {
  const lat = 45.61807;
  const lon = 9.23384;
  const geohashOfCoordinates = 'u0ned0ebs'; // 9-character geohash

  it('should return true for geohash inside radius', () => {
    const geohash = 'u0ned0';
    expect(isThisGeohashInsideThisCoordinatesRadius(geohash, lat, lon, 20)).toBe(true);
    expect(isThisGeohashInsideThisCoordinatesRadius(geohashOfCoordinates, lat, lon, 5)).toBe(true);
  });

  it('should return false for geohash u0nfs0 (outside radius)', () => {
    const geohash = 'u0nfs0';
    expect(isThisGeohashInsideThisCoordinatesRadius(geohash, lat, lon, 20)).toBe(false);
  });

  it('should return true, it is inside the radius', () => {
        // 'latitude': 46.0649223325, 'longitude': 13.23360061638889, 'geohash': 'u21qj1u7t'
    expect(isThisGeohashInsideThisCoordinatesRadius('u21qj1u7t', 46.0634632, 13.2358377, 10000)).toBe(true);
  });
});

