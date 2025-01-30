import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FlatList, Text } from 'react-native';
import { useLocation } from '@/context/LocationContext';
import { BottomDrawer } from '@/components/BottomDrawer';
import { YelpBusiness } from '@/data/Yelp';
import ShopView from '../../components/map/ShopView';

const Header = () => {
  return <View style={styles.header}></View>;
};
const MapListToggle = () => {
  const [isMapView, setIsMapView] = useState(true);
  const [selectedShop, setSelectedShop] = useState<YelpBusiness | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { location, setLocation, coffeeShops } = useLocation();

  const toggleView = () => {
    setIsMapView(!isMapView);
  };

  const onPressMarker = (shop: YelpBusiness) => {
    setSelectedShop(shop);
    setIsDrawerOpen(true);
  };

  return (
    <View style={styles.container}>
      <Header />
      <Button title={`Switch to ${isMapView ? 'List' : 'Map'} View`} onPress={toggleView} />
      {isMapView ? (
        <>
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
                onPress={() => onPressMarker(shop)}
                coordinate={{
                  latitude: shop.coordinates.latitude,
                  longitude: shop.coordinates.longitude,
                }}
                title={shop.name}
              />
            ))}
          </MapView>
          <BottomDrawer isOpen={isDrawerOpen} onStateChange={setIsDrawerOpen}>
            <ShopView shop={selectedShop} />
          </BottomDrawer>
        </>
      ) : (
        <FlatList data={coffeeShops} renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>} />
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
