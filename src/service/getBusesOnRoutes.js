import axios from 'axios';

const API_BUSES_URL = 'https://rugged-alcove-395021.uc.r.appspot.com/buses/';
// const API_BUSES_URL = 'http://localhost:8080/buses/';

export const getBusesOnRoutes = (directionRoutes, setBuses) => {
    const fetchStops = async () => {
        try {
            const routeIds = directionRoutes.join("|")
            const response = await axios.get(API_BUSES_URL+routeIds);
            setBuses(response.data);
        } catch (error) {
            console.error("Error fetching GTFS data:", error.message);
        }
    };

    fetchStops().then(r => r);
}