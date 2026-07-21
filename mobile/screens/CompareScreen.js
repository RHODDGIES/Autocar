import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { compareCars, getCarDetails } from '../api';

const CompareScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { carIds } = route.params;
  const [comparison, setComparison] = useState(null);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      const comparisonData = await compareCars(carIds);
      setComparison(comparisonData.comparison);

      // Fetch car details
      const carsData = await Promise.all(
        carIds.map(async (id) => {
          try {
            return await getCarDetails(id);
          } catch (error) {
            return {
              id,
              make: id.split('_')[0].toUpperCase(),
              model: id.split('_')[1].toUpperCase(),
              price_new: 0,
              mpg_city: 0,
              mpg_highway: 0,
              seating_capacity: 0,
              cargo_cu_ft: 0,
              towing_capacity_lbs: 0,
              safety_rating: 0,
              drivetrain: 'N/A',
            };
          }
        })
      );
      setCars(carsData);
    } catch (error) {
      console.error('Error fetching comparison:', error);
      // Use mock data for demo
      setComparison({
        winner_by_category: {
          fuel_efficiency: carIds[0],
          space: carIds[1],
          safety: carIds[0],
          performance: carIds[1],
          value: carIds[0],
        },
        overall_winner: carIds[0],
        reasoning: 'Based on your needs, the first car offers better value and fuel efficiency.',
      });
      setCars([
        {
          id: carIds[0],
          make: carIds[0].split('_')[0].toUpperCase(),
          model: carIds[0].split('_')[1].toUpperCase(),
          price_new: 42000,
          mpg_city: 43,
          mpg_highway: 36,
          seating_capacity: 5,
          cargo_cu_ft: 39.3,
          towing_capacity_lbs: 1500,
          safety_rating: 5,
          drivetrain: 'AWD',
        },
        {
          id: carIds[1],
          make: carIds[1].split('_')[0].toUpperCase(),
          model: carIds[1].split('_')[1].toUpperCase(),
          price_new: 34000,
          mpg_city: 51,
          mpg_highway: 53,
          seating_capacity: 5,
          cargo_cu_ft: 15.1,
          towing_capacity_lbs: 0,
          safety_rating: 5,
          drivetrain: 'FWD',
        },
      ]);
    }
  };

  const getWinner = (category) => {
    if (!comparison) return null;
    return comparison.winner_by_category[category];
  };

  const isWinner = (carId, category) => {
    return getWinner(category) === carId;
  };

  const CompareRow = ({ label, values, category }) => (
    <View style={styles.compareRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      {values.map((value, index) => (
        <View
          key={index}
          style={[
            styles.rowValue,
            isWinner(cars[index]?.id, category) && styles.winnerCell,
          ]}
        >
          <Text style={[
            styles.rowValueText,
            isWinner(cars[index]?.id, category) && styles.winnerText,
          ]}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );

  if (!comparison || cars.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('compare.title')}</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.headerLabel}>Spec</Text>
        {cars.map((car, index) => (
          <Text key={index} style={styles.headerCar}>
            {car.make} {car.model}
          </Text>
        ))}
      </View>

      <View style={styles.tableBody}>
        <CompareRow
          label={t('details.price')}
          values={cars.map(c => `$${c.price_new?.toLocaleString() || 0}`)}
          category="value"
        />
        <CompareRow
          label={t('details.mpg')}
          values={cars.map(c => `${c.mpg_city || 0}/${c.mpg_highway || 0}`)}
          category="fuel_efficiency"
        />
        <CompareRow
          label={t('details.seating')}
          values={cars.map(c => `${c.seating_capacity || 0}`)}
          category="space"
        />
        <CompareRow
          label={t('details.cargo')}
          values={cars.map(c => `${c.cargo_cu_ft || 0} cu ft`)}
          category="space"
        />
        <CompareRow
          label={t('details.towing')}
          values={cars.map(c => `${c.towing_capacity_lbs || 0} lbs`)}
          category="performance"
        />
        <CompareRow
          label={t('details.safety')}
          values={cars.map(c => `${c.safety_rating || 0}/5`)}
          category="safety"
        />
        <CompareRow
          label={t('details.drivetrain')}
          values={cars.map(c => c.drivetrain || 'N/A')}
          category="performance"
        />
      </View>

      <View style={styles.overallSection}>
        <Text style={styles.overallTitle}>{t('compare.overall')}</Text>
        <View style={styles.overallWinner}>
          <Text style={styles.winnerLabel}>Winner:</Text>
          <Text style={styles.winnerCar}>
            {cars.find(c => c.id === comparison.overall_winner)?.make || 'N/A'}{' '}
            {cars.find(c => c.id === comparison.overall_winner)?.model || ''}
          </Text>
        </View>
        <Text style={styles.reasoning}>{comparison.reasoning}</Text>
      </View>

      <TouchableOpacity
        style={styles.startOverButton}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.startOverButtonText}>{t('compare.startOver')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#4ecca3',
  },
  headerLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ecca3',
  },
  headerCar: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableBody: {
    paddingHorizontal: 20,
  },
  compareRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: '#e0e0e0',
  },
  rowValue: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 8,
  },
  rowValueText: {
    fontSize: 14,
    color: '#ffffff',
  },
  winnerCell: {
    backgroundColor: 'rgba(78, 204, 163, 0.2)',
  },
  winnerText: {
    color: '#4ecca3',
    fontWeight: 'bold',
  },
  overallSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4ecca3',
  },
  overallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ecca3',
    marginBottom: 15,
  },
  overallWinner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  winnerLabel: {
    fontSize: 16,
    color: '#e0e0e0',
    marginRight: 10,
  },
  winnerCar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reasoning: {
    fontSize: 15,
    color: '#a0a0a0',
    lineHeight: 22,
  },
  startOverButton: {
    backgroundColor: '#4ecca3',
    margin: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#4ecca3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startOverButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CompareScreen;
