export type GridSize = '10x10' | '15x15' | '20x20';
export type Category =
  | 'animals'
  | 'colors'
  | 'sports'
  | 'food'
  | 'fruits'
  | 'vegetables'
  | 'countries'
  | 'cities'
  | 'movies'
  | 'music'
  | 'space'
  | 'nature'
  | 'jobs'
  | 'school'
  | 'body'
  | 'clothing'
  | 'transport'
  | 'technology'
  | 'holidays'
  | 'emotions';

export interface WordSearchPuzzle {
  id: string;
  category: Category;
  gridSize: GridSize;
  words: string[];
  grid: string[][];
}

export interface CategoryMeta {
  id: Category;
  name: string;
  icon: string;
  color: string;
}

// Helper function to generate a random ID
const generateId = (): string => Math.random().toString(36).substring(2, 15);

// Helper function to create an empty grid
const createEmptyGrid = (size: number): string[][] =>
  Array(size).fill(null).map(() => Array(size).fill(''));

// Helper function to generate a grid with words placed randomly
const generateGrid = (size: number, words: string[]): string[][] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let attempt = 0; attempt < 50; attempt++) {
    const grid = createEmptyGrid(size);
    let allPlaced = true;

    for (const word of words) {
      if (!placeWord(grid, word, size)) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      // Fill remaining spaces with random letters
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (!grid[i][j]) {
            grid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
          }
        }
      }
      return grid;
    }
  }

  // Fallback: return a grid with as many placed as possible
  const grid = createEmptyGrid(size);
  for (const word of words) {
    placeWord(grid, word, size);
  }
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) {
        grid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
  return grid;
};

// Helper function to place a single word in the grid
const placeWord = (grid: string[][], word: string, size: number): boolean => {
  const directions = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  const wordUpper = word.toUpperCase();
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Try a random direction
    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];

    // Calculate maximum starting position
    const maxRow = dx > 0 ? size - word.length : size - 1;
    const maxCol = dy > 0 ? size - word.length : size - 1;

    // Try random starting positions
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(Math.random() * (maxRow + 1));
      const col = Math.floor(Math.random() * (maxCol + 1));

      if (canPlaceWord(grid, wordUpper, row, col, dx, dy, size)) {
        // Place the word
        for (let i = 0; i < wordUpper.length; i++) {
          grid[row + i * dx][col + i * dy] = wordUpper[i];
        }
        return true;
      }
    }
  }

  return false; // Failed to place word after multiple attempts
};

// Helper function to check if a word can be placed at a position
const canPlaceWord = (
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dx: number,
  dy: number,
  size: number
): boolean => {
  // Check if word fits in grid
  const endRow = row + (word.length - 1) * dx;
  const endCol = col + (word.length - 1) * dy;

  if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
    return false;
  }

  // Check each cell
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dx;
    const c = col + i * dy;
    const cell = grid[r][c];

    // If cell is not empty and doesn't match the current letter
    if (cell && cell !== word[i]) {
      return false;
    }
  }

  return true;
};

