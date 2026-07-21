import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: {
    translation: {
      welcome: {
        title: 'AutoMatch',
        tagline: 'Tell us what you need. We\'ll find the car.',
        getStarted: 'Get Started',
      },
      query: {
        title: 'What do you need?',
        placeholder: 'e.g., "I have 3 kids and commute 2 hours"',
        budget: 'Budget',
        location: 'Location (optional)',
        findCar: 'Find My Car',
      },
      loading: {
        title: 'Analyzing your needs',
        subtitle: 'Finding the perfect match...',
      },
      results: {
        title: 'Your Matches',
        noResults: 'No cars matched your criteria',
        viewDetails: 'View Details',
        compare: 'Compare Selected',
        compareSelected: 'Compare Selected',
      },
      details: {
        title: 'Car Details',
        specs: 'Specifications',
        pros: 'Why this fits you',
        cons: 'Trade-offs',
        back: 'Back to Results',
        price: 'Price',
        fuel: 'Fuel Type',
        mpg: 'MPG',
        seating: 'Seating',
        cargo: 'Cargo Space',
        towing: 'Towing Capacity',
        safety: 'Safety Rating',
        drivetrain: 'Drivetrain',
      },
      compare: {
        title: 'Compare Cars',
        overall: 'Overall Recommendation',
        startOver: 'Start Over',
      },
      common: {
        loading: 'Loading...',
        error: 'Something went wrong',
        retry: 'Retry',
      },
    },
  },
  fr: {
    translation: {
      welcome: {
        title: 'AutoMatch',
        tagline: 'Dites-nous ce dont vous avez besoin. Nous trouverons la voiture.',
        getStarted: 'Commencer',
      },
      query: {
        title: 'De quoi avez-vous besoin?',
        placeholder: 'ex: "J\'ai 3 enfants et je fais 2 heures de trajet"',
        budget: 'Budget',
        location: 'Lieu (optionnel)',
        findCar: 'Trouver ma voiture',
      },
      loading: {
        title: 'Analyse de vos besoins',
        subtitle: 'Recherche de la correspondance parfaite...',
      },
      results: {
        title: 'Vos correspondances',
        noResults: 'Aucune voiture ne correspond à vos critères',
        viewDetails: 'Voir les détails',
        compare: 'Comparer la sélection',
        compareSelected: 'Comparer la sélection',
      },
      details: {
        title: 'Détails de la voiture',
        specs: 'Spécifications',
        pros: 'Pourquoi cela vous convient',
        cons: 'Compromis',
        back: 'Retour aux résultats',
        price: 'Prix',
        fuel: 'Type de carburant',
        mpg: 'MPG',
        seating: 'Places assises',
        cargo: 'Espace de chargement',
        towing: 'Capacité de remorquage',
        safety: 'Note de sécurité',
        drivetrain: 'Transmission',
      },
      compare: {
        title: 'Comparer les voitures',
        overall: 'Recommandation globale',
        startOver: 'Recommencer',
      },
      common: {
        loading: 'Chargement...',
        error: 'Une erreur est survenue',
        retry: 'Réessayer',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0] || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
