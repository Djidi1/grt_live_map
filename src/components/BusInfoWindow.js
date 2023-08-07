import React from "react";
import {getBusDirection} from "../helpers";
import {InfoWindow} from "@react-google-maps/api";
import {VEHICLE_STATUS} from "../constants";

const BusInfoWindow = ({selectedBus, busInfoData, stopsData, setSelectedBus, setBusInfoData}) => {

  const onBusInfoClose = () => {
    setSelectedBus(null);
    setBusInfoData([]);
  }

  return (
    <InfoWindow
      position={{
        lat: Number(selectedBus.vehicle.position.latitude),
        lng: Number(selectedBus.vehicle.position.longitude),
      }}
      onCloseClick={onBusInfoClose}
    >
      <div>
        <h3>Route: {selectedBus.vehicle.trip.routeId}</h3>
        <p><b>Status:</b> {VEHICLE_STATUS[selectedBus.vehicle.currentStatus]}</p>
        <p><b>Stop #:</b> {selectedBus.vehicle.currentStopSequence}</p>
        <p><b>Start Time:</b> {selectedBus.vehicle.trip.startTime}</p>
        {busInfoData && busInfoData.stopTimes ? (
          <table>
            <thead>
            <tr>
              <th></th>
              <th>Stop&nbsp;#</th>
              <th>Intersection</th>
              <th>ETA</th>
            </tr>
            </thead>
            <tbody>
            {busInfoData.stopTimes
              .filter(item => item.StopSequence > selectedBus.vehicle.currentStopSequence)
              .map(item => {
                const direction = getBusDirection({stopId: item.StopId, selectedBus, stopsData});
                return (
                  <tr key={item.StopSequence}>
                    <td>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <g fill="#4499FF" transform={`rotate(${direction - 90})`} transform-origin="12px 12px">
                          <path d="M24 12l-12-8v5h-12v6h12v5z"/>
                        </g>
                      </svg>
                    </td>
                    <td>{item.StopSequence}</td>
                    <td>{item.Name}</td>
                    <td>in {item.Minutes} min [at {item.ScheduleTime.substring(0, 5)}]</td>
                  </tr>
                )
              })}
            {busInfoData.stopTimes
                .filter(item => item.StopSequence > selectedBus.vehicle.currentStopSequence).length === 0
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
  )
}

export default BusInfoWindow;