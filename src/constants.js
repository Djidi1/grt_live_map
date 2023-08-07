const MAP_CENTER = {
  lat: 43.46,
  lng: -80.50
}; // Initial map center

const LIBRARIES = ["places"];
const MAP_OPTIONS = {
  googleMapsApiKey: "AIzaSyBjqp9kmhvyzsAiPp0PSMQPW5DdoXmcaxY",
  libraries: LIBRARIES,
}

const VEHICLE_STATUS = {
  IN_TRANSIT_TO: "in transit",
  STOPPED_AT: "stopped",
}

export {
  MAP_CENTER,
  MAP_OPTIONS,
  VEHICLE_STATUS,
}