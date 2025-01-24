import apiClient from '@/lib/api-client';
import { PasswordFormValues } from '@/components/settings/password-form';

class UserService {
  changePassword(passwordForm: PasswordFormValues) {
    return apiClient.post('/user/change-password', passwordForm);
  }

  verifyToken() {
    return apiClient.get('/user/verify-token');
  }

  login(body: URLSearchParams) {
    return apiClient.post('/user/login', body);
  }
}

export const userService = new UserService();
