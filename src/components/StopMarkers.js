import React, {useState} from "react";
import {Marker} from "@react-google-maps/api";
import {StopInfoWindow} from "./index";

const StopMarkers = ({stopsData}) => {
  const [selectedStop, setSelectedStop] = useState(null);
  return (
    <>
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
        <StopInfoWindow
          selectedStop={selectedStop}
          setSelectedStop={setSelectedStop}
        />
      )}
    </>
  );
};

export default StopMarkers;