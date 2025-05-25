import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { RootStackParamList } from './types'; // ← import this
import firestore from '@react-native-firebase/firestore';

import LoginScreen from './login';
import Miny from './mines';
import BeforeMines from './before_mines';
import BeforeMines2 from './before_mines2';

const Stack = createNativeStackNavigator();

export default function App(){

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Wait until Firestore document is ready
        const userDocRef = firestore().collection('users').doc(user.uid);
        let retries = 5;
        let doc = await userDocRef.get();
        
        while (!doc.exists && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
          doc = await userDocRef.get();
          retries--;
        }

        setUser(user); // only after the user document exists
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'BeforeMines' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        {user ? (
          <>
            <Stack.Screen name="BeforeMines" component={BeforeMines} />
            <Stack.Screen name="BeforeMines2" component={BeforeMines2} />
            <Stack.Screen name="Miny" component={Miny} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


