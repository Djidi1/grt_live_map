export const getMarkerIcon = ({routeId, direction}) => {
  const currentDirection = direction === 0 ? 0 : direction - 180;
  return {
    path: 'M 148.5 0 C 87.43 0 37.747 49.703 37.747 110.797 C 37.747 201.823 137.476 290.702 141.723 294.442 C 143.659 296.147 146.079 297.001 148.5 297.001 C 150.921 297.001 153.341 296.148 155.278 294.442 C 159.523 290.703 259.253 201.824 259.253 110.797 C 259.253 49.703 209.57 0 148.5 0 Z',
    rotation: currentDirection,
    fillColor: "#0cc000",
    fillOpacity: 1,
    strokeColor: "#088000",
    strokeWeight: 1,
    scale: 0.1,
    scaledSize: {width: 40, height: 40},
    labelOrigin: {x: 145, y: 130},
    label: {text: routeId, color: "#004766", fontSize: "12px", fontWeight: "bold"},
    anchor: {x: 150, y: 150},
    origin: {x: 150, y: 150},
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

export const getBusDirectionOnRoute = ({vehicle, nextStopLocation}) => {
  if (!nextStopLocation) {
    return 0;
  }
  let nextLocation = {
    lat: nextStopLocation.Latitude,
    lng: nextStopLocation.Longitude
  };

  if (!!vehicle.points && vehicle.points.length !== 0) {
    nextLocation = {
        lat: vehicle.points[0].latitude,
        lng: vehicle.points[0].longitude
    }
  }

  const busLocation = {
    lat: vehicle.position.latitude,
    lng: vehicle.position.longitude
  };

  // calculate direction from bus to stop
  return window.google.maps.geometry.spherical.computeHeading(busLocation, nextLocation);
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

// isEquals function for comparing two objects
export const isEquals = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// function for smooth animation of bus movement which get two points and return array of points between them
export const getPointsBetween = (start, end) => {
  const ITERATIONS = 20;
  if (isEquals(start, end)) {
    console.log('start and end points are equal');
    return [];
  }
  const points = [];
  const startLat = Number(start.latitude);
  const startLng = Number(start.longitude);
  const endLat = Number(end.latitude);
  const endLng = Number(end.longitude);
  const latStep = (endLat - startLat) / ITERATIONS;
  const lngStep = (endLng - startLng) / ITERATIONS;
  for (let i = 0; i < ITERATIONS; i++) {
    points.push({
      latitude: startLat + latStep * i,
      longitude: startLng + lngStep * i,
    });
  }
  return points;
}