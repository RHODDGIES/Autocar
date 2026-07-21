import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getRecommendations } from '../api';

const LoadingScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { query, budgetMax, location, language } = route.params;
  const dotsAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate dots
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dotsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(animateDots);
    };
    animateDots();

    // Fetch recommendations
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await getRecommendations(query, budgetMax, location, language);
      navigation.navigate('Results', { recommendations: data.recommendations, extractedNeeds: data.extracted_needs });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Use mock data for demo
      const mockRecommendations = [
        {
          car_id: 'honda_crv_hybrid_2026',
          score: 0.85,
          match_reason: 'Excellent fuel efficiency with 43 MPG city, perfect for your commute. Spacious interior for family needs.',
          trade_offs: 'Higher price point compared to some competitors.'
        },
        {
          car_id: 'toyota_camry_hybrid_2026',
          score: 0.82,
          match_reason: 'Outstanding 51 MPG city rating saves money on gas. Reliable and comfortable for daily driving.',
          trade_offs: 'Limited cargo space compared to SUVs.'
        },
      ];
      navigation.navigate('Results', { recommendations: mockRecommendations, extractedNeeds: {} });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.icon, { opacity: dotsAnim }]}>🚗</Animated.Text>
        <Text style={styles.title}>{t('loading.title')}</Text>
        <Text style={styles.subtitle}>{t('loading.subtitle')}</Text>
        
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                  transform: [
                    {
                      scale: dotsAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.2, 1],
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 40,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ecca3',
    marginHorizontal: 8,
  },
});

export default LoadingScreen;
