export type GridSize = '10x10' | '15x15' | '20x20';
export type Category = 'animals' | 'colors' | 'sports' | 'food';

export interface WordSearchPuzzle {
  id: string;
  category: Category;
  gridSize: GridSize;
  words: string[];
  grid: string[][];
}

// Helper function to generate a random ID
const generateId = (): string => Math.random().toString(36).substring(2, 15);

// Helper function to generate a grid with words placed randomly
const generateGrid = (size: number, words: string[]): string[][] => {
  // Create empty grid
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  
  // Place words
  for (const word of words) {
    placeWord(grid, word, size);
  }
  
  // Fill remaining spaces with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

// Word lists for each category
const wordLists = {
  animals: [
    'LION', 'TIGER', 'BEAR', 'WOLF', 'ZEBRA', 'GIRAFFE', 'ELEPHANT', 'MONKEY', 'GORILLA', 'PANDA',
    'KOALA', 'KANGAROO', 'HIPPO', 'RHINO', 'CROCODILE', 'ALLIGATOR', 'SNAKE', 'LIZARD', 'TURTLE', 'TURKEY',
    'EAGLE', 'HAWK', 'OWL', 'PARROT', 'PENGUIN', 'DOLPHIN', 'WHALE', 'SHARK', 'OCTOPUS', 'JELLYFISH'
  ],
  colors: [
    'RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'PINK', 'BROWN', 'BLACK', 'WHITE',
    'GRAY', 'GOLD', 'SILVER', 'BRONZE', 'TURQUOISE', 'INDIGO', 'VIOLET', 'MAROON', 'TEAL', 'OLIVE',
    'LIME', 'AQUA', 'NAVY', 'FUCHSIA', 'CORAL', 'SALMON', 'KHAKI', 'PLUM', 'TAN', 'BEIGE'
  ],
  sports: [
    'SOCCER', 'BASKETBALL', 'BASEBALL', 'FOOTBALL', 'TENNIS', 'GOLF', 'HOCKEY', 'VOLLEYBALL', 'RUGBY', 'CRICKET',
    'BADMINTON', 'SWIMMING', 'BOXING', 'WRESTLING', 'FENCING', 'ARCHERY', 'GYMNASTICS', 'DIVING', 'ROWING', 'SURFING',
    'SKIING', 'SNOWBOARDING', 'SKATING', 'CYCLING', 'RUNNING', 'JUMPING', 'THROWING', 'LACROSSE', 'HOCKEY', 'CURLING'
  ],
  food: [
    'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'STRAWBERRY', 'BLUEBERRY', 'WATERMELON', 'PINEAPPLE', 'MANGO', 'KIWI',
    'CARROT', 'BROCCOLI', 'POTATO', 'TOMATO', 'CUCUMBER', 'LETTUCE', 'SPINACH', 'ONION', 'GARLIC', 'PEPPER',
    'PIZZA', 'BURGER', 'PASTA', 'SUSHI', 'TACO', 'SALAD', 'SANDWICH', 'STEAK', 'CHICKEN', 'FISH'
  ]
};

// Generate puzzles for all categories and sizes
const generatePuzzles = (): WordSearchPuzzle[] => {
  const puzzles: WordSearchPuzzle[] = [];
  const categories: Category[] = ['animals', 'colors', 'sports', 'food'];
  const gridSizes: {size: number, name: GridSize}[] = [
    { size: 10, name: '10x10' },
    { size: 15, name: '15x15' },
    { size: 20, name: '20x20' }
  ];

  categories.forEach(category => {
    gridSizes.forEach(({size, name: gridSize}) => {
      // Generate 25 puzzles for each category and size
      for (let i = 0; i < 25; i++) {
        // Take a random sample of words (5-8 for 10x10, 10-12 for 15x15, 15-20 for 20x20)
        const minWords = gridSize === '10x10' ? 5 : gridSize === '15x15' ? 10 : 15;
        const maxWords = gridSize === '10x10' ? 8 : gridSize === '15x15' ? 12 : 20;
        const wordCount = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
        
        // Shuffle and take first wordCount words
        const shuffledWords = [...wordLists[category]]
          .sort(() => 0.5 - Math.random())
          .slice(0, wordCount);
        
        // Generate grid
        const grid = generateGrid(size, shuffledWords);
        
        puzzles.push({
          id: generateId(),
          category,
          gridSize,
          words: shuffledWords,
          grid
        });
      }
    });
  });

  return puzzles;
};

// Generate all puzzles (300 total: 4 categories × 3 sizes × 25 puzzles each)
const allPuzzles = generatePuzzles();

// Helper functions to get puzzles
export const getPuzzlesByCategoryAndSize = (category: Category, gridSize: GridSize): WordSearchPuzzle[] => {
  return allPuzzles.filter(puzzle => 
    puzzle.category === category && puzzle.gridSize === gridSize
  );
};

export const getRandomPuzzle = (): WordSearchPuzzle => {
  return allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
};

export const getRandomPuzzleByCategory = (category: Category): WordSearchPuzzle => {
  const categoryPuzzles = allPuzzles.filter(puzzle => puzzle.category === category);
  return categoryPuzzles[Math.floor(Math.random() * categoryPuzzles.length)];
};

export const getRandomPuzzleBySize = (gridSize: GridSize): WordSearchPuzzle => {
  const sizePuzzles = allPuzzles.filter(puzzle => puzzle.gridSize === gridSize);
  return sizePuzzles[Math.floor(Math.random() * sizePuzzles.length)];
};
