const API_BASE = '/api';

export const api = {
  // GET request
  get: async (url) => {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
      return result;
    } catch (error) {
      console.error(`API GET error on ${url}:`, error);
      throw error;
    }
  },

  // POST request
  post: async (url, data) => {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
      return result;
    } catch (error) {
      console.error(`API POST error on ${url}:`, error);
      throw error;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
      return result;
    } catch (error) {
      console.error(`API DELETE error on ${url}:`, error);
      throw error;
    }
  }
};
export default api;
