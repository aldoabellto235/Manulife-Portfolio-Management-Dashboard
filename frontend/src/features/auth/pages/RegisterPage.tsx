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
import LinearProgress from '@mui/material/LinearProgress';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useSnackbar } from 'notistack';
import { AuthLayout } from '../components/AuthLayout';
import { useRegisterMutation } from '../api/authApi';
import { tokens } from '@/shared/theme/tokens';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = Joi.object<RegisterFormData>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Enter a valid email address',
      'string.empty': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[0-9]/, 'number')
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Include at least one {{#name}}',
      'string.empty': 'Password is required',
    }),
  confirmPassword: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: (score / 5) * 100, label: 'Weak', color: tokens.color.danger };
  if (score <= 3) return { score: (score / 5) * 100, label: 'Fair', color: tokens.color.warning };
  if (score === 4) return { score: (score / 5) * 100, label: 'Strong', color: tokens.color.success };
  return { score: 100, label: 'Excellent', color: tokens.color.accent };
}

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
    if (msg === 'EMAIL_ALREADY_EXISTS') return 'An account with this email already exists.';
    return msg;
  }
  return 'Something went wrong. Please try again.';
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: joiResolver(schema) });

  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await registerUser({ email: data.email, password: data.password }).unwrap();
      enqueueSnackbar('Account created successfully!', { variant: 'success' });
      navigate('/');
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
        Create account
      </Typography>
      <Typography variant="body2" sx={{ color: tokens.color.textSecondary, mb: 3 }}>
        Already have an account?{' '}
        <Link
          component={RouterLink}
          to="/login"
          underline="none"
          sx={{ color: tokens.color.primary, fontWeight: 500 }}
        >
          Sign in
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

        <Box>
          <TextField
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="new-password"
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
          {passwordValue && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={strength.score}
                sx={{ '& .MuiLinearProgress-bar': { backgroundColor: strength.color } }}
              />
              <Typography variant="caption" sx={{ color: strength.color }}>
                {strength.label}
              </Typography>
            </Box>
          )}
        </Box>

        <TextField
          {...register('confirmPassword')}
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          fullWidth
          autoComplete="new-password"
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    edge="end"
                    size="small"
                  >
                    {showConfirm ? (
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
            'Create Account'
          )}
        </Button>

        <Typography
          variant="caption"
          sx={{ textAlign: 'center', color: tokens.color.textMuted, lineHeight: 1.6 }}
        >
          By creating an account you agree to our{' '}
          <Link href="#" underline="none" sx={{ color: tokens.color.textMuted, '&:hover': { color: tokens.color.primary } }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" underline="none" sx={{ color: tokens.color.textMuted, '&:hover': { color: tokens.color.primary } }}>
            Privacy Policy
          </Link>
          .
        </Typography>
      </Box>
    </AuthLayout>
  );
}
