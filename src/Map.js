import React from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

const Map = () => {
    const center = { lat: 51.505, lng: -0.09 }; // Initial map center

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyBjqp9kmhvyzsAiPp0PSMQPW5DdoXmcaxY", // Replace with your API key
    });

    if (loadError) return <div>Error loading Google Maps</div>;
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <GoogleMap
            mapContainerStyle={{ height: "500px", width: "100%" }}
            center={center}
            zoom={13}
        >
            {/* Add markers and info windows as needed */}
            <Marker position={center}>
                <InfoWindow>
                    <div>A marker here!</div>
                </InfoWindow>
            </Marker>
        </GoogleMap>
    );
};

export default Map;
