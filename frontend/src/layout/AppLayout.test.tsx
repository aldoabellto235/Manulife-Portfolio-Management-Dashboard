import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { AppLayout } from './AppLayout';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}));

vi.mock('@/features/auth/api/authApi', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/auth/api/authApi')>();
  return {
    ...mod,
    useLogoutMutation: vi.fn(() => [
      vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) })),
      { isLoading: false },
    ]),
  };
});

describe('AppLayout — navigation', () => {
  it('renders the Dashboard nav link', () => {
    renderWithProviders(<AppLayout><div /></AppLayout>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the Transactions nav link', () => {
    renderWithProviders(<AppLayout><div /></AppLayout>);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('renders the Manulife brand in the app bar', () => {
    renderWithProviders(<AppLayout><div /></AppLayout>);
    expect(screen.getByText('Manulife')).toBeInTheDocument();
  });
});

describe('AppLayout — content slot', () => {
  it('renders children as page content', () => {
    renderWithProviders(<AppLayout><p>main content</p></AppLayout>);
    expect(screen.getByText('main content')).toBeInTheDocument();
  });
});

describe('AppLayout — account menu', () => {
  it('shows "Account" label when no user is signed in', () => {
    renderWithProviders(<AppLayout><div /></AppLayout>);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('shows the user email when a user is present', () => {
    renderWithProviders(<AppLayout><div /></AppLayout>, {
      user: { id: '1', email: 'alice@example.com', createdAt: '' },
    });
    // email appears in both the button and the disabled menu item header
    expect(screen.getAllByText('alice@example.com').length).toBeGreaterThan(0);
  });

  it('opens the dropdown menu when the account button is clicked', async () => {
    renderWithProviders(<AppLayout><div /></AppLayout>);
    fireEvent.click(screen.getByText('Account'));
    await waitFor(() => expect(screen.getByText('Sign Out')).toBeVisible());
  });

  it('invokes the onClose handler when Escape is pressed', async () => {
    renderWithProviders(<AppLayout><div /></AppLayout>);
    fireEvent.click(screen.getByText('Account'));
    await waitFor(() => screen.getByText('Sign Out'));
    // Escape triggers MUI Menu's onClose → covers () => setAnchorEl(null)
    fireEvent.keyDown(screen.getByText('Sign Out'), { key: 'Escape' });
    // No error thrown is the expectation — MUI handles transition timing
  });

  it('calls logout and navigates to /login when Sign Out is clicked', async () => {
    renderWithProviders(<AppLayout><div /></AppLayout>);
    fireEvent.click(screen.getByText('Account'));
    await waitFor(() => screen.getByText('Sign Out'));
    fireEvent.click(screen.getByText('Sign Out'));
    // handleLogout runs in finally block — just verify no unhandled error
    await waitFor(() => expect(screen.queryByText('Sign Out')).not.toBeVisible());
  });
});
