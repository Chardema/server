require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const path = require('path');
const Ride = require('./models/Ride');
const AggregatedWaitTime = require('./models/AgregatedWaitTimes');
const Show = require('./models/Show');
const Restaurant = require('./models/Restaurant');
const gpsManager = require('./GPSmanager');
const land = require('./landsData');
const { addAttractionDescription } = require('./description');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const attractionTypes = {
    'Disneyland Railroad Discoveryland Station': 'Famille',
    'Disneyland Railroad Fantasyland Station': 'Famille',
    'Disneyland Railroad Main Street Station': 'Famille',
    'Disneyland Railroad': 'Famille',
    'Orbitron®': 'Famille',
    'Meet Mickey Mouse': 'Rencontre avec les personnages',
    'Frontierland Playground': 'Famille',
    'Disneyland Railroad Frontierland Depot': 'Famille',
    'Pirate Galleon': 'Sans file d’attente',
    'Indiana Jones™ and the Temple of Peril': 'Sensation',
    'La Cabane des Robinson': 'Sans file d’attente',
    'Big Thunder Mountain': 'Sensation',
    "Mad Hatter's Tea Cups": 'Famille',
    'Les Voyages de Pinocchio': 'Famille',
    'Casey Jr. – le Petit Train du Cirque': 'Famille',
    'Phantom Manor': 'Famille',
    'Star Wars Hyperspace Mountain': 'Sensation',
    'Star Tours: The Adventures Continue*': 'Sensation',
    'Thunder Mesa Riverboat Landing': 'Famille',
    "Alice's Curious Labyrinth": 'Sans file d’attente',
    "Buzz Lightyear Laser Blast": 'Famille',
    'Main Street Vehicles': 'Famille',
    "Peter Pan's Flight": 'Famille',
    'Princess Pavilion': 'Rencontre avec les personnages',
    'Dumbo the Flying Elephant': 'Famille',
    "Le Passage Enchanté d'Aladdin": 'Sans file d’attente',
    'Autopia®': 'Famille',
    'Le Carrousel de Lancelot ': 'Famille',
    'Les Mystères du Nautilus': 'Sans file d’attente',
    'La Tanière du Dragon': 'Sans file d’attente',
    "Rustler Roundup Shootin' Gallery": 'Famille',
    'Adventure Isle': 'Famille',
    'Welcome to Starport: A Star Wars Encounter': 'Rencontre avec les personnages',
    "Blanche-Neige et les Sept Nains®": 'Famille',
    "Mickey’s PhilharMagic": 'Famille',
    'Pirates of the Caribbean': 'Famille',
    '"it\'s a small world"': 'Famille',
    "Le Pays des Contes de Fées": 'Famille',
    "Pirates' Beach": 'Sans file d’attente',
    "Avengers Assemble: Flight Force": 'Sensation',
    "Cars ROAD TRIP": 'Famille',
    "Spider-Man W.E.B. Adventure": 'Famille',
    "Cars Quatre Roues Rallye": 'Famille',
    "Toy Soldiers Parachute Drop": 'Sensation',
    "RC Racer": 'Sensation',
    "The Twilight Zone Tower of Terror": 'Sensation',
    "Crush's Coaster": 'Sensation',
    "Ratatouille: The Adventure": 'Famille',
    "Slinky® Dog Zigzag Spin": 'Famille',
    "Les Tapis Volants - Flying Carpets Over Agrabah®": 'Famille',
};

function determineAttractionType(name) {
    return attractionTypes[name] || "Autre";
}

