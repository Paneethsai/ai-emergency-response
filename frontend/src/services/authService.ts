import api from './api';

export const loginWithBackend = async (idToken: string, role?: string, name?: string, phone?: string) => {
  const response = await api.post('/auth/login', { idToken, role, name, phone });
  return response.data;
};

export const devLoginWithBackend = async (role?: string) => {
  const response = await api.post('/auth/dev-login', { role });
  return response.data;
};
