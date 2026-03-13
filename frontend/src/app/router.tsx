import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/portfolio/pages/DashboardPage';
import { AddEditInvestmentPage } from '@/features/portfolio/pages/AddEditInvestmentPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'investments/new',
        element: <AddEditInvestmentPage />,
      },
      {
        path: 'investments/:id/edit',
        element: <AddEditInvestmentPage />,
      },
    ],
  },
]);
