// SelectBetScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // import route types

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BeforeMines'>;


const betOptions = [1, 2, 3, 4, 5];

export default function BeforeMines() {
  const navigation = useNavigation<Navigation>();
  const placeBet = async (amount: number) => {


    navigation.navigate('BeforeMines2', { ileMin: amount });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How many mines?</Text>

      {betOptions.map((amount) => (
        <TouchableOpacity
          key={amount}
          style={styles.betButton}
          onPress={() => placeBet(amount)}
        >
          <Text style={styles.betText}>{amount}</Text>
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
