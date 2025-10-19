'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterForm } from '@/components/auth';
import { Card, LoadingSpinner } from '@/components/common';
import { Package, Home } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Home Button */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition text-gray-700 hover:text-blue-600">
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">NexusChain</span>
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the future of supply chain transparency
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
}
