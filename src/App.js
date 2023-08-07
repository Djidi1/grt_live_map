import './App.css';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  Polyline,
  useLoadScript
} from "@react-google-maps/api";
import React, {useCallback, useEffect, useState} from "react";
import getAllVehicles from "./service/getVehicles";
import refresh from './refresh.svg';
import grt_routes from './data/grt_routes.json';
import {Counter} from "./Counter";
import {getAllStops} from "./service/getStops";
import {getMarkerIcon, getPolylinePath} from "./helpers";

const MAP_CENTER = {lat: 43.46, lng: -80.50}; // Initial map center

function App() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [entity, setEntity] = useState([]); // [ {id, vehicle}
  const [jsonData, setJsonData] = useState([]);
  const [stopsData, setStopsData] = useState([]);
  const [routeId, setRouteId] = useState(null); // [ {id, vehicle}
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [polylineInstances, setPolylineInstances] = useState([]);

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: "AIzaSyBjqp9kmhvyzsAiPp0PSMQPW5DdoXmcaxY", // Replace with your API key
  });

  const getVehicles = useCallback(() => {
    if (isLoaded) {
      getAllVehicles(setJsonData);
    }
  }, [isLoaded]);

  const getStops = useCallback((routeId) => {
    if (isLoaded) {
      getAllStops(routeId, setStopsData);
    }
  }, [isLoaded]);


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
  };

  const handleMarkerClick = (entity) => {
    setSelectedEntity(entity);
  };

  const handleSetRouteId = (e) => {
    const routeId = e.target.value;
    clearPolygons();
    if (routeId !== "0") {
      // get route from json file grt_routes.features.properties.Route
      const routes = grt_routes.features.filter((route) => route.properties.Route === Number(routeId));
      setSelectedRoute(routes[0]);
      getStops(routeId);
      const entityRoute = jsonData.entities.filter((entity) => entity.vehicle.trip.routeId === routeId);
      setEntity(entityRoute);
    }
    setRouteId(routeId);
  }

  // Function to add polyline instances to the state
  const addPolylineInstance = (polyline) => {
    setPolylineInstances((prevInstances) => [...prevInstances, polyline]);
  };

  // Function to remove existing polygons from the map
  const clearPolygons = () => {
    // Remove the polyline instances from the map
    polylineInstances.forEach((polyline) => polyline.setMap(null));
    // Clear the polyline instances from the state
    setPolylineInstances([]);
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="App">
      <div className="top-menu">
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
        <button className='refresh-button' onClick={handleRefresh}>
          <img src={refresh} className="refresh-icon" alt="refresh"/>
        </button>
        <Counter routeId={routeId} getVehicles={getVehicles}/>
      </div>
      <GoogleMap
        mapContainerStyle={{height: "calc(100vh - 60px)", width: "100vw"}}
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
              // label={vehicle.trip.routeId}
              label={{
                text: vehicle.trip.routeId,
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "bold"
              }}
              icon={getMarkerIcon(vehicle.trip.routeId)}
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
              <p><b>Current Status:</b> {selectedEntity.vehicle.currentStatus}</p>
              <p><b>Current Stop Sequence:</b> {selectedEntity.vehicle.currentStopSequence}</p>
              <p><b>Start Time:</b> {selectedEntity.vehicle.trip.startTime}</p>
            </div>
          </InfoWindow>
        )}
        {/* Draw Markers with bus stops */}
        {stopsData.map((stop) => (
          <Marker
            key={stop.StopId}
            position={{
              lat: stop.Latitude,
              lng: stop.Longitude,
            }}
            title={stop.Name}
            icon={{
              path: "M 2, 4 a 2,2 0 1,1 4,0 a 2,2 0 1,1 -4,0",
              fillColor: "#00b2ff",
              fillOpacity: 0.5,
              strokeOpacity: 0.5,
              strokeColor: "#00b2ff",
              strokeWeight: 4,
              anchor: {x: 1, y: 2},
              origin: {x: 0, y: 0},
            }}
            onClick={() => setSelectedStop(stop)}
          />
        ))}
        {selectedStop && (
          <InfoWindow
            position={{
              lat: selectedStop.Latitude,
              lng: selectedStop.Longitude,
            }}
            onCloseClick={() => setSelectedStop(null)}
          >
            <div>
              <h3>{selectedStop.Name}</h3>
              <p><b>Stop ID:</b> {selectedStop.StopId}</p>
            </div>
          </InfoWindow>
        )}
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
