import axios from "axios";

// Set API base URL (adjust for your backend)
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

export const getPartnerStatus = async () => {
  const res = await axios.get(`${API_BASE}/partners/status`);
  return res.data;
};

export const getAnalytics = async () => {
  const res = await axios.get(`${API_BASE}/partners/analytics`);
  return res.data;
};

export const triggerEvent = async (event, payload) => {
  const res = await axios.post(`${API_BASE}/events/${event}`, payload);
  return res.data;
};

export const registerWebhook = async (events, url) => {
  const res = await axios.post(`${API_BASE}/webhooks/register`, { events, url });
  return res.data;
};
