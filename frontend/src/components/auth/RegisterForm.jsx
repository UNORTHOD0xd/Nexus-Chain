'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Select, ErrorMessage } from '@/components/common';
import { Mail, Lock, User, Briefcase } from 'lucide-react';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['MANUFACTURER', 'LOGISTICS', 'RETAILER', 'CONSUMER'], {
    required_error: 'Please select a role'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

/**
 * Register Form Component
 */
export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const roleOptions = [
    { value: 'MANUFACTURER', label: 'Manufacturer' },
    { value: 'LOGISTICS', label: 'Logistics Provider' },
    { value: 'RETAILER', label: 'Retailer' },
    { value: 'CONSUMER', label: 'Consumer' }
  ];

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const { confirmPassword, ...userData } = data;

      await registerUser(userData);

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorMessage message={error} title="Registration Failed" />}

      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        icon={<User className="h-5 w-5 text-gray-400" />}
        error={errors.name?.message}
        required
        {...register('name')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-5 w-5 text-gray-400" />}
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Select
        label="I am a"
        options={roleOptions}
        placeholder="Select your role"
        error={errors.role?.message}
        required
        {...register('role')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Create a password"
        icon={<Lock className="h-5 w-5 text-gray-400" />}
        error={errors.password?.message}
        helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        required
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        icon={<Lock className="h-5 w-5 text-gray-400" />}
        error={errors.confirmPassword?.message}
        required
        {...register('confirmPassword')}
      />

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="text-gray-700">
            I agree to the{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </a>
      </div>
    </form>
  );
}
