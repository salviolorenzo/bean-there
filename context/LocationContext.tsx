import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as ExpoLocation from 'expo-location';
import { CacheService } from '@/cache';
import { getNearbyBusinesses, YelpBusiness } from '@/data/Yelp';

type CachedData = {
  timestamp: number;
  location: Location | null;
  coffeeShops: YelpBusiness[];
};

type Location = ExpoLocation.LocationObject;

type LocationContextType = {
  location: Location | null;
  setLocation: (location: Location) => void;
  coffeeShops: YelpBusiness[];
  setCoffeeShops: (coffeeShops: YelpBusiness[]) => void;
};

export const LocationContext: React.Context<LocationContextType | undefined> = createContext<
  LocationContextType | undefined
>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [location, setLocation] = useState<Location | null>(null);
  const [coffeeShops, setCoffeeShops] = useState<YelpBusiness[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cacheConfig = {
    key: 'location_data',
    expiryTime: 1000 * 60 * 60, // 1 hour
  };

  const fetchCoffeeShops = useCallback(
    async (location: Location) => {
      const { latitude, longitude } = location.coords;

      try {
        const yelpBusinesses = await getNearbyBusinesses(latitude, longitude);
        setCoffeeShops(yelpBusinesses);

        await CacheService.set(cacheConfig, {
          location,
          coffeeShops: yelpBusinesses,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch coffee shops');
        console.error('API Error:', err);
      }
    },
    [location]
  );

  useEffect(() => {
    (async () => {
      try {
        const cached = await CacheService.get<{
          location: Location;
          coffeeShops: YelpBusiness[];
        }>(cacheConfig);

        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const currentLocation = await ExpoLocation.getCurrentPositionAsync({});

        if (cached && isSameLocation(cached.location, currentLocation)) {
          console.log('data from cache');
          setLocation(cached.location);
          setCoffeeShops(cached.coffeeShops);
          return;
        }

        console.log('data from api');
        setLocation(currentLocation);
        fetchCoffeeShops(currentLocation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Location error');
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, coffeeShops, setCoffeeShops }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

const isSameLocation = (a: Location, b: Location) => {
  return a.coords.latitude === b.coords.latitude && a.coords.longitude === b.coords.longitude;
};
