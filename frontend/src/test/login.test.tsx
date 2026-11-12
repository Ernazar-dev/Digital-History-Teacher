import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoginPage from '@/features/auth/pages/LoginPage';
import { renderWithProviders } from './utils';

describe('Kiriş formasi validatsiyasi', () => {
  it('böş va notög’ri maydonlar uçun xato körsatadi', async () => {
    renderWithProviders(<LoginPage />, { route: '/login-form' });
    fireEvent.click(screen.getByRole('button', { name: /Kiriş/ }));
    await waitFor(() => expect(screen.getByText('Loginni kiriting')).toBeInTheDocument());
    expect(screen.getByText('Parolni kiriting')).toBeInTheDocument();
  });
});
