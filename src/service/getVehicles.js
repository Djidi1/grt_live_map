import axios from "axios";

// const API_URL = "http://localhost:8080/proxy";
const API_URL = "https://rugged-alcove-395021.uc.r.appspot.com/proxy";

function getAllVehicles(setJsonData) {
    const fetchGTFSData = async () => {
        try {
            const response = await axios.get(API_URL);

            let entities = response.data.entity;

            // extract unique vehicle.trip.routeId from the top 3 results
            const uniqueRouteIds = [...new Set(entities.map((entity) => entity.vehicle.trip.routeId))];

            setJsonData({entities, uniqueRouteIds});
        } catch (error) {
            console.error("Error fetching GTFS data:", error.message);
        }
    };

    fetchGTFSData().then(r => r);
}

export default getAllVehicles;
