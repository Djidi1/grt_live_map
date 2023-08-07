import React, {useState} from "react";
import {Marker} from "@react-google-maps/api";
import {getMarkerIcon} from "../helpers";
import {BusInfoWindow} from "./index";
import {getBusInfo} from "../service/getBusInfo";

const BusMarkers = ({buses, stopsData}) => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [busInfoData, setBusInfoData] = useState([]);
  const handleBusClick = (entity) => {
    setSelectedBus(entity);
    const params = {
      tripId: entity.vehicle.trip.tripId,
      vehicleId: entity.id,
      setBusInfoData: setBusInfoData
    }
    getBusInfo(params);
  };
  return (
    <>
      {buses.map(({id, vehicle}) => (
          <Marker
            key={id}
            position={{
              lat: Number(vehicle.position.latitude),
              lng: Number(vehicle.position.longitude),
            }}
            onClick={() => handleBusClick({id, vehicle})}
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
        <BusInfoWindow
          selectedBus={selectedBus}
          busInfoData={busInfoData}
          stopsData={stopsData}
          setSelectedBus={setSelectedBus}
          setBusInfoData={setBusInfoData}
        />
      )}
    </>)
}

export default BusMarkers;