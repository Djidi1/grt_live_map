import React, {useCallback} from "react";
import refresh from "../refresh.svg";
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
    setBuses,
    setRouteId,
    setPolylineInstances
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
    if (routeId !== "0") {
      // get route from json file grt_routes.features.properties.Route
      const routes = grt_routes.features.filter((route) => route.properties.Route === Number(routeId));
      setSelectedRoute(routes[0]);
      getStops(routeId);
      const entityRoute = jsonData.entities.filter((entity) => entity.vehicle.trip.routeId === routeId);
      setBuses(entityRoute);
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
  );
}

export default TopMenu;