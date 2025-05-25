import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { FlatList } from 'react-native';
import { RootStackParamList } from './types'; // adjust path if needed
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
type MinyRouteProp = RouteProp<RootStackParamList, 'Miny'>;

const GRID_SIZE = 5;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

function generateGrid(MINE_COUNT: number): { isMine: boolean; revealed: boolean }[] {
  const grid = Array(TOTAL_TILES).fill(null).map(() => ({ isMine: false, revealed: false }));
  let minesPlaced = 0;
  while (minesPlaced < MINE_COUNT) {
    const index = Math.floor(Math.random() * TOTAL_TILES);
    if (!grid[index].isMine) {
      grid[index].isMine = true;
      minesPlaced++;
    }
  }
  return grid;
}

export default function Miny() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MinyRouteProp>();
  const { ileMin, betAmount } = route.params;
  const [grid, setGrid] = useState(generateGrid(ileMin));
  const [points, setPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [revealedTiles, setRevealedTiles] = useState(0);
  useEffect(() => {
  setPoints(betAmount);
}, [betAmount]);


  function minesMultiplier(bombs: number, revealed: number, edgePercent: number = 1.5): number {
    const total = 25;
    const safe = total - bombs;

    let multiplier = 1;

    for (let i = 0; i < revealed; i++) {
      const numerator = total - i;
      const denominator = safe - i;
      multiplier *= numerator / denominator;
    }
    const edgeFactor = 1 - (edgePercent / 100);
    multiplier *= edgeFactor;

    return parseFloat(multiplier.toFixed(4)); // rounded to 4 decimal places
  }

  function loseGame() {
    const updatedGrid = [...grid].map(tile => ({ ...tile, revealed: true }));
    setGrid(updatedGrid);
    setGameOver(true);
  }

  function revealTile(index: number) {
    if (grid[index].revealed || gameOver) return;
    const newGrid = [...grid];
    newGrid[index].revealed = true;
    
    if (newGrid[index].isMine) {
      /*
      Alert.alert('Boom!', 'You hit a mine!', [
      {
        text: 'Try Again',
        onPress: async () => {
          navigation.navigate('before_mines');
        }
      },
    ]);
    */
      loseGame();
      return;
    } else {
      const newMultiplier = minesMultiplier(ileMin, revealedTiles + 1);
      setMultiplier(newMultiplier);
      const newPoints = parseFloat((betAmount * newMultiplier).toFixed(4));
      setPoints(newPoints);
    }
    setRevealedTiles(prev => prev + 1);
    setGrid(newGrid);
  }

  

  
  function cashOut() {
    Alert.alert('Cash Out', `You won ${points} points!`, [
      {
        text: 'OK',
        onPress: async () => {
          try {
            const currentUser = auth().currentUser;
            if (!currentUser) {
              throw new Error('No user is currently signed in.');
            }

            const userRef = firestore().collection('users').doc(currentUser.uid);
            await userRef.update({
              points: firestore.FieldValue.increment(points),
            });
            loseGame();
          } catch (error:any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.points}>Points: {points}</Text>

      <FlatList
        data={grid}
        keyExtractor={(_, index) => index.toString()}
        numColumns={5}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.tile, item.revealed && (item.isMine ? styles.mine : styles.safe)]}
            onPress={() => revealTile(index)}
          >
            {item.revealed ? (
              <Text style={{ fontSize: 18 }}>
                {item.isMine ? '💣' : '⭐'}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.grid}
        scrollEnabled={false} // prevents scrolling and helps layout stay fixed
      />
      {!gameOver && (
        <TouchableOpacity onPress={cashOut} style={styles.cashOut}>
          <Text style={{ color: 'white', fontWeight: 'bold' , fontSize: 20}}>Cash Out</Text>
        </TouchableOpacity>)
      }
      {gameOver && (
        <TouchableOpacity
          onPress={() => navigation.navigate('BeforeMines')}
          style={[styles.cashOut, { backgroundColor: '#e91e63' }]}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' , fontSize: 20}}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const tileSize = Dimensions.get('window').width / GRID_SIZE - 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    backgroundColor: '#f5f5f5',
  },
  points: {
    fontSize: 24,
    marginBottom: 20,
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    width: tileSize,
    height: tileSize,
    margin: 2,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  safe: {
    backgroundColor: '#4caf50',
  },
  mine: {
    backgroundColor: '#f44336',
  },
  cashOut: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#2196f3',
    paddingHorizontal: 60,
    paddingVertical: 30,
    borderRadius: 8,
  },
});

