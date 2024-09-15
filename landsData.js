const landsData = {
    "Discoveryland": ["Welcome to Starport: A Star Wars Encounter","Star Wars Hyperspace Mountain", "Mickey’s PhilharMagic","Buzz Lightyear Laser Blast", "Les Mystères du Nautilus","Orbitron®", "Star Tours: The Adventures Continue*","Disneyland Railroad Discoveryland Station","Autopia, presented by Avis"],
    "Fantasyland": ["Meet Mickey Mouse","Blanche-Neige et les Sept Nains®","Les Voyages de Pinocchio","Le Carrousel de Lancelot ",'"it\'s a small world"',"Peter Pan's Flight","Alice's Curious Labyrinth","Le Pays des Contes de Fées", "La Tanière du Dragon", "Dumbo the Flying Elephant", "Princess Pavilion","Disneyland Railroad Fantasyland Station", "Mad Hatter's Tea Cups", "Casey Jr. – le Petit Train du Cirque"],
    "Adventureland": ["Le Passage Enchanté d'Aladdin", , "Pirates of the Caribbean", "Indiana Jones™ and the Temple of Peril", "Adventure Isle", "La Cabane des Robinson", "Pirate Galleon","Pirates' Beach", "Disneyland Railroad"],
    "Frontierland": ["Big Thunder Mountain","Frontierland Playground","Rustler Roundup Shootin' Gallery","Phantom Manor","Disneyland Railroad Frontierland Depot", "Thunder Mesa Riverboat Landing",],
    "Main Street, U.S.A": ["Main Street Vehicles","Disneyland Railroad Main Street Station"],
    "Toon Studio": ["RC Racer","Crush's Coaster","Cars ROAD TRIP", "Cars Quatre Roues Rallye", "Les Tapis Volants - Flying Carpets Over Agrabah®", "Slinky® Dog Zigzag Spin","Ratatouille: The Adventure","Toy Soldiers Parachute Drop"],
    "Avengers Campus": ["Avengers Assemble: Flight Force", "Spider-Man W.E.B. Adventure"],
    "Production Courtyard" : ["The Twilight Zone Tower of Terror"]
};

function determineLand(attractionName) {
    for (const land in landsData) {
        if (landsData[land].includes(attractionName)) {
            return land;
        }
    }
    return null; // Retourne null si le land n'est pas trouvé
}
module.exports = {
    determineLand,
};