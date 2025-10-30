/**
 * API Service for GlucoTracker
 * Handles all API requests to the backend
 */

const API_URL = 'http://localhost:3000/api';

// Use window.ApiService to ensure global availability
window.ApiService = {
  /**
   * Make a request to the API
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {object} data - Request data
   * @returns {Promise} - Promise with response data
   */
  async request(endpoint, method = 'GET', data = null) {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    register(userData) {
      return window.ApiService.request('/users/register', 'POST', userData);
    },
    login(credentials) {
      return window.ApiService.request('/users/login', 'POST', credentials);
    },
  },

  // User endpoints
  user: {
    getProfile(userId) {
      return window.ApiService.request(`/users/${userId}`);
    },
    updateProfile(userId, userData) {
      return window.ApiService.request(`/users/${userId}`, 'PUT', userData);
    },
    updateGuardian(userId, guardianData) {
      return window.ApiService.request(`/users/${userId}/guardian`, 'PUT', { guardianContact: guardianData });
    },
    updateNotifications(userId, notificationData) {
      return window.ApiService.request(`/users/${userId}/notifications`, 'PUT', { notificationPreferences: notificationData });
    },
  },

  // Glucose endpoints
  glucose: {
    getReadings(userId, limit = 30) {
      return window.ApiService.request(`/glucose/user/${userId}?limit=${limit}`);
    },
    getReading(readingId) {
      return window.ApiService.request(`/glucose/${readingId}`);
    },
    addReading(readingData) {
      return window.ApiService.request('/glucose', 'POST', readingData);
    },
    updateReading(readingId, readingData) {
      return window.ApiService.request(`/glucose/${readingId}`, 'PUT', readingData);
    },
    deleteReading(readingId) {
      return window.ApiService.request(`/glucose/${readingId}`, 'DELETE');
    },
    getStatistics(userId, days = 7) {
      return window.ApiService.request(`/glucose/stats/user/${userId}?days=${days}`);
    },
    getTrends(period = 'daily') {
      return window.ApiService.request(`/glucose/trends?period=${period}`);
    },
  },

  // Activity endpoints
  activity: {
    addActivity(activityData) {
      return window.ApiService.request('/activities', 'POST', activityData);
    },
    getActivities() {
      return window.ApiService.request('/activities');
    },
    getActivityTrends(period = 'daily') {
      return window.ApiService.request(`/activities/trends?period=${period}`);
    },
  },
};

// Dispatch an event when ApiService is ready
document.dispatchEvent(new CustomEvent('apiservice-ready'));
