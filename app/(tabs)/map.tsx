import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FlatList, Text } from 'react-native';
import { useLocation } from '@/context/LocationContext';

const Header = () => {
  return <View style={styles.header}></View>;
};
const MapListToggle = () => {
  const [isMapView, setIsMapView] = useState(true);

  const { location, setLocation, coffeeShops } = useLocation();

  console.log(coffeeShops);

  const toggleView = () => {
    setIsMapView(!isMapView);
  };

  const data = [
    { key: '1', name: 'Location 1' },
    { key: '2', name: 'Location 2' },
    { key: '3', name: 'Location 3' },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <Button title={`Switch to ${isMapView ? 'List' : 'Map'} View`} onPress={toggleView} />
      {isMapView ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude || 37.78825,
            longitude: location?.coords.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {coffeeShops.map((shop, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: parseFloat(shop.lat),
                longitude: parseFloat(shop.lon),
              }}
              title={shop.name}
            />
          ))}
        </MapView>
      ) : (
        <FlatList data={data} renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 44,
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  item: {
    padding: 20,
    fontSize: 18,
    height: 44,
  },
});

export default MapListToggle;
