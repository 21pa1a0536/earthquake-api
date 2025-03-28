const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // Cache data for 60 seconds

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Max 5 requests per minute
    message: "Too many requests, please try again later.",
});

app.use(limiter);

app.get("/earthquakes", async (req, res) => {
    const cachedData = cache.get("earthquakes");
    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const response = await axios.get("https://earthquake.usgs.gov/fdsnws/event/1/query", {
            params: { format: "geojson", limit: 5 },
        });
        cache.set("earthquakes", response.data);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
