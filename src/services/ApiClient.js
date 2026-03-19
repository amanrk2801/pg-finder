import StorageService from './StorageService';

// HARDCODED IP FOR MOBILE TESTING
const API_BASE_URL = 'http://192.168.0.113:4000/api';

/**
 * Recursively convert MongoDB _id to id for frontend compatibility
 */
function normalize(data) {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(normalize);
  }

  const normalized = { ...data };
  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id.toString();
  }

  Object.keys(normalized).forEach((key) => {
    normalized[key] = normalize(normalized[key]);
  });

  return normalized;
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[ApiClient] Requesting: ${url}`);
  
  // Get token from storage OR use the one passed in options
  let token = options.token;
  if (!token) {
    const session = await StorageService.getUserSession();
    token = session?.token;
  }

  const finalOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const res = await fetch(url, finalOptions);
    
    if (!res.ok) {
      const text = await res.text();
      let errorMessage = `Request failed with status ${res.status}`;
      try {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        if (text && text.length < 100) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const json = await res.json();
    return normalize(json);
  } catch (err) {
    console.error(`[ApiClient] Fetch Error for ${url}:`, err.message);
    throw err;
  }
}

const ApiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default ApiClient;
