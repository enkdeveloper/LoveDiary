import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, FontAwesome, Fontisto } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const DiaryScreen = ({ route, navigation }) => {
  const { partner1, partner2 } = route.params;
  const [notes, setNotes] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [image, setImage] = useState(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    saveNotes();
  }, [notes]);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes !== null) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async () => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          alert('Permission to access camera roll is required!');
          return;
        }
      }
  
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      };
  
      const result = await ImagePicker.launchImageLibraryAsync(options);
  
      if (!result.cancelled) {
        setImage(result.uri); 
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setSelectedDate(selectedDate || new Date());
  };

  const addNote = () => {
    const newNote = {
      id: new Date().getTime(),
      date: selectedDate,
      content: inputText,
      image: image,
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
    setInputText('');
    setImage(null);
  };

  const removeNote = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const confirmReset = () => {
    Alert.alert(
      'Remove',
      'Are you sure? This will remove all notes.',
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
      await AsyncStorage.removeItem('notes');
      setNotes([]);
    } catch (error) {
      console.error('Error resetting application:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../components/bg2.png')}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {`${partner1}'s Heart`} <FontAwesome name="heart" size={24} color="#f28695" /> {`${partner2}'s Heart`}
        </Text>

        <TextInput
          placeholder="Add your note here..."
          style={styles.input}
          multiline
          value={inputText}
          onChangeText={text => setInputText(text)}
        />

        <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.iconContainer} onPress={pickImage}>
            <AntDesign name="camerao" size={32} color="#f28695" />
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.image} />}

          <TouchableOpacity
            style={styles.dateContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}><Fontisto name="date" size={28} color="#f28695" /></Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            style={styles.dateTimePicker}
          />
        )}

        <TouchableOpacity
          onPress={addNote}
          style={styles.buttonAdd}
        >
          <Text style={styles.buttonText}>Add Note</Text>
        </TouchableOpacity>

        {notes.length > 0 && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Love Diary</Text>
            {notes.map((note, index) => (
              <View key={note.id} style={[styles.noteItem, { backgroundColor: index % 2 === 0 ? '#FFF5E0' : '#f2f2f2' }]}>
                <Text style={styles.noteDate}>{note.date ? `Date: ${new Date(note.date).toDateString()}` : 'Date: N/A'}</Text>
                <Text style={styles.noteContent}>{`Note: ${note.content}`}</Text>
                {note.image && (
                  <Image source={{ uri: note.image }} style={styles.noteImage} />
                )}
                <TouchableOpacity onPress={() => removeNote(note.id)}>
                  <AntDesign name="delete" size={16} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.goBack()} 
        style={styles.footer}
      >
        <AntDesign name="leftcircleo" size={40} color="#f28695" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={confirmReset}
        style={styles.resetButton}
      >
        <Text style={styles.resetButtonText}>Remove Notes</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#f28695',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  },
  input: {
    height: 100,
    borderColor: '#f28695',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFF5E0',
    borderRadius: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingRight: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
    color: '#f28695',
  },
  dateContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#f28695',
  },
  buttonAdd: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f28695',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'center',
    width: '60%',
  },
  buttonText: {
    color: '#f28695',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notesContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFF5E0',
    borderWidth: 2,
    padding: 5,
    flexDirection: 'column' 
  },
  notesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#f28695',
    textAlign: 'center',
  },
  noteItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFF5E0',
    width: '100%',
  },
  noteDate: {
    marginBottom: 5,
    color: '#321E1E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContent: {
    marginBottom: 5,
    color: '#321E1E',
    fontSize: 16,
  },
  noteImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: 'red',
  },
  dateTimePicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  resetButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: '#f28695',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DiaryScreen;




