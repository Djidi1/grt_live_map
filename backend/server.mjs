import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";

const app = express();
const port = 8080; // Use the desired port for your backend server

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

app.get("/proxy", async (req, res) => {
    try {
        const apiUrl = "https://webapps.regionofwaterloo.ca/api/grt-routes/api/vehiclepositions";

        const response = await fetch(apiUrl, {
            headers: {
                "x-api-key": "<redacted>",
                // replace with your GTFS-realtime source's auth token
                // e.g. x-api-key is the header value used for NY's MTA GTFS APIs
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
        feed.entity.forEach((entity) => {
            if (entity.tripUpdate) {
                console.log(entity.tripUpdate);
            }
        });

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
