import axios from 'axios';

const API_STOPS_URL = 'https://rugged-alcove-395021.uc.r.appspot.com/stops/';

export const getAllStops = (routeId, setStopsData) => {
    const fetchStops = async () => {
        try {
            const response = await axios.get(API_STOPS_URL+routeId);
            setStopsData(response.data);
        } catch (error) {
            console.error("Error fetching GTFS data:", error.message);
        }
    };

    fetchStops().then(r => r);
}