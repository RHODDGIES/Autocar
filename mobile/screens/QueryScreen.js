import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Slider, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

const QueryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState(45000);
  const [location, setLocation] = useState('');

  const handleFindCar = () => {
    if (query.trim().length < 5) {
      alert('Please enter at least 5 characters');
      return;
    }
    
    const language = t('welcome.title') === 'AutoMatch' ? 'en' : 'fr';
    navigation.navigate('Loading', { query, budgetMax: budget, location, language });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('query.title')}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('query.placeholder')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('query.placeholder')}
              placeholderTextColor="#a0a0a0"
              value={query}
              onChangeText={setQuery}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('query.budget')}: ${budget.toLocaleString()}</Text>
            <Slider
              style={styles.slider}
              minimumValue={10000}
              maximumValue={100000}
              step={1000}
              value={budget}
              onValueChange={setBudget}
              minimumTrackTintColor="#4ecca3"
              maximumTrackTintColor="#3a3a5e"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('query.location')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('query.location')}
              placeholderTextColor="#a0a0a0"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleFindCar}>
            <Text style={styles.buttonText}>{t('query.findCar')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#2a2a4e',
    color: '#ffffff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  button: {
    backgroundColor: '#4ecca3',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4ecca3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QueryScreen;
