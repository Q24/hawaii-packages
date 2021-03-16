import { authenticatedRequest } from './authenticated-request';

export const getProfile = () => {
  return authenticatedRequest('/profile');
};
