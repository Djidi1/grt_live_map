import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080; // Use the desired port for your backend server

app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.set('trust proxy', true);

// get Bus info from URL https://realtimemap.grt.ca/Stop/GetBusInfo?TripId=3259768&VehicleId=21513
app.get("/businfo/:TripId/:VehicleId", async (req, res) => {
    try {
        const apiUrl = `https://realtimemap.grt.ca/Stop/GetBusInfo?TripId=${req.params.TripId}&VehicleId=${req.params.VehicleId}`;

        const response = await fetch(apiUrl, {
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        });

        response.json().then(function (json) {
            res.json(json);
        });

    } catch (error) {
        console.error("Error proxying the request:", error.message);
        res.status(500).json({ error: "An error occurred while proxying the request." });
    }
});

// get all stops for a route by routeId

const getStopsOnRoute = async (routeId) => {
    try {
        const apiUrl = `https://realtimemap.grt.ca/Stop/GetByRouteId?routeId=${routeId}`;

        const response = await fetch(apiUrl, {
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        });

        return response.json();

    } catch (error) {
        console.error("Error proxying the request:", error.message);
        res.status(500).json({ error: "An error occurred while proxying the request." });
    }
}

app.get("/stops/:RouteId", async (req, res) => {
    const response = getStopsOnRoute(req.params.RouteId);
    response.then(function (json) {
        res.json(json);
    });
});

// get buses by RouteId
app.get("/buses/:RouteId", async (req, res) => {
    try {
        const stopsOnRoute = []
        const apiUrl = "https://webapps.regionofwaterloo.ca/api/grt-routes/api/vehiclepositions";
        const routeIDs = req.params.RouteId.split("|");

        await Promise.all(routeIDs.map(async (routeId) => {
            const stops = await getStopsOnRoute(routeId);
            stopsOnRoute.push(...stops);
        }));

        const response = await fetch(apiUrl, {
            headers: {
                "x-api-key": "<redacted>",
            },
        });
        if (!response.ok) {
            const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
            error.response = response;
            throw error;
            process.exit(1);
        }
        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );
        const busesOnRoute = feed.entity
            .filter((entity) => routeIDs.includes(entity.vehicle.trip.routeId));

        const apiBusInfo = (tripId, vehicleId) => `https://realtimemap.grt.ca/Stop/GetBusInfo?TripId=${tripId}&VehicleId=${vehicleId}`;
        const busOnRouteInfo = await Promise.all(busesOnRoute.map(async (bus) => {
            // get next stop by vehicle.id and tripID
            const busInfo = await fetch(apiBusInfo(bus.vehicle.trip.tripId, bus.id), {
                headers: { "Access-Control-Allow-Origin": "*" }
            });
            const busInfoJson = await busInfo.json();
            const nextStop = busInfoJson.stopTimes[0];
            const nextStopLocation = stopsOnRoute.find((stop) => stop.Code === nextStop?.Code);
            return { ...bus, nextStopLocation, nextStops: busInfoJson }
        }));

        // Send the response from the target API back to the frontend
        res.json(busOnRouteInfo);
    } catch (error) {
        console.error("Error proxying the request:", error.message);
        res.status(500).json({ error: "An error occurred while proxying the request." });
    }
});

app.get("/proxy", async (req, res) => {
    try {
        const apiUrl = "https://webapps.regionofwaterloo.ca/api/grt-routes/api/vehiclepositions";

        const response = (await fetch(apiUrl, {
            headers: {
                "x-api-key": "<redacted>",
            },
        }));
        if (!response.ok) {
            const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
            error.response = response;
            throw error;
            process.exit(1);
        }
        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        // Send the response from the target API back to the frontend
        res.json(feed);
    } catch (error) {
        console.error("Error proxying the request:", error.message);
        res.status(500).json({ error: "An error occurred while proxying the request." });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
