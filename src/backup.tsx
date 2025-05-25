import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function Miny(){
  const [points, setPoints] = useState<number>(0);
  const user: FirebaseAuthTypes.User | null = auth().currentUser;

  useEffect(() => {
    const fetchPoints = async () => {
      if (user) {
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          const userData = userDoc.data();
          setPoints(userData?.points || 0);
        } catch (error) {
          console.error('Error fetching points:', error);
        }
      }
    };

    fetchPoints();
  }, [user]);

  const addPoints = async (additionalPoints:number) => {
    if (!user) return; // Ensure user is logged in
    try {
      // Get a reference to the user's document
      const userRef = firestore().collection('users').doc(user.uid);
      // Update points in Firestore (increment by `additionalPoints`)
      await userRef.update({
        points: firestore.FieldValue.increment(additionalPoints)
      });
      // Update local state (optional: you could also re-fetch points)
      setPoints(prevPoints => prevPoints + additionalPoints);
      console.log(`Added ${additionalPoints} points successfully!`);
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const handleLogout = () => {
    auth().signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Button title="Logout" onPress={handleLogout} />
        <Text style={styles.pointsText}>Points: {points}</Text>
      </View>

      <View style={styles.gameArea}>
        <Button title="zwieksz punkty" onPress={() => addPoints(1)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f0f0f0',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});