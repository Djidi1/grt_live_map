import React from "react";
import {InfoWindow} from "@react-google-maps/api";

const StopInfoWindow = ({selectedStop, setSelectedStop}) => {
  return (
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
  )
}

export default StopInfoWindow;