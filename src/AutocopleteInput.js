import React from "react";
import PlacesAutocomplete from "react-places-autocomplete";

const AutocompleteInput = ({value, onChange, onSelect, placeholder}) => {
  const searchOptions = {
    locationRestriction: {
      south: 42.878563, // Latitude of the southernmost point
      west: -80.603076, // Longitude of the westernmost point
      north: 43.559515, // Latitude of the northernmost point
      east: -80.226378, // Longitude of the easternmost point
    },
  };
  // handle select all on focus
  const handleSelectAll = (event) => {
    event.target.select();
  }
  return (
    <PlacesAutocomplete value={value} onChange={onChange} onSelect={onSelect} searchOptions={searchOptions}>
      {({getInputProps, suggestions, getSuggestionItemProps}) => (
        <>
          <input className="get-direction-input" {...getInputProps({placeholder})} onClick={handleSelectAll}/>
          <div
            className="get-direction-input-suggestions"
            style={suggestions.length > 0 ? {display: "block"} : {display: "none"}}
          >
            {suggestions.map((suggestion, index) => (
              <div key={index} {...getSuggestionItemProps(suggestion)}>
                {suggestion.description}
              </div>
            ))}
          </div>
        </>
      )}
    </PlacesAutocomplete>
  );
};

export default AutocompleteInput;
