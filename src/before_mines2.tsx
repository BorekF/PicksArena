// SelectBetScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // import route types

//type Navigation = NativeStackNavigationProp<RootStackParamList, 'SelectBet'>;
type BeforeMines2RouteProp = RouteProp<RootStackParamList, 'BeforeMines2'>;


const betOptions = [10, 25, 50, 100];

export default function BeforeMines2() {
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const route = useRoute<BeforeMines2RouteProp>();
      const { ileMin } = route.params;
      const [points, setPoints] = useState<number>(0);

      useEffect(() => {
            const fetchPoints = async () => {
                  const userId = auth().currentUser?.uid;
                  if (!userId) return;

                  const doc = await firestore().collection('users').doc(userId).get();
                  const userPoints = doc.data()?.points ?? 0;
                  setPoints(userPoints);
            };

            fetchPoints();
      }, []);

      const placeBet = async (amount: number) => {
            if (amount > points) {
                  Alert.alert('Not enough points to place this bet.');
                  return;
            }

            const userId = auth().currentUser?.uid;
            if (!userId) return;

            await firestore()
                  .collection('users')
                  .doc(userId)
                  .update({ points: points - amount });

            navigation.navigate('Miny', { ileMin: ileMin, betAmount: amount});
      };

      return (
            <View style={styles.container}>
                  <Text style={styles.title}>Select Your Bet</Text>
                  <Text style={styles.subtitle}>Available Points: {points}</Text>

                  {betOptions.map((amount) => (
                        <TouchableOpacity
                              key={amount}
                              style={styles.betButton}
                              onPress={() => placeBet(amount)}
                        >
                              <Text style={styles.betText}>{amount} Points</Text>
                        </TouchableOpacity>
                  ))}
            </View>
      );
}

const styles = StyleSheet.create({
      container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
      title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
      subtitle: { fontSize: 18, marginBottom: 30 },
      betButton: {
            backgroundColor: '#4caf50',
            padding: 15,
            marginVertical: 10,
            width: 200,
            borderRadius: 10,
            alignItems: 'center',
      },
      betText: { color: '#fff', fontSize: 18 },
});
