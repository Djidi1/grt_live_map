import bus from "./assets/bus.png";

export const getCurrentRouteCoordinates = (route) => {
  let coordinates = [];
  if (route.geometry.type === 'LineString') {
    coordinates = route.geometry.coordinates[0];
  } else {
    coordinates = route.geometry.coordinates[0][0];
  }
  return {lat: coordinates[1], lng: coordinates[0]};
}

export const getMarkerIcon = (routeId) => {
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

export const getPolylinePath = (route) => {
  let path;
  if (route.geometry.type === "LineString") {
    path = route.geometry.coordinates;
  } else {
    path = route.geometry.coordinates[0];
  }
  return path.map((coordinate) => ({lat: coordinate[1], lng: coordinate[0]}));
}

export const extractBusNumbers = (directionsResponse) => {
  const busNumbers = [];

  directionsResponse.forEach((route) => {
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        if (step.travel_mode === "TRANSIT") {
          const transitLine = step.transit.line;
          if (transitLine && transitLine.short_name) {
            const busNumber = transitLine.short_name;
            busNumbers.push(busNumber);
          }
        }
      });
    });
  });

  return busNumbers;
};

export const getBusDirection = ({stopId, stopsData, selectedBus}) => {
  const stop = stopsData.find(stop => stop.StopId === stopId); // get stop info from stopsData
  if (!stop) {
    return 0;
  }
  const stopLocation = { lat: stop.Latitude, lng: stop.Longitude };
  const busLocation = { lat: selectedBus.vehicle.position.latitude, lng: selectedBus.vehicle.position.longitude };
  // calculate direction from bus to stop
  return window.google.maps.geometry.spherical.computeHeading(busLocation, stopLocation);
};

export const getMyLocation = (setMyLocation) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      setMyLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }
}