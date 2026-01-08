export type BaselPlace = {
  id: string;
  title: string;
  coordsText: string;
  lat: number;
  lon: number;
  description: string;
  image: any;
};

const IMG = {
  basel_minster: require('../assets/basel_minster.png'),
  basel_town_hall: require('../assets/basel_town_hall.png'),
  mittlere_bruecke: require('../assets/mittlere_bruecke.png'),
  tinguely_fountain: require('../assets/tinguely_fountain.png'),
  spalentor: require('../assets/spalentor.png'),
  botanical_garden: require('../assets/botanical_garden.png'),
  zoo_basel: require('../assets/zoo_basel.png'),
  kunstmuseum: require('../assets/kunstmuseum.png'),
  old_town: require('../assets/old_town.png'),
  roche_tower: require('../assets/roche_tower.png'),
  fondation_beyeler: require('../assets/fondation_beyeler.png'),
  elisabethenkirche: require('../assets/elisabethenkirche.png'),
  marktplatz: require('../assets/marktplatz.png'),
  paper_mill: require('../assets/paper_mill.png'),
  vitra_campus: require('../assets/vitra_campus.png'),
  rhine_promenade: require('../assets/rhine_promenade.png'),
  museum_tinguely: require('../assets/museum_tinguely.png'),
  three_countries_bridge: require('../assets/three_countries_bridge.png'),
  basel_university: require('../assets/basel_university.png'),
  st_alban: require('../assets/st_alban.png'),
};

