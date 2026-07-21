import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCarDetails } from '../api';

const ResultsScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { recommendations, extractedNeeds } = route.params;
  const [selectedCars, setSelectedCars] = useState([]);

  const toggleSelection = (carId) => {
    if (selectedCars.includes(carId)) {
      setSelectedCars(selectedCars.filter(id => id !== carId));
    } else if (selectedCars.length < 3) {
      setSelectedCars([...selectedCars, carId]);
    }
  };

  const handleViewDetails = async (carId) => {
    try {
      const car = await getCarDetails(carId);
      navigation.navigate('Detail', { car, extractedNeeds });
    } catch (error) {
      console.error('Error fetching car details:', error);
      // Use mock data for demo
      const mockCar = {
        id: carId,
        make: 'Honda',
        model: 'CR-V',
        year: 2026,
        trim: 'Hybrid Touring',
        price_new: 42000,
        fuel_type: 'hybrid',
        mpg_city: 43,
        mpg_highway: 36,
        seating_capacity: 5,
        cargo_cu_ft: 39.3,
        towing_capacity_lbs: 1500,
        safety_rating: 5,
        drivetrain: 'AWD',
      };
      navigation.navigate('Detail', { car: mockCar, extractedNeeds });
    }
  };

  const handleCompare = () => {
    navigation.navigate('Compare', { carIds: selectedCars });
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#4ecca3';
    if (score >= 0.6) return '#ffd700';
    return '#ff6b6b';
  };

  const renderCarCard = ({ item }) => {
    const isSelected = selectedCars.includes(item.car_id);
    const scoreColor = getScoreColor(item.score);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.carInfo}>
            <Text style={styles.carName}>{item.car_id.split('_')[0].toUpperCase()} {item.car_id.split('_')[1].toUpperCase()}</Text>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreText}>{Math.round(item.score * 100)}%</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            onPress={() => toggleSelection(item.car_id)}
          >
            <Text style={styles.checkboxText}>{isSelected ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.matchReason}>{item.match_reason}</Text>
        <Text style={styles.tradeOffs}>{item.trade_offs}</Text>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDetails(item.car_id)}
        >
          <Text style={styles.viewButtonText}>{t('results.viewDetails')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('results.title')}</Text>

      {recommendations.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>{t('results.noResults')}</Text>
        </View>
      ) : (
        <FlatList
          data={recommendations}
          renderItem={renderCarCard}
          keyExtractor={(item) => item.car_id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {selectedCars.length >= 2 && (
        <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
          <Text style={styles.compareButtonText}>{t('results.compareSelected')} ({selectedCars.length})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 12,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#4ecca3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4ecca3',
  },
  checkboxText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  matchReason: {
    fontSize: 15,
    color: '#e0e0e0',
    marginBottom: 8,
    lineHeight: 22,
  },
  tradeOffs: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  viewButton: {
    backgroundColor: '#4ecca3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  compareButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#ffd700',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compareButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResultsScreen;
