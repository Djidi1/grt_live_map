import React from "react";
import {Marker} from "@react-google-maps/api";
import CurrentLocationIcon from "../assets/current-location-icon.svg";

const MyLocationMarker = ({myLocation}) => {
    if (!myLocation) {
        return null;
    }
    return (
        <Marker
        position={{
            lat: myLocation.lat,
            lng: myLocation.lng,
        }}
        icon={{
            url: CurrentLocationIcon,
            scaledSize: new window.google.maps.Size(30, 30),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 15),
        }}
        />
    )
}

export default MyLocationMarker;