// Word lists for each category (50 words each)
const wordLists: Record<Category, string[]> = {
  animals: [
    'LION', 'TIGER', 'BEAR', 'WOLF', 'ZEBRA', 'GIRAFFE', 'ELEPHANT', 'MONKEY', 'GORILLA', 'PANDA',
    'KOALA', 'KANGAROO', 'HIPPO', 'RHINO', 'CROCODILE', 'ALLIGATOR', 'SNAKE', 'LIZARD', 'TURTLE', 'TURKEY',
    'EAGLE', 'HAWK', 'OWL', 'PARROT', 'PENGUIN', 'DOLPHIN', 'WHALE', 'SHARK', 'OCTOPUS', 'JELLYFISH',
    'DOG', 'CAT', 'HORSE', 'SHEEP', 'GOAT', 'PIG', 'DUCK', 'GOOSE', 'CHICKEN', 'MOUSE',
    'RABBIT', 'DEER', 'FOX', 'BAT', 'BEAR', 'FROG', 'TOAD', 'ANT', 'BEE', 'BUTTERFLY'
  ],
  colors: [
    'RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'PINK', 'BROWN', 'BLACK', 'WHITE',
    'GRAY', 'GOLD', 'SILVER', 'BRONZE', 'TURQUOISE', 'INDIGO', 'VIOLET', 'MAROON', 'TEAL', 'OLIVE',
    'LIME', 'AQUA', 'NAVY', 'FUCHSIA', 'CORAL', 'SALMON', 'KHAKI', 'PLUM', 'TAN', 'BEIGE',
    'CREAM', 'IVORY', 'MAGENTA', 'CRIMSON', 'SCARLET', 'BURGUNDY', 'EMERALD', 'JADE', 'RUBY', 'AMBER',
    'COPPER', 'PEACH', 'MINT', 'LAVENDER', 'MUSTARD', 'COBALT', 'ROSE', 'SLATE', 'CHARCOAL', 'AZURE'
  ],
  sports: [
    'SOCCER', 'BASKETBALL', 'BASEBALL', 'FOOTBALL', 'TENNIS', 'GOLF', 'HOCKEY', 'VOLLEYBALL', 'RUGBY', 'CRICKET',
    'BADMINTON', 'SWIMMING', 'BOXING', 'WRESTLING', 'FENCING', 'ARCHERY', 'GYMNASTICS', 'DIVING', 'ROWING', 'SURFING',
    'SKIING', 'SNOWBOARDING', 'SKATING', 'CYCLING', 'RUNNING', 'JUMPING', 'THROWING', 'LACROSSE', 'CURLING', 'POLO',
    'DARTS', 'BILLIARDS', 'BOWLING', 'CHESS', 'SQUASH', 'HANDBALL', 'KAYAKING', 'SAILING', 'WEIGHTLIFTING', 'TRIATHLON',
    'MARATHON', 'SPRINT', 'RELAY', 'DISCUS', 'DISCGOLF', 'SHOOTING', 'EQUESTRIAN', 'FISHING', 'CLIMBING', 'YOGA'
  ],
  food: [
    'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'STRAWBERRY', 'BLUEBERRY', 'WATERMELON', 'PINEAPPLE', 'MANGO', 'KIWI',
    'CARROT', 'BROCCOLI', 'POTATO', 'TOMATO', 'CUCUMBER', 'LETTUCE', 'SPINACH', 'ONION', 'GARLIC', 'PEPPER',
    'PIZZA', 'BURGER', 'PASTA', 'SUSHI', 'TACO', 'SALAD', 'SANDWICH', 'STEAK', 'CHICKEN', 'FISH',
    'SOUP', 'BREAD', 'CHEESE', 'EGGS', 'RICE', 'NOODLES', 'PANCAKE', 'WAFFLE', 'CEREAL', 'COOKIE',
    'CAKE', 'PIE', 'ICECREAM', 'CHOCOLATE', 'CANDY', 'POPCORN', 'CHIPS', 'CRACKER', 'HONEY', 'JAM'
  ],
  fruits: [
    'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'STRAWBERRY', 'BLUEBERRY', 'WATERMELON', 'PINEAPPLE', 'MANGO', 'KIWI',
    'PEACH', 'PEAR', 'PLUM', 'CHERRY', 'LEMON', 'LIME', 'COCONUT', 'PAPAYA', 'GUAVA', 'FIG',
    'DATE', 'OLIVE', 'APRICOT', 'AVOCADO', 'CANTALOUPE', 'GRAPEFRUIT', 'MELON', 'NECTARINE', 'TANGERINE', 'POMEGRANATE',
    'RASPBERRY', 'BLACKBERRY', 'CRANBERRY', 'CURRANT', 'GOOSEBERRY', 'ELDERBERRY', 'DRAGONFRUIT', 'PASSIONFRUIT', 'LYCHEE', 'DURIAN',
    'MANDARIN', 'CLEMENTINE', 'PERSIMMON', 'QUINCE', 'JACKFRUIT', 'BREADFRUIT', 'STARFRUIT', 'HONEYDEW', 'BOYSENBERRY', 'ACAI'
  ],
  vegetables: [
    'CARROT', 'BROCCOLI', 'POTATO', 'TOMATO', 'CUCUMBER', 'LETTUCE', 'SPINACH', 'ONION', 'GARLIC', 'PEPPER',
    'CELERY', 'PEAS', 'BEANS', 'CORN', 'BEET', 'RADISH', 'TURNIP', 'LEEK', 'SCALLION', 'SHALLOT',
    'ASPARAGUS', 'EGGPLANT', 'ZUCCHINI', 'PUMPKIN', 'SQUASH', 'CABBAGE', 'CAULIFLOWER', 'BRUSSEL', 'KALE', 'ARUGULA',
    'CHARD', 'COLLARD', 'PARSNIP', 'RUTABAGA', 'ARTICHOKE', 'OKRA', 'FENNEL', 'ENDIVE', 'RHUBARB', 'BAMBOO',
    'MUSHROOM', 'OLIVE', 'PICKLE', 'GINGER', 'WASABI', 'SEAWEED', 'TARO', 'YAM', 'CASSAVA', 'PLANTAIN'
  ],
  countries: [
    'USA', 'CANADA', 'MEXICO', 'BRAZIL', 'ARGENTINA', 'CHILE', 'PERU', 'COLOMBIA', 'CUBA', 'JAMAICA',
    'ENGLAND', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN', 'PORTUGAL', 'GREECE', 'SWEDEN', 'NORWAY', 'DENMARK',
    'RUSSIA', 'CHINA', 'JAPAN', 'INDIA', 'THAILAND', 'VIETNAM', 'KOREA', 'EGYPT', 'KENYA', 'NIGERIA',
    'MOROCCO', 'TURKEY', 'IRAN', 'IRAQ', 'ISRAEL', 'JORDAN', 'SYRIA', 'POLAND', 'UKRAINE', 'ROMANIA',
    'HUNGARY', 'AUSTRIA', 'BELGIUM', 'SWITZERLAND', 'NETHERLANDS', 'FINLAND', 'ICELAND', 'IRELAND', 'SCOTLAND', 'WALES'
  ],
  cities: [
    'PARIS', 'LONDON', 'TOKYO', 'SEOUL', 'BEIJING', 'MOSCOW', 'BERLIN', 'MADRID', 'ROME', 'ATHENS',
    'OSLO', 'STOCKHOLM', 'HELSINKI', 'VIENNA', 'PRAGUE', 'WARSAW', 'BUDAPEST', 'BUCHAREST', 'SOFIA', 'ZAGREB',
    'CAIRO', 'LAGOS', 'NAIROBI', 'ACCRA', 'TRIPOLI', 'TUNIS', 'ALGIERS', 'RABAT', 'KHARTOUM', 'ADDIS',
    'BOMBAY', 'DELHI', 'BANGKOK', 'HANOI', 'MANILA', 'JAKARTA', 'TAIPEI', 'HONGKONG', 'SINGAPORE', 'DHAKA',
    'SYDNEY', 'MELBOURNE', 'PERTH', 'AUCKLAND', 'WELLINGTON', 'SUVA', 'HONOLULU', 'VANCOUVER', 'TORONTO', 'MONTREAL'
  ],
  movies: [
    'ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'THRILLER', 'SCIFI', 'FANTASY', 'WESTERN', 'MUSICAL',
    'ADVENTURE', 'ANIMATION', 'DOCUMENTARY', 'MYSTERY', 'CRIME', 'NOIR', 'BIOPIC', 'HISTORY', 'WAR', 'FAMILY',
    'ACTOR', 'ACTRESS', 'DIRECTOR', 'PRODUCER', 'SCREENPLAY', 'CINEMA', 'THEATER', 'BLOCKBUSTER', 'INDIE', 'SEQUEL',
    'PREQUEL', 'REMAKE', 'TRAILER', 'SCENE', 'SCRIPT', 'PLOT', 'TICKET', 'POPCORN', 'REVIEW', 'PREMIERE',
    'OSCAR', 'EMMY', 'GLOBE', 'FESTIVAL', 'BOXOFFICE', 'SOUNDTRACK', 'SPECIAL', 'CREDITS', 'STUDIO', 'CASTING'
  ],
  music: [
    'ROCK', 'POP', 'JAZZ', 'BLUES', 'CLASSICAL', 'COUNTRY', 'FOLK', 'REGGAE', 'HIP', 'RAP',
    'SOUL', 'FUNK', 'DISCO', 'METAL', 'PUNK', 'GOSPEL', 'LATIN', 'SALSA', 'TANGO', 'SWING',
    'GUITAR', 'PIANO', 'DRUMS', 'BASS', 'VIOLIN', 'CELLO', 'FLUTE', 'TRUMPET', 'SAXOPHONE', 'CLARINET',
    'SINGER', 'BAND', 'ALBUM', 'SINGLE', 'SONG', 'LYRICS', 'MELODY', 'CHORUS', 'VERSE', 'RHYTHM',
    'CONCERT', 'FESTIVAL', 'STAGE', 'MICROPHONE', 'RECORD', 'STUDIO', 'MIXER', 'PLAYLIST', 'RADIO', 'ACOUSTIC'
  ],
  space: [
    'STAR', 'PLANET', 'MOON', 'SUN', 'GALAXY', 'NEBULA', 'COMET', 'ASTEROID', 'METEOR', 'ORBIT',
    'ASTRONAUT', 'ROCKET', 'SHUTTLE', 'SATELLITE', 'TELESCOPE', 'COSMOS', 'UNIVERSE', 'ECLIPSE', 'GRAVITY', 'ATMOSPHERE',
    'MERCURY', 'VENUS', 'EARTH', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO', 'CERES',
    'CRATER', 'VOLCANO', 'RING', 'ICE', 'DUST', 'GAS', 'SOLAR', 'LUNAR', 'STELLAR', 'QUASAR',
    'BLACKHOLE', 'WORMHOLE', 'SUPERNOVA', 'CONSTELLATION', 'ZODIAC', 'COSMONAUT', 'MISSION', 'PROBE', 'LANDER', 'ROVER'
  ],
  nature: [
    'TREE', 'FLOWER', 'RIVER', 'MOUNTAIN', 'OCEAN', 'LAKE', 'FOREST', 'DESERT', 'BEACH', 'ISLAND',
    'ROCK', 'SAND', 'STONE', 'CAVE', 'WATERFALL', 'VALLEY', 'CANYON', 'HILL', 'PRAIRIE', 'MEADOW',
    'GRASS', 'BUSH', 'VINE', 'LEAF', 'ROOT', 'BRANCH', 'BARK', 'SEED', 'FRUIT', 'BERRY',
    'CLOUD', 'RAIN', 'SNOW', 'WIND', 'STORM', 'THUNDER', 'LIGHTNING', 'RAINBOW', 'SUNSHINE', 'FOG',
    'EARTH', 'FIRE', 'WATER', 'AIR', 'SEASON', 'WINTER', 'SPRING', 'SUMMER', 'AUTUMN', 'WILDLIFE'
  ],
  jobs: [
    'DOCTOR', 'NURSE', 'TEACHER', 'LAWYER', 'CHEF', 'DRIVER', 'PILOT', 'ACTOR', 'SINGER', 'ARTIST',
    'WRITER', 'REPORTER', 'EDITOR', 'PHOTOGRAPHER', 'DESIGNER', 'ENGINEER', 'PROGRAMMER', 'SCIENTIST', 'FARMER', 'BUTCHER',
    'BAKER', 'CARPENTER', 'PLUMBER', 'ELECTRICIAN', 'MECHANIC', 'POLICE', 'FIREFIGHTER', 'SOLDIER', 'SAILOR', 'NURSEMAID',
    'DENTIST', 'PHARMACIST', 'THERAPIST', 'COUNSELOR', 'ACCOUNTANT', 'BANKER', 'MANAGER', 'DIRECTOR', 'ASSISTANT', 'SECRETARY',
    'ARCHITECT', 'BUILDER', 'MASON', 'PAINTER', 'TAILOR', 'HAIRDRESSER', 'BARBER', 'VET', 'COACH', 'JUDGE'
  ],
  school: [
    'PENCIL', 'PEN', 'PAPER', 'BOOK', 'ERASER', 'RULER', 'SCISSORS', 'GLUE', 'MARKER', 'CRAYON',
    'DESK', 'CHAIR', 'BOARD', 'CHALK', 'LESSON', 'SUBJECT', 'MATH', 'SCIENCE', 'HISTORY', 'GEOGRAPHY',
    'ART', 'MUSIC', 'SPORT', 'LUNCH', 'RECESS', 'HOMEWORK', 'TEST', 'QUIZ', 'GRADE', 'EXAM',
    'STUDENT', 'TEACHER', 'PRINCIPAL', 'CLASSROOM', 'LIBRARY', 'CAFETERIA', 'GYM', 'LAB', 'LOCKER', 'BACKPACK',
    'CALCULATOR', 'COMPUTER', 'TABLET', 'PROJECTOR', 'NOTEBOOK', 'DICTIONARY', 'ATLAS', 'GLOBE', 'MAP', 'ALGEBRA'
  ],
  body: [
    'HEAD', 'ARM', 'LEG', 'HAND', 'FOOT', 'EYE', 'EAR', 'NOSE', 'MOUTH', 'LIP',
    'TOOTH', 'TONGUE', 'HAIR', 'NECK', 'CHEST', 'BACK', 'HEART', 'LUNG', 'LIVER', 'KIDNEY',
    'BRAIN', 'BONE', 'MUSCLE', 'SKIN', 'NAIL', 'FINGER', 'THUMB', 'KNUCKLE', 'WRIST', 'ELBOW',
    'SHOULDER', 'HIP', 'KNEE', 'ANKLE', 'TOE', 'HEEL', 'CHIN', 'FOREHEAD', 'CHEEK', 'JAW',
    'SPINE', 'RIB', 'ANKLE', 'PALM', 'SOLE', 'VEIN', 'NERVE', 'BLOOD', 'CELL', 'ORGAN'
  ],
  clothing: [
    'SHIRT', 'PANTS', 'DRESS', 'SKIRT', 'JACKET', 'COAT', 'SWEATER', 'HOODIE', 'BLAZER', 'SUIT',
    'TIE', 'BELT', 'SOCKS', 'SHOES', 'BOOTS', 'SANDALS', 'SLIPPERS', 'HAT', 'CAP', 'SCARF',
    'GLOVES', 'MITTENS', 'COAT', 'RAINCOAT', 'OVERCOAT', 'PAJAMAS', 'ROBE', 'BATHROBE', 'UNIFORM', 'APRON',
    'SHORTS', 'JEANS', 'TROUSERS', 'LEGGINGS', 'STOCKINGS', 'TIGHTS', 'BLOUSE', 'TOP', 'TANK', 'TEE',
    'NECKTIE', 'BOWTIE', 'SUSPENDERS', 'HEADBAND', 'HAIRPIN', 'GLASSES', 'SUNGLASSES', 'WATCH', 'RING', 'BRACELET'
  ],
  transport: [
    'CAR', 'TRUCK', 'BUS', 'BIKE', 'TRAIN', 'PLANE', 'BOAT', 'SHIP', 'TAXI', 'VAN',
    'MOTORCYCLE', 'SCOOTER', 'SUBWAY', 'TRAM', 'FERRY', 'YACHT', 'CANOE', 'KAYAK', 'RAFT', 'SAILBOAT',
    'WHEEL', 'TIRE', 'ENGINE', 'MOTOR', 'BRAKE', 'PEDAL', 'HANDLEBAR', 'SEAT', 'BELT', 'HORN',
    'ROAD', 'STREET', 'HIGHWAY', 'BRIDGE', 'TUNNEL', 'AIRPORT', 'STATION', 'DOCK', 'PORT', 'PIER',
    'TRAFFIC', 'SIGNAL', 'STOP', 'YIELD', 'GAS', 'DIESEL', 'ELECTRIC', 'HYBRID', 'HELICOPTER', 'BALLOON'
  ],
  technology: [
    'PHONE', 'TABLET', 'LAPTOP', 'COMPUTER', 'KEYBOARD', 'MOUSE', 'SCREEN', 'MONITOR', 'PRINTER', 'SCANNER',
    'INTERNET', 'EMAIL', 'WEBSITE', 'BROWSER', 'SEARCH', 'APP', 'SOFTWARE', 'HARDWARE', 'SERVER', 'CLOUD',
    'ROBOT', 'DRONE', 'SENSOR', 'CAMERA', 'MICROPHONE', 'SPEAKER', 'BATTERY', 'CABLE', 'WIFI', 'BLUETOOTH',
    'CHIP', 'CPU', 'MEMORY', 'DISK', 'DRIVE', 'DATA', 'FILE', 'FOLDER', 'CODE', 'BUG',
    'NETWORK', 'VIRUS', 'FIREWALL', 'HACKER', 'PASSWORD', 'LOGIN', 'SCREEN', 'PIXEL', 'RESOLUTION', 'VIRTUAL'
  ],
  holidays: [
    'CHRISTMAS', 'EASTER', 'HALLOWEEN', 'THANKS', 'NEWYEAR', 'VALENTINE', 'MOTHER', 'FATHER', 'BIRTHDAY', 'ANNIVERSARY',
    'WEDDING', 'GRADUATION', 'PROM', 'REUNION', 'PICNIC', 'BARBECUE', 'CARNIVAL', 'FESTIVAL', 'PARADE', 'FIREWORKS',
    'PRESENT', 'GIFT', 'CARD', 'CAKE', 'CANDLE', 'BALLOON', 'DECORATION', 'ORNAMENT', 'WREATH', 'TREE',
    'CANDY', 'TREAT', 'TRICK', 'COSTUME', 'MASK', 'PUMPKIN', 'TURKEY', 'STUFFING', 'GRAVY', 'CRANBERRY',
    'SANTA', 'REINDEER', 'SNOWMAN', 'ELF', 'SLEIGH', 'STOCKING', 'MISTLETOE', 'CAROL', 'NATIVITY', 'MENORAH'
  ],
  emotions: [
    'HAPPY', 'SAD', 'ANGRY', 'SCARED', 'SURPRISED', 'CONFUSED', 'EXCITED', 'BORED', 'TIRED', 'CALM',
    'PROUD', 'JEALOUS', 'EMBARRASSED', 'SHY', 'BRAVE', 'WORRIED', 'NERVOUS', 'RELAXED', 'GRATEFUL', 'LONELY',
    'LOVED', 'HATED', 'FEARED', 'HOPEFUL', 'DISAPPOINTED', 'FRUSTRATED', 'AMUSED', 'SILLY', 'SERIOUS', 'CURIOUS',
    'JOY', 'BLISS', 'ECSTASY', 'MELANCHOLY', 'GLOOM', 'RAGE', 'FURY', 'PANIC', 'ANXIETY', 'PEACE',
    'TRUST', 'DOUBT', 'SHAME', 'GUILT', 'ENVY', 'SYMPATHY', 'EMPATHY', 'PASSION', 'DESIRE', 'CONTENT'
  ],
};

