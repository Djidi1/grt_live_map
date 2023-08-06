import './App.css';
import {
  GoogleMap, InfoWindow, Marker, Polygon, Polyline, useLoadScript
} from "@react-google-maps/api";
import React, {useCallback, useEffect, useState} from "react";
import getAllVehicles from "./service/getVehicles";
import refresh from './refresh.svg';
import bus from './bus.png';
import grt_routes from './data/grt_routes.json';
import {Counter} from "./Counter";

const MAP_CENTER = {lat: 43.46, lng: -80.50}; // Initial map center

const getMarkerIcon = (routeId) => {
  return {
    url: bus,
    fillColor: "#00b2ff",
    fillOpacity: 0.9,
    strokeColor: "#ffffff",
    strokeWeight: 1,
    scale: 0.07,
    scaledSize: {width: 32, height: 48},
    labelOrigin: {x: 16, y: 30},
    label: {text: routeId, color: "#ffffff", fontSize: "12px", fontWeight: "bold"},
    anchor: {x: 16, y: 42},
    origin: {x: 0, y: 0},
  };
};

function App() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entity, setEntity] = useState([]); // [ {id, vehicle}
  const [jsonData, setJsonData] = useState([]);
  const [routeId, setRouteId] = useState(null); // [ {id, vehicle}
  const [selectedRoute, setSelectedRoute] = useState(null);

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: "AIzaSyBjqp9kmhvyzsAiPp0PSMQPW5DdoXmcaxY", // Replace with your API key
  });

  const getVehicles = useCallback(() => {
    if (isLoaded) {
      getAllVehicles(setJsonData);
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
      const entityRoute = jsonData.entities.filter((entity) => entity.vehicle.trip.routeId === routeId);
      setEntity(entityRoute);
    }
    setRouteId(routeId);
  }


  const [polylineInstances, setPolylineInstances] = useState([]);

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
        {/*  Draw Polygon from provided points */}
        {selectedRoute && selectedRoute.geometry.type === "LineString" && (
          <Polygon
            key={selectedRoute.properties.Route}
            path={selectedRoute.geometry.coordinates.map((coordinate) => {
              if (Array.isArray(coordinate[0])) {
                return ({
                    lat: coordinate[0][1],
                    lng: coordinate[0][0],
                  }
                )
              }
              return ({
                  lat: coordinate[1],
                  lng: coordinate[0],
                }
              )
            })}
            options={{
              strokeColor: "#00B1FF",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "transparent", // transparent
              fillOpacity: 0.0,
            }}
            onLoad={addPolylineInstance}
          />
        )}
        {
          selectedRoute && selectedRoute.geometry.type === "MultiLineString" && (
            selectedRoute.geometry.coordinates.map((coordinate, index) => (
              <Polyline
                key={index}
                path={coordinate.map((coordinate) => {
                  if (Array.isArray(coordinate[0])) {
                    return ({
                        lat: coordinate[0][1],
                        lng: coordinate[0][0],
                      }
                    )
                  }
                  return ({
                      lat: coordinate[1],
                      lng: coordinate[0],
                    }
                  )
                })}
                options={{
                  strokeColor: "#00B1FF",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
                onLoad={addPolylineInstance}
              />
            ))
          )
        }
      </GoogleMap>
    </div>
  );
}

export default App;
