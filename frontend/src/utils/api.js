const API_BASE = '/api';

/**
 * Safe JSON parser — returns null instead of throwing on empty/invalid body.
 */
async function safeJson(response) {
  const text = await response.text();
  if (!text || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    console.warn('Response body is not valid JSON:', text.slice(0, 200));
    return null;
  }
}

export const api = {
  // GET request
  get: async (url) => {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await safeJson(response);
      if (!response.ok) {
        const msg = result?.message || result?.error || `Server error ${response.status}`;
        throw new Error(msg);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await safeJson(response);
      if (!response.ok) {
        const msg = result?.message || result?.error || `Server error ${response.status}`;
        throw new Error(msg);
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
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await safeJson(response);
      if (!response.ok) {
        const msg = result?.message || result?.error || `Server error ${response.status}`;
        throw new Error(msg);
      }
      return result;
    } catch (error) {
      console.error(`API DELETE error on ${url}:`, error);
      throw error;
    }
  }
};

export default api;
