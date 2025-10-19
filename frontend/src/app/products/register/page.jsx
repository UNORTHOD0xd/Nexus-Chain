'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common';
import { ProductRegistrationForm } from '@/components/products';

export default function RegisterProductPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login with return URL
      router.push('/login?redirect=/products/register');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <nav className="fixed w-full z-50 bg-slate-950/95 backdrop-blur-sm shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">NexusChain</span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                {user?.name} ({user?.role})
              </span>
              <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Register New Product
            </h1>
            <p className="text-xl text-slate-300">
              Create a new product on the blockchain with immutable tracking
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <ProductRegistrationForm />
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Product is registered on the blockchain with a unique ID</li>
              <li>✓ A unique QR code is generated for tracking</li>
              <li>✓ You can download and attach the QR code to your product</li>
              <li>✓ All stakeholders can track the product journey in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
