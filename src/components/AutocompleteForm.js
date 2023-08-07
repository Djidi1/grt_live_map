import React, {useCallback, useState} from "react";
import AutocompleteInput from "../AutocopleteInput";
import {extractBusNumbers} from "../helpers";

const AutocompleteForm = ({directionsService, setDirections, setDirectionRoutes}) => {
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const onDirectionsSubmit = useCallback(() => {
    if (directionsService && originAddress && destinationAddress) {
      const request = {
        origin: originAddress,
        destination: destinationAddress,
        travelMode: window.google.maps.TravelMode.TRANSIT,
      };

      directionsService.route(request, (response, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const routes = extractBusNumbers(response.routes);
          setDirectionRoutes(routes);
          setDirections(response);
        } else {
          console.error("Directions request failed:", status);
        }
      });
    }
  }, [directionsService, originAddress, destinationAddress, setDirectionRoutes, setDirections]);

  return (
    <div className="direction-form">
      <AutocompleteInput
        value={originAddress}
        onChange={setOriginAddress}
        onSelect={setOriginAddress}
        placeholder="Enter origin"
      />
      <AutocompleteInput
        value={destinationAddress}
        onChange={setDestinationAddress}
        onSelect={setDestinationAddress}
        placeholder="Enter destination"
      />
      <button className="get-direction-button" onClick={onDirectionsSubmit}>GO</button>
    </div>
  );
};

export default AutocompleteForm;