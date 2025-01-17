import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as ExpoLocation from 'expo-location';

type Location = ExpoLocation.LocationObject;

export type LocationAddress = {
  city: string;
  country: string;
  country_code: string;
  county: string;
  house_number: string;
  name: string;
  postcode: string;
  road: string;
  state: string;
  suburb: string;
};

export type Shop = {
  address: LocationAddress;
  boundingbox: string[];
  class: string;
  display_name: string;
  distance: number;
  lat: string;
  licence: string;
  lon: string;
  name: string;
  osm_id: string;
  osm_type: string;
  place_id: string;
  tag_type: string;
  type: string;
};

type LocationContextType = {
  location: Location | null;
  setLocation: (location: Location) => void;
  coffeeShops: Shop[];
  setCoffeeShops: (coffeeShops: Shop[]) => void;
};

const API_KEY = 'pk.1c2ecd9be2f9c636c9bda1c52c646128';
const tag = 'restaurant';

const settings = {
  async: true,
  crossDomain: true,
  url: `https://us1.locationiq.com/v1/nearby?key=${API_KEY}&lat=-37.870983&lon=144.980714&tag=${tag}&radius=30000&format=json`,
  method: 'GET',
};

export const LocationContext: React.Context<LocationContextType | undefined> = createContext<
  LocationContextType | undefined
>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [location, setLocation] = useState<Location | null>(null);
  const [coffeeShops, setCoffeeShops] = useState<Shop[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCoffeeShops = useCallback(
    async (location: Location) => {
      const { latitude, longitude } = location.coords;

      try {
        const response = await fetch(
          `https://us1.locationiq.com/v1/nearby?` +
            `key=${API_KEY}&` +
            `lat=${latitude}&` +
            `lon=${longitude}&` +
            `tag=${tag}&` +
            `radius=1000&` +
            `format=json`
        );

        if (!response.ok) {
          console.log(response);
        }

        const data = await response.json();

        setCoffeeShops(data);
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
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        console.log(status);
        if (status !== 'granted') {
          return;
        }

        const currentLocation = await ExpoLocation.getLastKnownPositionAsync({});

        setLocation(currentLocation);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchCoffeeShops(location);
    }
  }, [location]);

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
