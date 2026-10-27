import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoginPage from '@/features/auth/pages/LoginPage';
import { renderWithProviders } from './utils';

describe('Kirish formasi validatsiyasi', () => {
  it('bo‘sh va noto‘g‘ri maydonlar uchun xato ko‘rsatadi', async () => {
    renderWithProviders(<LoginPage />, { route: '/login-form' });
    fireEvent.click(screen.getByRole('button', { name: /Kirish/ }));
    await waitFor(() => expect(screen.getByText('Loginni kiriting')).toBeInTheDocument());
    expect(screen.getByText('Parolni kiriting')).toBeInTheDocument();
  });
});
