import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, TouchableHighlight } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAccept, setShowAccept] = useState<boolean>(false);
  const [acceptMessage, setAcceptMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await auth().signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        setShowAccept(true);
        setAcceptMessage("Registration succesfull!")
        setIsLogin(true);
        await firestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .set({
            points: 100,
            createdAt: firestore.FieldValue.serverTimestamp(),
            email: email,
          });
          setEmail('');
          setPassword('');
          setShowError(false);
          setErrorMessage(null);
      }
    } catch (error: any) {
      setShowError(true);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrorMessage('This email is already registered. Try logging in or using a different one.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('The email address format is invalid. Please enter a valid email.');
          break;
        case 'auth/weak-password':
          setErrorMessage('Your password is too weak. Use at least 6 characters with a mix of letters and numbers.');
          break;
        case 'auth/invalid-credential':
          setErrorMessage('Wrong password or user not found.');
          break;
        default:
          setErrorMessage('Something went wrong. Please try again later.');
          Alert.alert('Error', error.message);
          break;
      }
    }
  };

  return (
    <View style={styles.container}>
      {showAccept && (
        <View style={styles.accept}>
          <Text style={styles.acceptTekst}>{acceptMessage}</Text>
        </View>)
      }
      {showError && (
        <View style={styles.error}>
          <Text style={styles.bladtekst}>{errorMessage}</Text>
        </View>)
      }
      <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.btn}
        onPress = {handleSubmit}
      >
        <Text style = {styles.tekst}>{isLogin ? 'Login' : 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setIsLogin(!isLogin);
          setEmail('');
          setShowError(false);
          setPassword('');
        }}
        style = {styles.btn}
      >
        <Text style={styles.tekst}>Switch to {isLogin ? 'Register' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  btn: {
    backgroundColor: '#add8e6',
    borderRadius: 10,
    marginVertical:7,
    padding: 10,
  },
  error:{
    backgroundColor: 'red',
    padding: 20,
    marginBottom: 30,
  },
  bladtekst:{
    textAlign: 'center',
    fontWeight:600,
    fontSize: 16,
  },
  acceptTekst:{
    textAlign: 'center',
    fontWeight:600,
    fontSize: 16,
  },
  accept:{
    backgroundColor: 'green',
    padding: 20,
    marginBottom: 30,
  },
  tekst:{
    fontSize:17,
    textAlign: 'center',
    color: 'white',
    fontWeight: 600,
  },
  title: {
    fontSize: 35,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});