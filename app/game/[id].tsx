import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentGame, findWord, saveGame } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  
  // Animation values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  // Calculate cell size based on grid size
  const getCellSize = useCallback(() => {
    if (!currentGame) return 28;
    const gridSize = parseInt(currentGame.gridSize.split('x')[0], 10);
    
    if (gridSize >= 20) return 16;
    if (gridSize >= 15) return 20;
    return 28;
  }, [currentGame]);
  
  // Gesture handlers
  const pinchHandler = useAnimatedGestureHandler<any, { startScale: number }>({
    onStart: (_, ctx) => {
      ctx.startScale = savedScale.value;
    },
    onActive: (event, ctx) => {
      scale.value = Math.max(0.5, Math.min(ctx.startScale * event.scale, 3));
    },
    onEnd: () => {
      savedScale.value = scale.value;
    },
  });
  
  const panHandler = useAnimatedGestureHandler<any, { startX: number; startY: number }>({
    onStart: (_, ctx) => {
      ctx.startX = savedTranslateX.value;
      ctx.startY = savedTranslateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    },
  });
  
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
  
  // Combined gesture handler for pinch and pan
  const gestureHandler = useAnimatedGestureHandler<any, { startX: number; startY: number; startScale: number }>({
    onStart: (_, ctx) => {
      ctx.startX = savedTranslateX.value;
      ctx.startY = savedTranslateY.value;
      ctx.startScale = savedScale.value;
    },
    onActive: (event, ctx) => {
      if (event.numberOfPointers === 2) {
        // Pinch to zoom
        const newScale = Math.max(0.5, Math.min(ctx.startScale * event.scale, 3));
        scale.value = newScale;
        
        // Calculate focal point for zooming
        const focalX = event.focalX - SCREEN_WIDTH / 2;
        const focalY = event.focalY - SCREEN_HEIGHT / 2;
        
        // Adjust translation to zoom toward the focal point
        translateX.value = ctx.startX + (focalX * (1 - newScale / ctx.startScale));
        translateY.value = ctx.startY + (focalY * (1 - newScale / ctx.startScale));
      } else if (scale.value > 1) {
        // Pan only when zoomed in
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
      }
    },
    onEnd: () => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    },
  });
  
  // Reset zoom and pan when game changes
  useEffect(() => {
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [currentGame?.id]);

  useEffect(() => {
    // Check if all words are found
    if (currentGame) {
      const allWordsFound = currentGame.wordList.every(word => 
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

  const handleWordFound = (word: string, positions: { row: number; col: number }[]) => {
    if (!currentGame) return;
    findWord(word, positions);
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
          <Animated.View 
            style={[styles.gameBoard, animatedStyle]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              // Handle touch start if needed
            }}
            onResponderMove={(e) => {
              // Handle touch move if needed
            }}
          >
            <View style={styles.grid}>
              {currentGame.gameState.grid.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {row.map((cell, colIndex) => (
                    <View key={`${rowIndex}-${colIndex}`} style={styles.cell}>
                      <Text style={styles.cellText}>{cell || ''}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </Animated.View>
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
  word: {
    fontSize: 16,
    marginBottom: 5,
    color: '#334155',
  },
});
