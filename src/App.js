import './App.css';
import {
  DirectionsRenderer,
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
import {extractBusNumbers, getBusDirection, getMarkerIcon, getPolylinePath} from "./helpers";
import AutocompleteInput from "./AutocopleteInput";
import {getBusInfo} from "./service/getBusInfo";

const MAP_CENTER = {lat: 43.46, lng: -80.50}; // Initial map center
const LIBRARIES = ["places"];
const MAP_OPTIONS = {
  googleMapsApiKey: "AIzaSyBjqp9kmhvyzsAiPp0PSMQPW5DdoXmcaxY",
  libraries: LIBRARIES,
}

function App() {
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [directionsService, setDirectionsService] = useState(null);
  const [directions, setDirections] = useState(null);
  const [directionRoutes, setDirectionRoutes] = useState([]); // [ {id, vehicle}
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [entity, setEntity] = useState([]); // [ {id, vehicle}
  const [jsonData, setJsonData] = useState([]);
  const [stopsData, setStopsData] = useState([]);
  const [routeId, setRouteId] = useState(null); // [ {id, vehicle}
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [polylineInstances, setPolylineInstances] = useState([]);
  const [busInfoData, setBusInfoData] = useState([]);

  const {isLoaded, loadError} = useLoadScript(MAP_OPTIONS);

  const onDirectionsSubmit = useCallback(() => {
    if (directionsService && originAddress && destinationAddress) {
      const request = {
        origin: originAddress,
        destination: destinationAddress,
        travelMode: window.google.maps.TravelMode.TRANSIT,
      };

      directionsService.route(request, (response, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const routes = extractBusNumbers(response.routes);
          setDirectionRoutes(routes);
          setDirections(response);
        } else {
          console.error("Directions request failed:", status);
        }
      });
    }
  }, [directionsService, originAddress, destinationAddress]);

  const handleLoad = () => {
    // Create the directionsService after the map is loaded
    setDirectionsService(new window.google.maps.DirectionsService());
  };

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

  // get entities by directionRoutes
  useEffect(() => {
    if (directionRoutes.length === 0) {
      return;
    }
    const entities = jsonData.entities.filter((entity) => directionRoutes.includes(entity.vehicle.trip.routeId));
    setEntity(entities);
  }, [directionRoutes, jsonData]);

  const handleRefresh = () => {
    getVehicles();
  };

  // click on a bus Icon
  const handleMarkerClick = (entity) => {
    setSelectedBus(entity);
    const params = {
      tripId: entity.vehicle.trip.tripId,
      vehicleId: entity.id,
      setBusInfoData: setBusInfoData
    }
    getBusInfo(params);
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
      <div className="direction-form">
        <AutocompleteInput
          value={originAddress}
          onChange={setOriginAddress}
          onSelect={setOriginAddress}
          placeholder="Enter origin"
        />
        <AutocompleteInput
          value={destinationAddress}
          onChange={setDestinationAddress}
          onSelect={setDestinationAddress}
          placeholder="Enter destination"
        />
        <button className="get-direction-button" onClick={onDirectionsSubmit}>GO</button>
      </div>
      <div className="top-menu">
        <div className="bus-route-label">
          Bus Route:
        </div>
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
        onLoad={handleLoad}
      >
        {directions && <DirectionsRenderer directions={directions}/>}
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
        {selectedBus && (
          <InfoWindow
            position={{
              lat: Number(selectedBus.vehicle.position.latitude),
              lng: Number(selectedBus.vehicle.position.longitude),
            }}
            onCloseClick={() => setSelectedBus(null)}
          >
            <div>
              <h3>Route: {selectedBus.vehicle.trip.routeId}</h3>
              <p><b>Current Status:</b> {selectedBus.vehicle.currentStatus}</p>
              <p><b>Current Stop Sequence:</b> {selectedBus.vehicle.currentStopSequence}</p>
              <p><b>Start Time:</b> {selectedBus.vehicle.trip.startTime}</p>
              {busInfoData && busInfoData.stopTimes ? (
                <table>
                  <thead>
                  <tr>
                    <th></th>
                    <th>Stop #</th>
                    <th>Intersection</th>
                    <th>ETA</th>
                  </tr>
                  </thead>
                  <tbody>
                  {busInfoData.stopTimes
                    .filter(item => item.StopSequence >= selectedBus.vehicle.currentStopSequence)
                    .map(item => {
                      const direction = getBusDirection({stopId: item.StopId, selectedBus, stopsData});
                      return (
                        <tr key={item.StopSequence}>
                          <td>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 transform={`rotate(${direction - 90})`} width="24" height="24" viewBox="0 0 24 24"
                                 fill="none">
                              <path d="M24 12l-12-8v5h-12v6h12v5z" fill="#4499FF"/>
                            </svg>
                          </td>
                          <td>{item.StopSequence}</td>
                          <td>{item.Name}</td>
                          <td>in {item.Minutes} min [at {item.ScheduleTime.substring(0, 5)}]</td>
                        </tr>
                      )
                    })}
                  {busInfoData.stopTimes
                      .filter(item => item.StopSequence >= selectedBus.vehicle.currentStopSequence).length === 0
                    && (
                      <tr>
                        <td colSpan={4}>No upcoming stops</td>
                      </tr>
                    )
                  }
                  </tbody>
                </table>
              ) : (
                <>Loading...</>
              )}
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
