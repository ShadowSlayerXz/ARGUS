import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all satellites
export const fetchSatellites = async () => {
  const response = await api.get('/api/satellites');
  return response.data;
};

// Fetch single satellite
export const fetchSatellite = async (id: string) => {
  const response = await api.get(`/api/satellites/${id}`);
  return response.data;
};

// Fetch all conjunctions
export const fetchConjunctions = async () => {
  const response = await api.get('/api/conjunctions');
  return response.data;
};

// Fetch single conjunction
export const fetchConjunction = async (id: string) => {
  const response = await api.get(`/api/conjunctions/${id}`);
  return response.data;
};

// Fetch statistics
export const fetchStats = async () => {
  const response = await api.get('/api/stats');
  return response.data;
};

// WebSocket connection for live updates
export const connectWebSocket = (onMessage: (data: any) => void) => {
  const ws = new WebSocket('ws://localhost:8000/ws');
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return ws;
};

export default api;
