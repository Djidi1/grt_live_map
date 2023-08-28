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
    const [showDirections, setShowDirections] = useState(false);

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
        if (directionRoutes?.length > 0) {
            setRouteId("-1");
            setSelectedRoute(null);
            setStopsData([]);
        }
    }, [directionRoutes]);

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

    const routeIds = directionRoutes.length > 0 ? directionRoutes : [routeId];

    // form beautiful data based on google directions
    const DirectionInfoBlock = ({showDirections}) => {
        const {legs} = directions.routes[0];
        const {steps} = legs[0];
        const stepsRows = steps.map((step, index) => {
            const {distance, duration, instructions, travel_mode} = step;
            const {text: durationText} = duration;
            const {text: distanceText} = distance;
            return (
                <div className="direction-info-block__step" key={index}>
                    <div className="direction-info-block__step-route">
                        <div className="direction-info-block__step-route-number">{instructions}</div>
                        <div className="direction-info-block__step-route-name">{travel_mode}</div>
                    </div>
                    <div className="direction-info-block__step-duration-distance">
                        {durationText} - {distanceText}
                    </div>
                </div>
            );
        });
        return (
            <div className={showDirections ? "direction-info-block" : "direction-info-block-hide"}>
                {stepsRows}
            </div>
        );
    }

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
                polylineInstances={polylineInstances}
                setStopsData={setStopsData}
                setSelectedRoute={setSelectedRoute}
                routeId={routeId}
                setRouteId={setRouteId}
                setPolylineInstances={setPolylineInstances}
                handleSetMyLocation={handleSetMyLocation}
            />
            {directions && (
                <button className="direction-info-block__my-location-button" onClick={() => setShowDirections(!showDirections)}>
                    {showDirections ? 'Hide' : 'Show'} details
                </button>
            )}
            {directions && <DirectionInfoBlock showDirections={showDirections}/>}
            <GoogleMap
                mapContainerStyle={{height: "calc(100vh - 60px)", width: "100vw"}}
                center={mapCenter}
                zoom={12}
                onLoad={handleLoad}
                options={{streetViewControl: false, fullscreenControl: false}}
            >
                <MyLocationMarker myLocation={myLocation}/>
                {directions && <DirectionsRenderer directions={directions}/>}
                {routeIds.length > 0 && <BusMarkers directionRoutes={routeIds}/>}
                {/* Draw Markers with bus stops */}
                {stopsData.length > 0 &&
                    <StopMarkers stopsData={stopsData.filter((stop) => stop.RouteId === routeId)}/>}
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
