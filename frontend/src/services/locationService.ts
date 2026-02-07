import { locationAPI } from './api';

let locationWatchId: number | null = null;
let updateInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start sending GPS location updates to the backend.
 * Uses expo-location for foreground tracking.
 * In production, use expo-task-manager for background tracking.
 */
export async function startLocationTracking(intervalMs = 10000): Promise<boolean> {
  try {
    // Dynamic import to avoid crash if expo-location not installed
    const Location = require('expo-location');

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return false;
    }

    // Get initial location
    const initial = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    await sendLocationUpdate(initial.coords);

    // Watch for location changes
    locationWatchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: intervalMs,
        distanceInterval: 20, // meters
      },
      (location: any) => {
        sendLocationUpdate(location.coords);
      }
    );

    return true;
  } catch (error) {
    console.error('Failed to start location tracking:', error);
    return false;
  }
}

/**
 * Stop sending GPS location updates.
 */
export function stopLocationTracking() {
  if (locationWatchId !== null) {
    try {
      const subscription = locationWatchId as any;
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    } catch (e) {
      console.warn('Error stopping location watch:', e);
    }
    locationWatchId = null;
  }

  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

/**
 * Send a single location update to the backend.
 */
async function sendLocationUpdate(coords: {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}) {
  try {
    await locationAPI.updateDriverLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy ?? undefined,
      heading: coords.heading ?? undefined,
      speed: coords.speed ?? undefined,
    });
  } catch (error) {
    console.warn('Failed to send location update:', error);
  }
}

/**
 * Set driver online/offline status.
 */
export async function setDriverOnline(isOnline: boolean) {
  try {
    await locationAPI.setOnlineStatus(isOnline);
    if (isOnline) {
      await startLocationTracking();
    } else {
      stopLocationTracking();
    }
  } catch (error) {
    console.error('Failed to set online status:', error);
  }
}
