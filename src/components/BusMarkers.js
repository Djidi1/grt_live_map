import React, {useEffect, useState} from "react";
import {Marker} from "@react-google-maps/api";
import {getBusDirectionOnRoute, getMarkerIcon} from "../helpers";
import {BusInfoWindow} from "./index";
import {getBusInfo} from "../service/getBusInfo";
import {getBusesOnRoutes} from "../service/getBusesOnRoutes";
import {REFRESH_TIMEOUT} from "../constants";


const CALLS_TIMEOUT = REFRESH_TIMEOUT * 1000;
const REPEATS = (CALLS_TIMEOUT / 1000) * 2;
const REPEATS_TIMEOUT = CALLS_TIMEOUT / REPEATS;

const moveBuses = (busesWithPoints, setMarkers) => {
    let repeats = 0;
    let busPoints = [];
    const interval = setInterval(() => {
        if (repeats > REPEATS) {
            clearInterval(interval);
            return;
        }
        repeats++;
        const updatedMarkers = busesWithPoints.map((marker) => {
            if (!marker.vehicle.points || marker.vehicle.points.length === 0) {
                return marker;
            }
            if (!busPoints[marker.id]) {
                busPoints[marker.id] = marker.vehicle.points;
            }
            const firstPoint = busPoints[marker.id].shift();
            return {
                ...marker,
                vehicle: {
                    ...marker.vehicle,
                    points: busPoints[marker.id],
                    position: firstPoint
                }
            };
        });
        setMarkers(updatedMarkers);
    }, REPEATS_TIMEOUT);
    return () => clearInterval(interval);
}

const BusMarkers = ({directionRoutes}) => {
    const [selectedBus, setSelectedBus] = useState(null);
    const [busInfoData, setBusInfoData] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [buses, setBuses] = useState([]); // buses on route

    // get buses on Route from directionRoutes
    useEffect(() => {
        if (directionRoutes.length === 0) {
            return;
        }
        getBusesOnRoutes(directionRoutes, setBuses);
        const interval = setInterval(() => {
            getBusesOnRoutes(directionRoutes, setBuses);
        }, CALLS_TIMEOUT);
        return () => clearInterval(interval);
    }, [directionRoutes]);

    useEffect(() => {
        const isSomeBusMoving = buses.some((bus) => bus.vehicle.points && bus.vehicle.points.length > 0);

        if (buses.length === 0 || !isSomeBusMoving) {
            setMarkers(buses);
            return;
        }

        const moveBusesInterval = moveBuses(buses, setMarkers);
        return () => moveBusesInterval();
    }, [buses]);

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
            {markers.map(({id, vehicle, nextStopLocation}) => {
                    const direction = getBusDirectionOnRoute({vehicle, nextStopLocation});
                    return (
                        <Marker
                            key={id}
                            position={{
                                lat: Number(vehicle.position.latitude),
                                lng: Number(vehicle.position.longitude),
                            }}
                            onClick={() => handleBusClick({id, vehicle})}
                            defaultAnimation={window.google.maps.Animation.DROP}
                            animation={window.google.maps.Animation.DROP}
                            // label={vehicle.trip.routeId}
                            label={{
                                text: vehicle.trip.routeId,
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "bold"
                            }}
                            icon={getMarkerIcon({routeId: vehicle.trip.routeId, direction})}
                        />
                    )
                }
            )}
            {selectedBus && (
                <BusInfoWindow
                    selectedBus={selectedBus}
                    busInfoData={busInfoData}
                    setSelectedBus={setSelectedBus}
                    setBusInfoData={setBusInfoData}
                />
            )}
        </>)
}

export default BusMarkers;