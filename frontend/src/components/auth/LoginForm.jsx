'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, ErrorMessage } from '@/components/common';
import { Mail, Lock } from 'lucide-react';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

/**
 * Login Form Component
 */
export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      await login(data.email, data.password);

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorMessage message={error} title="Login Failed" />}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-5 w-5 text-gray-400" />}
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={<Lock className="h-5 w-5 text-gray-400" />}
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a
            href="#"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a
          href="/signup"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign up
        </a>
      </div>
    </form>
  );
}
