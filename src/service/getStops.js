import axios from 'axios';

const API_STOPS_URL = 'https://rugged-alcove-395021.uc.r.appspot.com/stops/';

// filter array of objects to be unique by value
const uniqueBy = (arr, fn) =>
    arr.reduce((acc, v) => {
        if (!acc.some(x => fn(v, x))) acc.push(v);
        return acc;
    }, []);

const getUniqueStops = (stops) => {
    return uniqueBy(stops, (a, b) => a.Code === b.Code);
}


export const getAllStops = (routeId, setStopsData) => {
    const fetchStops = async () => {
        try {
            const response = await axios.get(API_STOPS_URL+routeId);
            setStopsData((data) => getUniqueStops([...data, ...response.data]));
        } catch (error) {
            console.error("Error fetching GTFS data:", error.message);
        }
    };

    fetchStops().then(r => r);
}