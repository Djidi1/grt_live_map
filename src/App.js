import './App.css';
import {GoogleMap, InfoWindow, Marker, useLoadScript} from "@react-google-maps/api";
import React, {useCallback, useEffect, useState} from "react";
import getAllVehicles from "./service/getVehicles";
import refresh from './refresh.svg';

const REFRESH_INTERVAL = 60; // seconds
const MAP_CENTER = {lat: 43.46, lng: -80.50}; // Initial map center


function App() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entity, setEntity] = useState([]); // [ {id, vehicle}
  const [jsonData, setJsonData] = useState([]);
  const [routeId, setRouteId] = useState(null); // [ {id, vehicle}
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: "AIzaSyBjqp9kmhvyzsAiPp0PSMQPW5DdoXmcaxY", // Replace with your API key
  });

  const getVehicles = useCallback(() => {
    if (isLoaded) {
      getAllVehicles(setJsonData);
    }
  }, [isLoaded]);

  // countdown timer
  useEffect(() => {
    if (countdown === 0) {
      getVehicles();
      setCountdown(REFRESH_INTERVAL);
    }
    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, routeId]);


  useEffect(() => {
    getVehicles();
  }, [getVehicles, isLoaded]);

  useEffect(() => {
    if (jsonData.length === 0) {
      return;
    }
    if (routeId !== "0") {
      const entityRoute = jsonData.entities.filter((entity) => entity.vehicle.trip.routeId === routeId);
      setEntity(entityRoute);
    } else {
      setEntity(jsonData.entities);
    }
  }, [jsonData, routeId]);

  const handleRefresh = () => {
    getVehicles();
    setCountdown(REFRESH_INTERVAL);
  };

  const handleMarkerClick = (entity) => {
    setSelectedEntity(entity);
  };

  const handleSetRouteId = (e) => {
    const routeId = e.target.value;
    if (routeId !== "0") {
      const entityRoute = jsonData.entities.filter((entity) => entity.vehicle.trip.routeId === routeId);
      setEntity(entityRoute);
    }
    setRouteId(routeId);
  }

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="App">
      <select
        className={"route-id-select"}
        onChange={handleSetRouteId}
      >
        <option value={0}>All</option>
        {jsonData.uniqueRouteIds?.sort(
          (a, b) => Number(a) - Number(b)
        ).map((routeId) => (
          <option key={routeId} value={routeId}>
            {routeId}
          </option>
        ))}
      </select>
      <input className='refresh-countdown' type='number' readOnly value={countdown}/>
      <button className='refresh-button' onClick={handleRefresh}>
        <img src={refresh} className="refresh-icon" alt="refresh" />
      </button>
      <GoogleMap
        mapContainerStyle={{height: "100vh", width: "100vw"}}
        center={MAP_CENTER}
        zoom={12}
      >
        {entity.map(({id, vehicle}) => (
            <Marker
              key={id}
              position={{
                lat: Number(vehicle.position.latitude),
                lng: Number(vehicle.position.longitude),
              }}
              onClick={() => handleMarkerClick({id, vehicle})}
              label={vehicle.trip.routeId}
              // icon={getMarkerIcon(vehicle.trip.routeId)}
            />
          )
        )}
        {selectedEntity && (
          <InfoWindow
            position={{
              lat: Number(selectedEntity.vehicle.position.latitude),
              lng: Number(selectedEntity.vehicle.position.longitude),
            }}
            onCloseClick={() => setSelectedEntity(null)}
          >
            <div>
              <h3>Route: {selectedEntity.vehicle.trip.routeId}</h3>
              <p>Latitude: {selectedEntity.vehicle.position.latitude}</p>
              <p>Longitude: {selectedEntity.vehicle.position.longitude}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default App;