const fetchAndStoreData = async (forceUpdate = false) => {
    const disneylandUrl = 'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live';
    const studiosUrl = 'https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/live';
    const childrendisneylandUrl = 'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/children';
    const childrenstudiosUrl = 'https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/children';

    try {
        const [disneylandResponse, studiosResponse, childrendisneylandResponse, childrenstudiosResponse] = await Promise.all([
            axios.get(disneylandUrl),
            axios.get(studiosUrl),
            axios.get(childrendisneylandUrl),
            axios.get(childrenstudiosUrl)
        ]);

        const disneylandEntities = disneylandResponse.data.liveData;
        const studiosEntities = studiosResponse.data.liveData;
        const childrendisneylandEntities = childrendisneylandResponse.data.children;
        const childrenstudiosEntities = childrenstudiosResponse.data.children;

        const allAttractions = [...disneylandEntities, ...studiosEntities].filter(entity => entity.entityType === 'ATTRACTION');
        const allRestaurants = [...childrendisneylandEntities, ...childrenstudiosEntities].filter(entity => entity.entityType === 'RESTAURANT');
        const allShows = [...disneylandEntities, ...studiosEntities].filter(entity => entity.entityType === 'SHOW');

        for (const attraction of allAttractions) {
            const type = determineAttractionType(attraction.name);
            gpsManager.updateAttractionGPS(attraction);
            attraction.type = type;
            const landName = land.determineLand(attraction.name);
            attraction.land = landName;
            const attractionWithDescription = addAttractionDescription(attraction);
            await Ride.updateOrCreate(attractionWithDescription);
        }

        for (const show of allShows) {
            gpsManager.updateShowGPS(show);
            await Show.updateOrCreate(show);
        }

        for (const restaurant of allRestaurants) {
            await Restaurant.updateOrCreate(restaurant);
        }

        console.log('Mise à jour des attractions, des shows et des restaurants effectuée.');
    } catch (error) {
        console.error('Erreur lors de la récupération et du stockage des données:', error);
    }
};


setInterval(() => fetchAndStoreData(false), 60000);

app.get('/api/attractions', async (req, res) => {
    try {
        const attractions = await Ride.getAll();
        res.json(attractions.map(attraction => {
            const attractionObj = attraction.toObject();
            delete attractionObj.waitTimes; // Suppression du tableau waitTimes
            return {
                ...attractionObj,
                previousWaitTime: attraction.previousWaitTime,
                type: attraction.type,
                land: attraction.land
            };
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions:', error);
        res.status(500).send('Erreur serveur');
    }
});


app.get('/api/shows', async (req, res) => {
    try {
        const shows = await Show.getAll();
        res.json(shows);
    } catch (error) {
        console.error('Erreur lors de la récupération des shows:', error);
        res.status(500).send('Erreur serveur');
    }
});

app.get('/api/restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.getAll();
        res.json(restaurants);
    } catch (error) {
        console.error('Erreur lors de la récupération des restaurants:', error);
        res.status(500).send('Erreur serveur');
    }
});

app.post('/api/wait-times', async (req, res) => {
    const aggregatedData = req.body; // Les données envoyées par l'application Swift

    // Boucle pour enregistrer chaque entrée envoyée
    for (const attractionId in aggregatedData) {
        const averages = aggregatedData[attractionId];
        const { matin, midi, soir } = averages;

        try {
            const aggregatedWaitTime = new AggregatedWaitTime({
                attractionId: attractionId,
                attractionName: "Nom de l'attraction", // Ajoute le nom si nécessaire, sinon le supprimer du modèle
                matin: matin,
                midi: midi,
                soir: soir,
                date: new Date() // Enregistre la date actuelle
            });

            await aggregatedWaitTime.save();
        } catch (error) {
            console.error('Failed to save aggregated wait times:', error);
            res.status(500).json({ error: 'Failed to save aggregated wait times' });
            return;
        }
    }

    res.status(201).json({ message: 'Aggregated wait times saved successfully' });
});

app.get('/api/wait-times/average-period/:attractionId', async (req, res) => {
    const { attractionId } = req.params;

    try {
        const averages = await WaitTime.calculateAverageWaitTimeByPeriod(attractionId);
        res.json(averages);
    } catch (error) {
        console.error('Failed to fetch average wait times by period:', error);
        res.status(500).json({ error: 'Failed to fetch average wait times by period' });
    }
});
app.get('/api/wait-times', async (req, res) => {
    try {
        const aggregatedWaitTimes = await AggregatedWaitTime.find({});
        res.json(aggregatedWaitTimes);
    } catch (error) {
        console.error('Failed to fetch aggregated wait times:', error);
        res.status(500).json({ error: 'Failed to fetch aggregated wait times' });
    }
});



// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all handler to serve the React app for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, async () => {
    await fetchAndStoreData(true);
    console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
