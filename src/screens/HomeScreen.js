import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const DATA_FILE_URI = FileSystem.documentDirectory + 'data.json';

const HomeScreen = ({ navigation }) => {
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');

  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    try {
      const data = await FileSystem.readAsStringAsync(DATA_FILE_URI);
      const { partner1, partner2 } = JSON.parse(data);
      setPartner1(partner1 || '');
      setPartner2(partner2 || '');
    } catch (error) {
      console.error('Error loading names:', error);
    }
  };

  const saveNames = async () => {
    try {
      const data = JSON.stringify({ partner1, partner2 });
      await FileSystem.writeAsStringAsync(DATA_FILE_URI, data, { encoding: FileSystem.EncodingType.UTF8 });
    } catch (error) {
      console.error('Error saving names:', error);
    }
  };

  const startDiary = () => {
    if (!partner1 || !partner2) {
      alert('Please enter both names.');
      return;
    }

    saveNames();
    navigation.navigate('Diary', { partner1, partner2 });
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset',
      'Are you sure? This will remove all diary entries.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: resetApplication,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const resetApplication = async () => {
    try {
      await FileSystem.deleteAsync(DATA_FILE_URI);
      setPartner1('');
      setPartner2('');
    } catch (error) {
      console.error('Error resetting application:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../components/bg1.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <TextInput
          placeholder="You"
          style={styles.input}
          onChangeText={text => setPartner1(text)}
          value={partner1}
        />
        <TextInput
          placeholder="Your Love"
          style={styles.input}
          onChangeText={text => setPartner2(text)}
          value={partner2}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={startDiary}
            style={styles.buttonEnter}
          >
            <Text style={styles.buttonText}>Enter Diary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmReset}
            style={styles.buttonRemove}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '50%',
    borderBottomColor: '#ccc',
    borderColor: '#f28695',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  buttonEnter: {
    height: 40,
    width: '48%',
    borderColor: '#f28695',
    borderWidth: 5,
    marginBottom: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF6F0',
  },
  buttonRemove: {
    height: 40,
    width: '48%',
    borderColor: '#f28695',
    borderWidth: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF6F0',
  },
  buttonText: {
    color: '#f28695',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

