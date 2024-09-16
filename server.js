const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const path = require('path');
const Ride = require('./models/Ride');
const Show = require('./models/Show');
const Restaurant = require('./models/Restaurant');
const gpsManager = require('./GPSmanager');
const land = require('./landsData');
const { addAttractionDescription } = require('./description');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Optimized MongoDB connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}

// Fonction pour déterminer le type d'attraction
const attractionTypes = {
    'Disneyland Railroad Discoveryland Station': 'Famille',
    // ... (autres types d'attraction)
};

function determineAttractionType(name) {
    console.log(`Determining type for attraction: ${name}`);
    return attractionTypes[name] || "Autre";
}

// Fonction pour récupérer et stocker les données avec des logs
const fetchAndStoreData = async (forceUpdate = false) => {
    console.log('Fetching data from external APIs...');

    const disneylandUrl = 'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live';
    const studiosUrl = 'https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/live';
    const childrendisneylandUrl = 'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/children';
    const childrenstudiosUrl = 'https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/children';

    try {
        await dbConnect();

        const [disneylandResponse, studiosResponse, childrendisneylandResponse, childrenstudiosResponse] = await Promise.all([
            axios.get(disneylandUrl),
            axios.get(studiosUrl),
            axios.get(childrendisneylandUrl),
            axios.get(childrenstudiosUrl)
        ]);

        console.log('API responses received');
        console.log('Disneyland Response Status:', disneylandResponse.status);
        console.log('Studios Response Status:', studiosResponse.status);
        console.log('Children Disneyland Response Status:', childrendisneylandResponse.status);
        console.log('Children Studios Response Status:', childrenstudiosResponse.status);

        const disneylandEntities = disneylandResponse.data.liveData;
        const studiosEntities = studiosResponse.data.liveData;
        const childrendisneylandEntities = childrendisneylandResponse.data.children;
        const childrenstudiosEntities = childrenstudiosResponse.data.children;

        const allAttractions = [...disneylandEntities, ...studiosEntities].filter(entity => entity.entityType === 'ATTRACTION');
        const allRestaurants = [...childrendisneylandEntities, ...childrenstudiosEntities].filter(entity => entity.entityType === 'RESTAURANT');
        const allShows = [...disneylandEntities, ...studiosEntities].filter(entity => entity.entityType === 'SHOW');

        console.log(`Total Attractions: ${allAttractions.length}, Shows: ${allShows.length}, Restaurants: ${allRestaurants.length}`);

        // Log and store attractions
        for (const attraction of allAttractions) {
            const type = determineAttractionType(attraction.name);
            gpsManager.updateAttractionGPS(attraction);
            attraction.type = type;
            const landName = land.determineLand(attraction.name);
            attraction.land = landName;
            const attractionWithDescription = addAttractionDescription(attraction);

            try {
                const result = await Ride.updateOrCreate(attractionWithDescription);
                console.log(`Ride updated/created: ${attraction.name} (${result})`);
            } catch (error) {
                console.error(`Error updating/creating ride: ${attraction.name}`, error);
            }
        }

        // Log and store shows
        for (const show of allShows) {
            gpsManager.updateShowGPS(show);

            try {
                const result = await Show.updateOrCreate(show);
                console.log(`Show updated/created: ${show.name} (${result})`);
            } catch (error) {
                console.error(`Error updating/creating show: ${show.name}`, error);
            }
        }

        // Log and store restaurants
        for (const restaurant of allRestaurants) {
            try {
                const result = await Restaurant.updateOrCreate(restaurant);
                console.log(`Restaurant updated/created: ${restaurant.name} (${result})`);
            } catch (error) {
                console.error(`Error updating/creating restaurant: ${restaurant.name}`, error);
            }
        }

        console.log('Data fetch and store process completed successfully.');

    } catch (error) {
        console.error('Error fetching or storing data from external API:', error);
    }
};

// Appeler la fonction toutes les 60 secondes
setInterval(() => {
    console.log('Running periodic fetch and store...');
    fetchAndStoreData(false);
}, 60000);

// API routes

// Endpoint pour récupérer les attractions
app.get('/api/attractions', async (req, res) => {
    console.log('Fetching all attractions from MongoDB...');
    try {
        await dbConnect();
        const attractions = await Ride.getAll();
        res.json(attractions.map(attraction => {
            const attractionObj = attraction.toObject();
            delete attractionObj.waitTimes;
            console.log(`Attraction: ${attractionObj.name}`);
            return {
                ...attractionObj,
                previousWaitTime: attraction.previousWaitTime,
                type: attraction.type,
                land: attraction.land
            };
        }));
    } catch (error) {
        console.error('Error fetching attractions:', error);
        res.status(500).send('Error fetching attractions');
    }
});

// Endpoint pour récupérer les shows
app.get('/api/shows', async (req, res) => {
    console.log('Fetching all shows from MongoDB...');
    try {
        await dbConnect();
        const shows = await Show.getAll();
        res.json(shows);
    } catch (error) {
        console.error('Error fetching shows:', error);
        res.status(500).send('Error fetching shows');
    }
});

// Endpoint pour récupérer les restaurants
app.get('/api/restaurants', async (req, res) => {
    console.log('Fetching all restaurants from MongoDB...');
    try {
        await dbConnect();
        const restaurants = await Restaurant.getAll();
        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).send('Error fetching restaurants');
    }
});

app.get('/api/update-data', async (req, res) => {
    console.log('Manual update triggered');
    try {
        await fetchAndStoreData(false);
        res.status(200).send('Data update completed successfully');
    } catch (error) {
        console.error('Error during manual update:', error);
        res.status(500).send('Error during data update');
    }
});

// Serveur écoute
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await fetchAndStoreData(true);
    console.log('Initial data fetch completed');
});