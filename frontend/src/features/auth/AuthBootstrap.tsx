import { Spin } from 'antd';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { refreshSession } from '@/lib/http';
import { useAuthStore } from './auth.store';

/** Sahifa yuklanganda httpOnly refresh cookie orqali sessiyani tiklaydi */
export const AuthBootstrap = () => {
  const initialized = useAuthStore((s) => s.initialized);
  useEffect(() => {
    if (initialized) return;
    void refreshSession().finally(() => useAuthStore.getState().markInitialized());
  }, [initialized]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip="Yuklanmoqda..." fullscreen />
      </div>
    );
  }
  return <Outlet />;
};
