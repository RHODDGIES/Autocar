import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

const DetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { car, extractedNeeds } = route.params;

  const SpecRow = ({ label, value }) => (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.carTitle}>{car.make} {car.model}</Text>
        <Text style={styles.carSubtitle}>{car.year} {car.trim}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('details.specs')}</Text>
        <View style={styles.specsContainer}>
          <SpecRow label={t('details.price')} value={`$${car.price_new?.toLocaleString() || 'N/A'}`} />
          <SpecRow label={t('details.fuel')} value={car.fuel_type || 'N/A'} />
          <SpecRow label={t('details.mpg')} value={`${car.mpg_city || 0} / ${car.mpg_highway || 0}`} />
          <SpecRow label={t('details.seating')} value={`${car.seating_capacity || 0} seats`} />
          <SpecRow label={t('details.cargo')} value={`${car.cargo_cu_ft || 0} cu ft`} />
          <SpecRow label={t('details.towing')} value={`${car.towing_capacity_lbs || 0} lbs`} />
          <SpecRow label={t('details.safety')} value={`${car.safety_rating || 0}/5`} />
          <SpecRow label={t('details.drivetrain')} value={car.drivetrain || 'N/A'} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('details.pros')}</Text>
        <View style={styles.prosContainer}>
          {car.mpg_city > 40 && <Text style={styles.proItem}>✓ Excellent fuel efficiency ({car.mpg_city} MPG city)</Text>}
          {car.safety_rating === 5 && <Text style={styles.proItem}>✓ Top safety rating (5/5)</Text>}
          {car.seating_capacity >= 7 && <Text style={styles.proItem}>✓ Spacious seating ({car.seating_capacity} seats)</Text>}
          {car.cargo_cu_ft > 30 && <Text style={styles.proItem}>✓ Generous cargo space ({car.cargo_cu_ft} cu ft)</Text>}
          {car.has_adaptive_cruise && <Text style={styles.proItem}>✓ Adaptive cruise control</Text>}
          {car.has_lane_keep && <Text style={styles.proItem}>✓ Lane keep assist</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('details.cons')}</Text>
        <View style={styles.consContainer}>
          {car.price_new > 50000 && <Text style={styles.conItem}>✗ Premium price point</Text>}
          {car.mpg_city < 25 && <Text style={styles.conItem}>✗ Lower fuel efficiency</Text>}
          {car.seating_capacity < 5 && <Text style={styles.conItem}>✗ Limited seating capacity</Text>}
          {car.cargo_cu_ft < 15 && <Text style={styles.conItem}>✗ Small cargo space</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>{t('details.back')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 30,
    paddingTop: 40,
    backgroundColor: '#2a2a4e',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  carTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  carSubtitle: {
    fontSize: 18,
    color: '#a0a0a0',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ecca3',
    marginBottom: 15,
  },
  specsContainer: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 15,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  specLabel: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  prosContainer: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 15,
  },
  proItem: {
    fontSize: 15,
    color: '#4ecca3',
    marginBottom: 8,
    lineHeight: 22,
  },
  consContainer: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 15,
  },
  conItem: {
    fontSize: 15,
    color: '#ff6b6b',
    marginBottom: 8,
    lineHeight: 22,
  },
  backButton: {
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
  backButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetailScreen;
