import axios from 'axios';

const API_BUS_INFO_URL = 'https://rugged-alcove-395021.uc.r.appspot.com/businfo/:TripId/:VehicleId';

export const getBusInfo = ({tripId, vehicleId, setBusInfoData}) => {
    const fetchBusInfo = async () => {
        try {
            if (!tripId || !vehicleId) {
                return;
            }
            const url = `${API_BUS_INFO_URL.replace(':TripId', tripId).replace(':VehicleId', vehicleId)}`;

            const response = await axios.get(url);
            setBusInfoData(response.data);
        } catch (error) {
            console.error("Error fetching bus info data:", error.message);
        }
    };

    fetchBusInfo().then(r => r);
}