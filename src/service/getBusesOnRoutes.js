import axios from 'axios';
import {getPointsBetween} from "../helpers";

const API_BUSES_URL = 'https://rugged-alcove-395021.uc.r.appspot.com/buses/';
// const API_BUSES_URL = 'http://localhost:8080/buses/';

let prevBuses = [];
export const getBusesOnRoutes = (directionRoutes, setBuses) => {
    const fetchBuses = async () => {
        try {
            const routeIds = directionRoutes.join("|");
            if (routeIds === "") {
                setBuses([]);
                return;
            }
            const response = await axios.get(API_BUSES_URL + routeIds, {
                timeout: 3000
            });
            const buses = response.data;
            const currentBuses = (buses.length > 0 && prevBuses.length > 0) ? buses.map((bus) => {
                const prevBus = prevBuses.find((prevBus) => prevBus.id === bus.id);
                if (!prevBus) {
                    return bus;
                }
                const points = getPointsBetween(prevBus.vehicle.position, bus.vehicle.position);
                return {
                    ...bus,
                    vehicle: {
                        ...bus.vehicle,
                        points
                    }
                }
            }) : buses;
            prevBuses = currentBuses;
            setBuses(currentBuses);
        } catch (error) {
            console.error("Error fetching GTFS data:", error.message);
        }
    };

    fetchBuses().then(r => r);
}