import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { navFor } from '@/components/layout/navigation';
import { useAuthStore } from '@/features/auth/auth.store';
import { RequireAuth, RequireRole } from '@/routes/guards';
import type { User } from '@/types/api';
import { renderWithProviders } from './utils';

const user = (role: User['role']): User => ({
  id: 'u1', username: 'test', email: null, fullName: 'Test', role, status: 'ACTIVE', institution: null, createdAt: '', lastLoginAt: null,
});

describe('Marshrut himoyasi va rolga mos navigatsiya', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    useAuthStore.setState({ initialized: true });
  });

  it('sessiya hali tekshirilayotganda kirish taklifi chaqnab ketmaydi', () => {
    useAuthStore.setState({ initialized: false });
    renderWithProviders(<RequireAuth><div>MAXFIY</div></RequireAuth>, { route: '/app/portfolio' });
    expect(screen.queryByText('Bu bo‘lim shaxsiy kabinetda')).not.toBeInTheDocument();
    expect(screen.queryByText('MAXFIY')).not.toBeInTheDocument();
  });

  it('kirmagan foydalanuvchiga yopiq bo‘lim o‘rnida kirish taklifi ko‘rsatiladi', () => {
    renderWithProviders(<RequireAuth><div>MAXFIY</div></RequireAuth>, { route: '/app/portfolio' });
    expect(screen.getByText('Bu bo‘lim shaxsiy kabinetda')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kirish' })).toHaveAttribute('href', '/login?next=%2Fapp%2Fportfolio');
    expect(screen.queryByText('MAXFIY')).not.toBeInTheDocument();
  });

  it('noto‘g‘ri rol uchun 403 ko‘rsatiladi', () => {
    useAuthStore.getState().setSession(user('STUDENT'), 'token');
    renderWithProviders(<RequireRole roles={['ADMIN']}><div>ADMIN PANEL</div></RequireRole>);
    expect(screen.getByText('Ruxsat yo‘q')).toBeInTheDocument();
    expect(screen.queryByText('ADMIN PANEL')).not.toBeInTheDocument();
  });

  it('mos rol kontentni ko‘radi', () => {
    useAuthStore.getState().setSession(user('ADMIN'), 'token');
    renderWithProviders(<RequireRole roles={['ADMIN']}><div>ADMIN PANEL</div></RequireRole>);
    expect(screen.getByText('ADMIN PANEL')).toBeInTheDocument();
  });

  it('sidebar rolga qarab o‘zgaradi', () => {
    const student = navFor('STUDENT').map((i) => i.key);
    const teacher = navFor('TEACHER').map((i) => i.key);
    const admin = navFor('ADMIN').map((i) => i.key);
    expect(student).toContain('/app/competence');
    expect(student).not.toContain('/app/review');
    expect(student).not.toContain('admin');
    expect(teacher).toContain('/app/review');
    expect(teacher).not.toContain('admin');
    expect(admin).toContain('admin');
  });
});