export const categoryMeta: CategoryMeta[] = [
  { id: 'animals', name: 'Animals', icon: '🐾', color: '#10B981' },
  { id: 'colors', name: 'Colors', icon: '🎨', color: '#8B5CF6' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: '#F59E0B' },
  { id: 'food', name: 'Food', icon: '🍔', color: '#EF4444' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#10B981' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥕', color: '#F97316' },
  { id: 'countries', name: 'Countries', icon: '🌍', color: '#3B82F6' },
  { id: 'cities', name: 'Cities', icon: '🏙️', color: '#64748B' },
  { id: 'movies', name: 'Movies', icon: '🎬', color: '#EC4899' },
  { id: 'music', name: 'Music', icon: '🎵', color: '#8B5CF6' },
  { id: 'space', name: 'Space', icon: '🚀', color: '#0EA5E9' },
  { id: 'nature', name: 'Nature', icon: '🌿', color: '#10B981' },
  { id: 'jobs', name: 'Jobs', icon: '💼', color: '#F59E0B' },
  { id: 'school', name: 'School', icon: '📚', color: '#EF4444' },
  { id: 'body', name: 'Body', icon: '🦴', color: '#F97316' },
  { id: 'clothing', name: 'Clothing', icon: '👕', color: '#3B82F6' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#0EA5E9' },
  { id: 'technology', name: 'Tech', icon: '💻', color: '#64748B' },
  { id: 'holidays', name: 'Holidays', icon: '🎉', color: '#EC4899' },
  { id: 'emotions', name: 'Emotions', icon: '😊', color: '#F59E0B' },
];

// Generate puzzles for all categories and sizes
const generatePuzzles = (): WordSearchPuzzle[] => {
  const puzzles: WordSearchPuzzle[] = [];
  const categories = Object.keys(wordLists) as Category[];
  const gridSizes = [
    { size: 10, name: '10x10' as GridSize },
    { size: 15, name: '15x15' as GridSize },
    { size: 20, name: '20x20' as GridSize },
  ];

  for (const category of categories) {
    for (const { size, name: gridSize } of gridSizes) {
      // Generate 5 puzzles per category and size to keep startup fast
      for (let i = 0; i < 5; i++) {
        const wordCount = gridSize === '10x10' ? 11 : gridSize === '15x15' ? 15 : 25;

        // Filter out words longer than the grid and shuffle
        const shuffledWords = [...wordLists[category]]
          .filter((w) => w.length <= size)
          .sort(() => 0.5 - Math.random())
          .slice(0, wordCount);

        // Generate grid
        const grid = generateGrid(size, shuffledWords);

        puzzles.push({
          id: generateId(),
          category,
          gridSize,
          words: shuffledWords,
          grid,
        });
      }
    }
  }

  return puzzles;
};

const allPuzzles = generatePuzzles();

// Helper functions to get puzzles
export const getPuzzlesByCategoryAndSize = (category: Category, gridSize: GridSize): WordSearchPuzzle[] => {
  return allPuzzles.filter((puzzle) =>
    puzzle.category === category && puzzle.gridSize === gridSize
  );
};

export const getRandomPuzzle = (): WordSearchPuzzle => {
  return allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
};

export const getRandomPuzzleByCategory = (category: Category): WordSearchPuzzle => {
  const categoryPuzzles = allPuzzles.filter((puzzle) => puzzle.category === category);
  return categoryPuzzles[Math.floor(Math.random() * categoryPuzzles.length)];
};

export const getRandomPuzzleBySize = (gridSize: GridSize): WordSearchPuzzle => {
  const sizePuzzles = allPuzzles.filter((puzzle) => puzzle.gridSize === gridSize);
  return sizePuzzles[Math.floor(Math.random() * sizePuzzles.length)];
};
