import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentGame, findWord, saveGame } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [selectedStart, setSelectedStart] = useState<{ row: number; col: number } | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<{ row: number; col: number } | null>(null);

  // Animation values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const gridOrigin = useSharedValue({ x: 0, y: 0 });
  const cellSizeSV = useSharedValue(28);
  const gridSizeSV = useSharedValue({ rows: 0, cols: 0 });
  const selectionStart = useSharedValue<{ row: number; col: number } | null>(null);
  const lastSelectedRow = useSharedValue(-1);
  const lastSelectedCol = useSharedValue(-1);

  // Calculate cell size based on grid size
  const getCellSize = useCallback(() => {
    if (!currentGame) return 28;
    const gridSize = parseInt(currentGame.gridSize.split('x')[0], 10);

    if (gridSize >= 20) return 16;
    if (gridSize >= 15) return 20;
    return 28;
  }, [currentGame]);

  const cellSize = getCellSize();
  const [gridWidth = 0, gridHeight = 0] = currentGame
    ? currentGame.gridSize.split('x').map(Number)
    : [0, 0];

  const selectedCells = new Set<string>();
  if (selectedStart && selectedEnd) {
    const dRow = selectedEnd.row - selectedStart.row;
    const dCol = selectedEnd.col - selectedStart.col;
    const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
    if (steps > 0) {
      const rowStep = dRow / steps;
      const colStep = dCol / steps;
      if (Number.isInteger(rowStep) && Number.isInteger(colStep)) {
        for (let i = 0; i <= steps; i++) {
          selectedCells.add(`${selectedStart.row + i * rowStep}-${selectedStart.col + i * colStep}`);
        }
      }
    }
  } else if (selectedStart) {
    selectedCells.add(`${selectedStart.row}-${selectedStart.col}`);
  }

  const foundColors = new Map<string, string>();
  if (currentGame) {
    Object.values(currentGame.gameState.foundWords).forEach((data) => {
      data.positions.forEach((pos) => {
        const key = `${pos.row}-${pos.col}`;
        if (!foundColors.has(key)) {
          foundColors.set(key, data.color);
        }
      });
    });
  }

  const handleSelectionEnd = useCallback(
    async (x: number, y: number) => {
      if (!currentGame) return;

      const start = selectionStart.value;
      if (!start) {
        setSelectedStart(null);
        setSelectedEnd(null);
        return;
      }

      const origin = gridOrigin.value;
      const size = cellSizeSV.value;
      const endRow = Math.floor((y - origin.y) / size);
      const endCol = Math.floor((x - origin.x) / size);

      if (
        endRow < 0 ||
        endRow >= gridHeight ||
        endCol < 0 ||
        endCol >= gridWidth
      ) {
        setSelectedStart(null);
        setSelectedEnd(null);
        selectionStart.value = null;
        return;
      }

      const dRow = endRow - start.row;
      const dCol = endCol - start.col;
      const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
      if (steps === 0) {
        setSelectedStart(null);
        setSelectedEnd(null);
        selectionStart.value = null;
        return;
      }

      const rowStep = dRow / steps;
      const colStep = dCol / steps;
      if (!Number.isInteger(rowStep) || !Number.isInteger(colStep)) {
        setSelectedStart(null);
        setSelectedEnd(null);
        selectionStart.value = null;
        return;
      }

      const positions: { row: number; col: number }[] = [];
      let selectedWord = '';
      for (let i = 0; i <= steps; i++) {
        const r = start.row + i * rowStep;
        const c = start.col + i * colStep;
        positions.push({ row: r, col: c });
        selectedWord += currentGame.gameState.grid[r][c];
      }

      const reversed = selectedWord.split('').reverse().join('');
      const match = currentGame.wordList.find((w) => w === selectedWord || w === reversed);

      if (match && !currentGame.gameState.foundWords[match]) {
        const matchPositions = match === reversed ? positions.slice().reverse() : positions;
        await findWord(match, matchPositions);
      }

      setSelectedStart(null);
      setSelectedEnd(null);
      selectionStart.value = null;
    },
    [currentGame, findWord, gridOrigin, cellSizeSV, selectionStart, gridHeight, gridWidth]
  );

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      startScale.value = savedScale.value;
      startX.value = savedTranslateX.value;
      startY.value = savedTranslateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newScale = Math.max(0.5, Math.min(startScale.value * event.scale, 3));
      scale.value = newScale;

      const focalX = event.focalX - SCREEN_WIDTH / 2;
      const focalY = event.focalY - SCREEN_HEIGHT / 2;
      translateX.value = startX.value + (focalX * (1 - newScale / startScale.value));
      translateY.value = startY.value + (focalY * (1 - newScale / startScale.value));
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onBegin(() => {
      'worklet';
      startX.value = savedTranslateX.value;
      startY.value = savedTranslateY.value;
      if (scale.value <= 1) {
        selectionStart.value = null;
        lastSelectedRow.value = -1;
        lastSelectedCol.value = -1;
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (scale.value > 1) {
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;
      } else {
        const origin = gridOrigin.value;
        const size = cellSizeSV.value;

        const startXPos = event.x - event.translationX;
        const startYPos = event.y - event.translationY;

        if (selectionStart.value === null) {
          const startCol = Math.floor((startXPos - origin.x) / size);
          const startRow = Math.floor((startYPos - origin.y) / size);
          if (
            startRow >= 0 &&
            startRow < gridSizeSV.value.rows &&
            startCol >= 0 &&
            startCol < gridSizeSV.value.cols
          ) {
            selectionStart.value = { row: startRow, col: startCol };
            lastSelectedRow.value = startRow;
            lastSelectedCol.value = startCol;
            runOnJS(setSelectedStart)({ row: startRow, col: startCol });
          }
        }

        const col = Math.floor((event.x - origin.x) / size);
        const row = Math.floor((event.y - origin.y) / size);
        if (
          row >= 0 &&
          row < gridSizeSV.value.rows &&
          col >= 0 &&
          col < gridSizeSV.value.cols
        ) {
          if (row !== lastSelectedRow.value || col !== lastSelectedCol.value) {
            lastSelectedRow.value = row;
            lastSelectedCol.value = col;
            runOnJS(setSelectedEnd)({ row, col });
          }
        }
      }
    })
    .onEnd((event) => {
      'worklet';
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      } else {
        runOnJS(handleSelectionEnd)(event.x, event.y);
      }
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Reset zoom and pan when game changes
  useEffect(() => {
    if (currentGame) {
      const size = getCellSize();
      cellSizeSV.value = size;
      const [cols, rows] = currentGame.gridSize.split('x').map(Number);
      gridSizeSV.value = { rows, cols };
    }
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setSelectedStart(null);
    setSelectedEnd(null);
    selectionStart.value = null;
    lastSelectedRow.value = -1;
    lastSelectedCol.value = -1;
  }, [currentGame?._id]);

  useEffect(() => {
    // Check if all words are found
    if (currentGame) {
      const allWordsFound = currentGame.wordList.every((word) =>
        currentGame.gameState.foundWords[word]
      );

      if (allWordsFound && !isGameComplete) {
        setIsGameComplete(true);
        setShowConfetti(true);
        // Auto-hide confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentGame?.gameState.foundWords]);

  const handleBackPress = () => {
    if (!currentGame) return;

    Alert.alert(
      'Save Game?',
      'Do you want to save your progress before leaving?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: "Don't Save",
          style: 'destructive',
          onPress: () => router.back(),
        },
        {
          text: 'Save & Exit',
          onPress: async () => {
            try {
              await saveGame();
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to save game');
            }
          },
        },
      ]
    );
  };

  if (!currentGame) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading game...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={24} color="#00281F" />
          </TouchableOpacity>
          <Text style={styles.title}>Word Search</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.gameInfo}>
          <Text style={styles.categoryText}>{currentGame.category}</Text>
          <Text style={styles.gridSizeText}>{currentGame.gridSize} Grid</Text>
        </View>

        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut
          />
        )}

        {/* Zoomable and pannable game board */}
        <View style={styles.gameBoardContainer}>
          <GestureDetector gesture={composed}>
            <Animated.View style={[styles.gameBoard, animatedStyle]}>
              <View
                style={styles.grid}
                onLayout={(event) => {
                  const { x, y } = event.nativeEvent.layout;
                  gridOrigin.value = { x, y };
                }}
              >
                {currentGame.gameState.grid.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.row}>
                    {row.map((cell, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const isSelected = selectedCells.has(key);
                      const foundColor = foundColors.get(key);
                      return (
                        <View
                          key={`cell-${rowIndex}-${colIndex}`}
                          style={[
                            styles.cell,
                            { width: cellSize, height: cellSize },
                            foundColor && { backgroundColor: foundColor },
                            isSelected && { backgroundColor: 'rgba(139,92,246,0.3)' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.cellText,
                              { fontSize: Math.max(10, Math.floor(cellSize * 0.5)) },
                            ]}
                          >
                            {cell || ''}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Word list */}
        <View style={styles.wordList}>
          <Text style={styles.wordListTitle}>Words to Find:</Text>
          <View style={styles.wordsContainer}>
            {currentGame.wordList.map((word, index) => {
              const isFound = currentGame.gameState.foundWords[word];
              return (
                <Text
                  key={index}
                  style={[
                    styles.word,
                    isFound && styles.foundWord
                  ]}
                >
                  {word}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  gameBoardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameBoard: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  gameInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00281F',
    marginBottom: 4,
  },
  gridSizeText: {
    fontSize: 14,
    color: '#64748B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#00281F',
  },
  grid: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  wordList: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    maxHeight: 200,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  word: {
    fontSize: 16,
    marginRight: 12,
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    overflow: 'hidden',
  },
  foundWord: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
  },
  wordListTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#00281F',
  },
});
