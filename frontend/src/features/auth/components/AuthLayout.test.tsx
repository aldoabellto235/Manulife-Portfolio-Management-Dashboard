import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders the Manulife brand text', () => {
    render(<AuthLayout><div /></AuthLayout>);
    expect(screen.getByText('Manulife')).toBeInTheDocument();
  });

  it('renders the M logo mark', () => {
    render(<AuthLayout><div /></AuthLayout>);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders children inside the card', () => {
    render(<AuthLayout><p>sign in form</p></AuthLayout>);
    expect(screen.getByText('sign in form')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <AuthLayout>
        <span>child one</span>
        <span>child two</span>
      </AuthLayout>,
    );
    expect(screen.getByText('child one')).toBeInTheDocument();
    expect(screen.getByText('child two')).toBeInTheDocument();
  });
});
