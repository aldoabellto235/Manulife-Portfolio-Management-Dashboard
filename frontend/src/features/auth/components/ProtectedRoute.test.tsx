import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { renderWithProviders } from '@/test/renderWithProviders';

function renderRoute(token: string | null) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<div>Dashboard</div>} />
      </Route>
    </Routes>,
    { token, initialRoute: '/' },
  );
}

describe('ProtectedRoute', () => {
  it('renders the outlet when a token is present', () => {
    renderRoute('valid-token');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects to /login when no token', () => {
    renderRoute(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('redirects to /login when token is empty string', () => {
    renderRoute('');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
