import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useSnackbar } from 'notistack';
import { AuthLayout } from '../components/AuthLayout';
import { useLoginMutation } from '../api/authApi';
import { tokens } from '@/shared/theme/tokens';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = Joi.object<LoginFormData>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Enter a valid email address',
      'string.empty': 'Email is required',
    }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.empty': 'Password is required',
  }),
});

function getApiErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'error' in error.data &&
    error.data.error &&
    typeof error.data.error === 'object' &&
    'message' in error.data.error
  ) {
    const msg = String(error.data.error.message);
    if (msg === 'INVALID_CREDENTIALS') return 'Invalid email or password.';
    return msg;
  }
  return 'Something went wrong. Please try again.';
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: joiResolver(schema) });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data).unwrap();
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      navigate('/');
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
        Sign in
      </Typography>
      <Typography variant="body2" sx={{ color: tokens.color.textSecondary, mb: 3 }}>
        Don't have an account?{' '}
        <Link
          component={RouterLink}
          to="/register"
          underline="none"
          sx={{ color: tokens.color.primary, fontWeight: 500 }}
        >
          Create one
        </Link>
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {apiError && (
          <Alert severity="error" sx={{ py: 0.5 }}>
            {apiError}
          </Alert>
        )}

        <TextField
          {...register('email')}
          label="Email"
          type="email"
          fullWidth
          autoComplete="email"
          autoFocus
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />

        <TextField
          {...register('password')}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="none"
            sx={{
              fontSize: tokens.fontSize.xs,
              color: tokens.color.textMuted,
              '&:hover': { color: tokens.color.primary },
            }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          size="large"
          sx={{ height: 44, mt: 0.5 }}
        >
          {isLoading ? (
            <CircularProgress size={18} sx={{ color: tokens.color.textInverse }} />
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>
    </AuthLayout>
  );
}