export const BASEL_PLACES: BaselPlace[] = [
  {
    id: 'basel-minster',
    title: 'Basel Minster',
    coordsText: '47.5859° N, 7.5890° E',
    lat: 47.5859,
    lon: 7.589,
    image: IMG.basel_minster,
    description:
      'Basel Minster (Münster) is one of the city’s most famous landmarks, built between the 11th and 15th centuries in Romanesque and Gothic styles. Its twin towers and red-sandstone facade form a classic panorama over the Rhine. Inside you’ll find stained glass and artworks, while the crypt holds the tombs of local bishops. Climbing the tower rewards you with wide views of Basel and the river, making it a must-see for first-time visitors.',
  },
  {
    id: 'basel-town-hall',
    title: 'Basel Town Hall',
    coordsText: '47.5470° N, 7.5886° E',
    lat: 47.547,
    lon: 7.5886,
    image: IMG.basel_town_hall,
    description:
      'Basel Town Hall is a striking late-Gothic and Renaissance landmark on Marktplatz. Its bright red facade, ornate details, and painted courtyard are among the most photogenic scenes in the city. The building remains the seat of the cantonal government, blending a historical exterior with modern civic life. Step inside the courtyard to see frescoes, symbols, and architectural layers from different periods.',
  },
  {
    id: 'mittlere-bruecke',
    title: 'Mittlere Brücke (Middle Bridge)',
    coordsText: '47.5747° N, 7.5875° E',
    lat: 47.5747,
    lon: 7.5875,
    image: IMG.mittlere_bruecke,
    description:
      'Mittlere Brücke is one of the oldest Rhine crossings in Switzerland. The original bridge dates back to 1225, while today’s stone structure reflects later reconstruction. It connects Grossbasel and Kleinbasel and offers postcard-like views of the old town and cathedral. Locals come here for evening walks, photos, and the feeling of Basel’s rhythm flowing with the river.',
  },
  {
    id: 'tinguely-fountain',
    title: 'Tinguely Fountain',
    coordsText: '47.5449° N, 7.5880° E',
    lat: 47.5449,
    lon: 7.588,
    image: IMG.tinguely_fountain,
    description:
      'The Tinguely Fountain is a kinetic artwork by Swiss artist Jean Tinguely. Mechanical sculptures move, splash, and animate the water with playful energy. Located near Theaterplatz, it’s both a meeting point and a calm spot to watch motion and reflections. The fountain is especially atmospheric in the evening when the city lights enhance the metal forms.',
  },
  {
    id: 'spalentor',
    title: 'Spalentor (Spalen Gate)',
    coordsText: '47.5535° N, 7.5837° E',
    lat: 47.5535,
    lon: 7.5837,
    image: IMG.spalentor,
    description:
      'Spalentor is one of Basel’s most impressive medieval gates, built in the late 14th century. Once part of the defensive walls, it still feels monumental with its main tower and side turrets. Decorative elements and coats of arms reflect Basel’s former importance as a trading center. Today, it’s a memorable photo spot and a gateway into the atmosphere of the old city.',
  },
  {
    id: 'botanical-garden',
    title: 'Botanical Garden (University of Basel)',
    coordsText: '47.5581° N, 7.5878° E',
    lat: 47.5581,
    lon: 7.5878,
    image: IMG.botanical_garden,
    description:
      'The Botanical Garden of the University of Basel is one of the oldest in Switzerland. It hosts plants from multiple climate zones, with quiet paths, greenhouses, and rare species collections. It’s a peaceful break from city streets and a place to observe details: textures of leaves, unusual blooms, and tiny ecosystems. Perfect for a slow walk and a calm reset.',
  },
  {
    id: 'zoo-basel',
    title: 'Zoo Basel',
    coordsText: '47.5624° N, 7.5886° E',
    lat: 47.5624,
    lon: 7.5886,
    image: IMG.zoo_basel,
    description:
      'Basel Zoo is one of the oldest and most respected zoos in Switzerland. It offers a broad collection of animals and carefully designed habitats within a compact, walkable space. Families and visitors come for close encounters with wildlife and a well-organized route. It’s a classic Basel destination that combines learning, nature, and relaxed city leisure.',
  },
  {
    id: 'kunstmuseum',
    title: 'Kunstmuseum Basel',
    coordsText: '47.5585° N, 7.5885° E',
    lat: 47.5585,
    lon: 7.5885,
    image: IMG.kunstmuseum,
    description:
      'Kunstmuseum Basel is among Europe’s leading art museums, with a collection spanning early painting to modern masterpieces. Works by major artists are presented in a calm, curated flow that avoids overload. The museum highlights Basel’s strong cultural identity and its long relationship with art and collecting. Ideal for a focused visit and a deeper city experience.',
  },
  {
    id: 'old-town',
    title: 'Old Town (Altstadt)',
    coordsText: '47.5580° N, 7.5870° E',
    lat: 47.558,
    lon: 7.587,
    image: IMG.old_town,
    description:
      'Basel’s Old Town is a maze of cobblestone streets, historic facades, quiet squares, and small fountains. Many corners feel unchanged for centuries, yet the area is alive with cafés and local routines. This is where you feel the city’s layers: medieval forms, Renaissance details, and modern life in between. Slow walking here reveals the most.',
  },
  {
    id: 'roche-tower',
    title: 'Roche Tower',
    coordsText: '47.5726° N, 7.5889° E',
    lat: 47.5726,
    lon: 7.5889,
    image: IMG.roche_tower,
    description:
      'Roche Tower is the tallest building in Switzerland and a symbol of modern Basel. Its strict silhouette contrasts with the old town, showing how the city balances heritage with innovation. The tower anchors a newer business area near the Rhine, where urban development feels contemporary and clean. It’s a strong visual landmark from many viewpoints.',
  },
  {
    id: 'fondation-beyeler',
    title: 'Fondation Beyeler',
    coordsText: '47.5886° N, 7.6586° E',
    lat: 47.5886,
    lon: 7.6586,
    image: IMG.fondation_beyeler,
    description:
      'Fondation Beyeler in nearby Riehen is a world-renowned modern art museum. Designed by Renzo Piano, the building uses natural light and a calm layout so visitors can focus on the artwork. The collection includes iconic 20th-century artists and rotating exhibitions. The surrounding landscape adds a quiet, refined atmosphere to the visit.',
  },
  {
    id: 'elisabethenkirche',
    title: 'Elisabethenkirche',
    coordsText: '47.5516° N, 7.5906° E',
    lat: 47.5516,
    lon: 7.5906,
    image: IMG.elisabethenkirche,
    description:
      'Elisabethenkirche is a neo-Gothic church with steep forms and dark stone, standing out sharply in the city center. Built in the 19th century, it brings vertical lines and stained glass into a dense urban setting. Inside, the space feels restrained and calm, often used not only for worship but also for concerts and cultural events. It’s a quiet point in the middle of movement.',
  },
  {
    id: 'marktplatz',
    title: 'Marktplatz',
    coordsText: '47.5472° N, 7.5887° E',
    lat: 47.5472,
    lon: 7.5887,
    image: IMG.marktplatz,
    description:
      'Marktplatz is Basel’s central square and a daily living space, not just a tourist scene. Markets sell flowers, fruit, cheese, and local produce, while trams and people cross through in steady rhythm. Surrounded by important buildings like the Town Hall, the square is a natural hub for exploring the old town and feeling the city’s pace.',
  },
  {
    id: 'paper-mill-museum',
    title: 'Basel Paper Mill Museum',
    coordsText: '47.5609° N, 7.5993° E',
    lat: 47.5609,
    lon: 7.5993,
    image: IMG.paper_mill,
    description:
      'The Paper and Printing Museum shows Basel’s role in education, publishing, and craft traditions. Historic presses, workshops, and tools reveal how books and prints were created long before the digital era. The museum is interactive, letting visitors try hands-on processes and understand the patience behind old techniques. A great place to see the intellectual side of Basel.',
  },
  {
    id: 'vitra-campus',
    title: 'Vitra Campus',
    coordsText: '47.5946° N, 7.6102° E',
    lat: 47.5946,
    lon: 7.6102,
    image: IMG.vitra_campus,
    description:
      'Vitra Campus is an architectural destination where buildings by renowned architects are gathered in one area. It feels like an open-air museum of modern design—each structure with its own philosophy and mood. Walking through the campus is like moving between ideas and materials. Ideal for architecture lovers and photographers.',
  },
  {
    id: 'rhine-promenade',
    title: 'Rhine Promenade',
    coordsText: '47.5660° N, 7.5900° E',
    lat: 47.566,
    lon: 7.59,
    image: IMG.rhine_promenade,
    description:
      'The Rhine Promenade is one of the most loved everyday places in Basel. People walk, sit by the water, exercise, and meet friends. In summer, the river becomes part of daily life when locals float downstream. The promenade shows Basel as it truly is—calm, practical, and connected to the Rhine.',
  },
  {
    id: 'museum-tinguely',
    title: 'Museum Tinguely',
    coordsText: '47.5636° N, 7.6020° E',
    lat: 47.5636,
    lon: 7.602,
    image: IMG.museum_tinguely,
    description:
      'Museum Tinguely is dedicated to kinetic art and the works of Jean Tinguely. Exhibits often move, make sound, and interact with space, breaking the traditional idea of static museum silence. The building sits near the Rhine, adding a reflective, modern atmosphere. It’s a memorable experience even for those new to contemporary art.',
  },
  {
    id: 'three-countries-bridge',
    title: 'Three Countries Bridge',
    coordsText: '47.5930° N, 7.5910° E',
    lat: 47.593,
    lon: 7.591,
    image: IMG.three_countries_bridge,
    description:
      'The Three Countries Bridge (Dreiländerbrücke) is a modern pedestrian bridge linking the border region near Basel. Its elegant curve and open views make it a symbolic place of connection—between Switzerland, France, and Germany. Walking here feels spacious and calm, with the Rhine below and the skyline in the distance. Great for photos and sunset walks.',
  },
  {
    id: 'basel-university',
    title: 'University of Basel',
    coordsText: '47.5592° N, 7.5882° E',
    lat: 47.5592,
    lon: 7.5882,
    image: IMG.basel_university,
    description:
      'Founded in 1460, the University of Basel is Switzerland’s oldest university and a core part of the city’s identity. Its presence is felt through historic courtyards, libraries, and a steady student rhythm. The university connects Basel’s old intellectual tradition with modern research and innovation. A quiet walk around the area shows a different, thoughtful Basel.',
  },
  {
    id: 'st-alban',
    title: 'St. Alban District',
    coordsText: '47.5548° N, 7.6032° E',
    lat: 47.5548,
    lon: 7.6032,
    image: IMG.st_alban,
    description:
      'St. Alban is a charming historic district known for calm streets, old stone details, and a quieter atmosphere than the central squares. It’s a place for slow exploration—small bridges, water, and hidden corners. The area feels residential and authentic, showing Basel beyond the main tourist route. Perfect for a peaceful walk with a camera.',
  },
];
