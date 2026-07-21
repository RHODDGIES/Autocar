import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const getRecommendations = async (query, budgetMax, location, language) => {
  try {
    const response = await api.post('/api/recommendations', {
      query,
      budget_max: budgetMax,
      location,
      language,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

export const getCarDetails = async (carId) => {
  try {
    const response = await api.get(`/api/cars/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting car details:', error);
    throw error;
  }
};

export const compareCars = async (carIds) => {
  try {
    const response = await api.post('/api/cars/compare', {
      car_ids: carIds,
    });
    return response.data;
  } catch (error) {
    console.error('Error comparing cars:', error);
    throw error;
  }
};

export const submitFeedback = async (carId, rating, comment) => {
  try {
    const response = await api.post('/api/feedback', {
      car_id: carId,
      rating,
      comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export default api;
