import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import type { Role } from '@/types/api';
import { useAuthStore } from './auth.store';

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      useAuthStore.getState().clear();
      queryClient.clear();
      navigate('/login');
    }
  };

  const hasRole = (...roles: Role[]) => Boolean(user && roles.includes(user.role));
  return { user, logout, hasRole, isStaff: hasRole('ADMIN', 'TEACHER'), isAdmin: hasRole('ADMIN'), isStudent: hasRole('STUDENT') };
};
