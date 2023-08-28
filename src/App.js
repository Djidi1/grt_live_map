import React, {useCallback, useEffect, useState} from "react";
import {
  DirectionsRenderer,
  GoogleMap,
  Polyline,
  useLoadScript
} from "@react-google-maps/api";
import getAllVehicles from "./service/getVehicles";

import {getMyLocation, getPolylinePath} from "./helpers";

import {MAP_CENTER, MAP_OPTIONS} from "./constants";
import {AutocompleteForm, BusMarkers, StopMarkers, TopMenu, MyLocationMarker} from "./components";

import './App.css';
// import {getBusesOnRoutes} from "./service/getBusesOnRoutes";

function App() {
  const [directionsService, setDirectionsService] = useState(null);
  const [directions, setDirections] = useState(null);
  const [directionRoutes, setDirectionRoutes] = useState([]); //
  const [jsonData, setJsonData] = useState([]);
  const [stopsData, setStopsData] = useState([]);
  const [routeId, setRouteId] = useState("-1"); // -1 - turned off, 0 - all routes, 1-* - route number
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

  /*useEffect(() => {
    if (jsonData.length === 0) {
      return;
    }
    if (routeId !== "0") {
      const entityRoute = jsonData.entities.filter((entity) => entity.vehicle.trip.routeId === routeId);
      setBuses(entityRoute);
    } else {
      setBuses(jsonData.entities);
    }
  }, [jsonData, routeId]);*/

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
        // setBuses={setBuses}
        setRouteId={setRouteId}
        setPolylineInstances={setPolylineInstances}
        handleSetMyLocation={handleSetMyLocation}
        // liveBusesFunction={() => getBusesOnRoutes(directionRoutes, setBuses)}
      />
      <GoogleMap
        mapContainerStyle={{height: "calc(100vh - 60px)", width: "100vw"}}
        center={mapCenter}
        zoom={12}
        onLoad={handleLoad}
        options={{streetViewControl: false, fullscreenControl: false}}
      >
        <MyLocationMarker myLocation={myLocation}/>
        {directions && <DirectionsRenderer directions={directions}/>}
        {directionRoutes.length > 0 && <BusMarkers directionRoutes={directionRoutes} stopsData={stopsData}/>}
        {/* Draw Markers with bus stops */}
        <StopMarkers stopsData={stopsData.filter((stop) => stop.RouteId === routeId)}/>
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
