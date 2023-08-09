import React, {useCallback, useEffect, useState} from "react";
import {
  DirectionsRenderer,
  GoogleMap,
  Polyline,
  useLoadScript
} from "@react-google-maps/api";
import {getAllStops} from "./service/getStops";
import getAllVehicles from "./service/getVehicles";

import {getMyLocation, getPolylinePath} from "./helpers";

import {MAP_CENTER, MAP_OPTIONS} from "./constants";
import {AutocompleteForm, BusMarkers, StopMarkers, TopMenu, MyLocationMarker} from "./components";

import './App.css';

function App() {
  const [directionsService, setDirectionsService] = useState(null);
  const [directions, setDirections] = useState(null);
  const [directionRoutes, setDirectionRoutes] = useState([]); // [ {id, vehicle}
  const [buses, setBuses] = useState([]); // [ {id, vehicle}
  const [jsonData, setJsonData] = useState([]);
  const [stopsData, setStopsData] = useState([]);
  const [routeId, setRouteId] = useState(null); // [ {id, vehicle}
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [polylineInstances, setPolylineInstances] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(MAP_CENTER);

  const {isLoaded, loadError} = useLoadScript(MAP_OPTIONS);


  const handleLoad = () => {
    // Create the directionsService after the map is loaded
    setDirectionsService(new window.google.maps.DirectionsService());
  };

  const getVehicles = useCallback(() => {
    if (isLoaded) {
      getAllVehicles(setJsonData);
    }
  }, [isLoaded]);


  useEffect(() => {
    getVehicles();
    getMyLocation(setMyLocation);
  }, [getVehicles, isLoaded]);

  useEffect(() => {
    if (jsonData.length === 0) {
      return;
    }
    if (routeId !== "0") {
      const entityRoute = jsonData.entities.filter((entity) => entity.vehicle.trip.routeId === routeId);
      setBuses(entityRoute);
    } else {
      setBuses(jsonData.entities);
    }
  }, [jsonData, routeId]);

  // get entities by directionRoutes
  useEffect(() => {
    if (directionRoutes.length === 0) {
      return;
    }
    const entities = jsonData.entities.filter((entity) => directionRoutes.includes(entity.vehicle.trip.routeId));
    setBuses(entities);
    // get stops by directionRoutes
    directionRoutes.forEach((routeId) => {
      getAllStops(routeId, setStopsData);
    });
  }, [directionRoutes, jsonData]);

  // Function to add polyline instances to the state
  const addPolylineInstance = (polyline) => {
    setPolylineInstances((prevInstances) => [...prevInstances, polyline]);
  };

  const handleSetMyLocation = useCallback(() => {
    getMyLocation(setMyLocation);
    setMapCenter(myLocation);
  }, [myLocation]);

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="App">
      <AutocompleteForm
        myLocation={myLocation}
        directionsService={directionsService}
        setDirections={setDirections}
        setDirectionRoutes={setDirectionRoutes}
      />
      <TopMenu
        getVehicles={getVehicles}
        isLoaded={isLoaded}
        jsonData={jsonData}
        routeId={routeId}
        polylineInstances={polylineInstances}
        setStopsData={setStopsData}
        setSelectedRoute={setSelectedRoute}
        setBuses={setBuses}
        setRouteId={setRouteId}
        setPolylineInstances={setPolylineInstances}
        handleSetMyLocation={handleSetMyLocation}
      />
      <GoogleMap
        mapContainerStyle={{height: "calc(100vh - 60px)", width: "100vw"}}
        center={mapCenter}
        zoom={12}
        onLoad={handleLoad}
      >
        <MyLocationMarker myLocation={myLocation}/>
        {directions && <DirectionsRenderer directions={directions}/>}
        <BusMarkers buses={buses} stopsData={stopsData}/>
        {/* Draw Markers with bus stops */}
        <StopMarkers stopsData={stopsData}/>
        {/*  Draw Polyline from provided points */}
        {selectedRoute && (
          <Polyline
            key={selectedRoute.properties.Route}
            path={getPolylinePath(selectedRoute)}
            options={{
              strokeColor: "#00B1FF",
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
            onLoad={addPolylineInstance}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export default App;
