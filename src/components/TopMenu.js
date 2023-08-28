import React, {useCallback} from "react";
import refresh from "../assets/refresh.svg";
import currentLocation from "../assets/current-location-icon.svg";
import {Counter} from "./index";
import grt_routes from "../data/grt_routes.json";
import {getAllStops} from "../service/getStops";

const TopMenu = (props) => {
    const {
        isLoaded,
        jsonData,
        routeId,
        polylineInstances,
        getVehicles,
        setStopsData,
        setSelectedRoute,
        setRouteId,
        setPolylineInstances,
        handleSetMyLocation,
        liveBusesFunction
    } = props;

    const handleRefresh = () => {
        getVehicles();
    };

    const getStops = useCallback((routeId) => {
        if (isLoaded) {
            getAllStops(routeId, setStopsData);
        }
    }, [isLoaded, setStopsData]);

    const handleSetRouteId = (e) => {
        const routeId = e.target.value;
        clearPolygons();
        if (routeId !== "0" && routeId !== "-1") {
            // get route from json file grt_routes.features.properties.Route
            const routes = grt_routes.features.filter((route) => route.properties.Route === Number(routeId));
            setSelectedRoute(routes[0]);
            getStops(routeId);
        }
        setRouteId(routeId);
    };
    // Function to remove existing polygons from the map
    const clearPolygons = () => {
        // Remove the polyline instances from the map
        polylineInstances.forEach((polyline) => polyline.setMap(null));
        // Clear the polyline instances from the state
        setPolylineInstances([]);
    };

    return (
        <div className="top-menu">
            <div className="bus-route-label">
                Bus Route:
            </div>
            <select
                className={"route-id-select"}
                onChange={handleSetRouteId}
            >
                <option value="-1">None</option>
                <option value="0">All</option>
                {jsonData.uniqueRouteIds?.sort(
                    (a, b) => Number(a) - Number(b)
                ).map((routeId) => (
                    <option key={routeId} value={routeId}>
                        {routeId}
                    </option>
                ))}
            </select>
            <button className='refresh-button' onClick={handleSetMyLocation}>
                <img src={currentLocation} className="refresh-icon" alt="my location"/>
            </button>
            <button className='refresh-button' onClick={handleRefresh} style={{display: "none"}}>
                <img src={refresh} className="refresh-icon" alt="refresh"/>
            </button>
            <Counter
                routeId={routeId}
                getVehicles={getVehicles}
                liveBusesFunction={routeId !== "-1" ? getVehicles : liveBusesFunction}
            />
        </div>
    );
}

export default TopMenu;