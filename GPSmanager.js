const gpsData = {
    "The Twilight Zone Tower of Terror": [48.866703033447266, 2.7787489891052246],
    "Ratatouille: The Adventure": [48.86786547765368, 2.775782423708417],
    "RC Racer": [48.866800139700445, 2.7764343732603214],
    "Cars ROAD TRIP": [48.86660691224932, 2.7756364648535348],
    "Slinky® Dog Zigzag Spin": [48.867098380606066, 2.7767652133314202],
    "Toy Soldiers Parachute Drop": [48.86712778454274, 2.777387971112324],
    "Cars Quatre Roues Rallye": [48.86767565473343, 2.7779523453512667],
    "Crush's Coaster": [48.86810190519432, 2.777864770038345],
    "Spider-Man W.E.B. Adventure": [48.86609405375448, 2.779168336184876],
    "Avengers Assemble: Flight Force": [48.86510747387417, 2.7797525045615634],
    "Les Tapis Volants - Flying Carpets Over Agrabah®": [48.8682989272916, 2.77835129955442],
    "Phantom Manor": [48.87112328183563, 2.77681590682777],
    "Frontierland Playground": [48.870362312110764, 2.7742255292556184],
    "Big Thunder Mountain": [48.87186893919559, 2.7750581893586186],
    "Thunder Mesa Riverboat Landing": [48.871324365913125, 2.776562379447305],
    "Disneyland Railroad Discoveryland Station": [48.87470993432025, 2.7780483391688016],
    "Pirate Galleon": [48.872915441269775, 2.7737523780541995],
    "Princess Pavilion": [48.874764683881565, 2.775570856807539],
    "Disneyland Railroad Fantasyland Station": [48.8745650343242, 2.7735873087393426],
    "Disneyland Railroad Main Street Station": [48.870376000707125, 2.777978689706687],
    "Pirates' Beach": [48.87274383737593, 2.7738213800925604],
    "Star Wars Hyperspace Mountain": [48.87378513143601, 2.7787844494038363],
    "Main Street Vehicles": [48.87138080589127, 2.778897105827302],
    "Mickey’s PhilharMagic": [48.87464566872985, 2.7798786824694983],
    "Le Pays des Contes de Fées": [48.875447781201785, 2.7747408520458334],
    "Dumbo the Flying Elephant": [48.874186868438784, 2.774618796102862],
    "Le Passage Enchanté d'Aladdin": [48.872737431687234, 2.7754653808482197],
    "La Tanière du Dragon": [48.87301968353111, 2.7761949658426106],
    "Rustler Roundup Shootin' Gallery": [48.8716737100337, 2.7755404479534764],
    "Adventure Isle": [48.872821861080375, 2.7735770797565786],
    "Les Voyages de Pinocchio": [48.873683703538624, 2.775219350181369],
    "Indiana Jones™ and the Temple of Peril": [48.87251258474493, 2.772498145069417],
    "Alice's Curious Labyrinth": [48.87452195075809, 2.774523902813188],
    '"it\'s a small world"': [48.87478306805849, 2.7760105648681503],
    "Orbitron®": [48.87372824508264, 2.7783659212305287],
    "Mickey's Dazzling Christmas Parade!":[48.87448133911006, 2.7764984521200886],
    "Disney Stars on Parade " : [48.87448133911006, 2.7764984521200886],
    "Disney Dreams Nighttime Extravaganza": [48.873178471934615, 2.7761040494329556],
    "Mickey and the Magician ": [48.868062128238705, 2.7788747574632655],
    "Pirates of the Caribbean": [48.87362576151352, 2.7733853060981013],
    "Le Carrousel de Lancelot ": [48.8738280244298, 2.7751938284642943],
    "Les Mystères du Nautilus": [48.87352363707439, 2.7795460735660913],
    "La Cabane des Robinson": [48.8726016492176, 2.773880163435563],
    "Mad Hatter's Tea Cups": [48.87452954786432, 2.7750794031579633],
    "Casey Jr. – le Petit Train du Cirque": [48.8755772982577, 2.77463783685399],
    "Disneyland Railroad": [48.870376000707125, 2.777978689706687],
    "Disneyland Railroad Frontierland Depot": [48.87040341343105, 2.772222563792815],
    "Welcome to Starport: A Star Wars Encounter": [48.8738692177287, 2.7791274775700288],
    "The Lion King: Rhythms of the Pride Lands": [48.87046602799576, 2.7726886325373363],
    "Star Tours: The Adventures Continue*": [48.874753199744674, 2.7788727946379046],
    "Buzz Lightyear Laser Blast": [48.87357307348586, 2.777990380195868],
    "Blanche-Neige et les Sept Nains®": [48.873543880390216, 2.7752430732123115],
    "Magic Over Disney: a nighttime show to the rhythm of Disney and Pixar …": [48.87320720310233, 2.776120601621975],
    "Let’s Sing Christmas!": [48.8742493032095, 2.7785506026795534],
    "Avengers: Power the Night":[48.866522101311816, 2.7790717373782634],
    "Guardians of the Galaxy: Dance Challenge! " : [48.86563485737283, 2.779473196907659],
    "TOGETHER: a Pixar Musical Adventure" : [48.86691791891933, 2.7793270647056],
    "Stitch Live!": [48.86696813206681, 2.7793949025175486],
    "Frozen: A Musical Invitation": [48.86730973145833, 2.778621210068507],
    "The Disney Junior Dream Factory":[48.866986690063904, 2.7802824620380364],
    "Peter Pan's Flight": [48.87399417229297, 2.7741239801963204],
    "Meet Mickey Mouse": [48.874452793615724, 2.7738771890761598],
    "Autopia, presented by Avis" : [48.874010569157576, 2.7784838310054094],
};

function updateAttractionGPS(attraction) {
    const coordinates = gpsData[attraction.name];
    if (coordinates) {
        attraction.coordinates = coordinates;
    }
    return attraction;
}
function updateShowGPS(showData) {
    const coordinates = gpsData[showData.name];
    if (coordinates) {
        showData.coordinates = coordinates;
    }
    return showData;
}

module.exports = {
    updateAttractionGPS,
    updateShowGPS,
};