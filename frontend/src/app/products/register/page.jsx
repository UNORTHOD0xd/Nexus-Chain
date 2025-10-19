'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common';

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
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Pfizer COVID-19 Vaccine"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Product ID/SKU */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product ID / SKU
                </label>
                <input
                  type="text"
                  placeholder="e.g., PFZ-CV19-001"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition">
                  <option value="">Select a category</option>
                  <option value="PHARMACEUTICALS">Pharmaceuticals</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="LUXURY_GOODS">Luxury Goods</option>
                  <option value="FOOD_BEVERAGE">Food & Beverage</option>
                  <option value="AUTOMOTIVE">Automotive Parts</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed product description..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Manufacturing Date */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Origin Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Origin Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., New York, USA"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Temperature Requirements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min Temperature (°C)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., -70"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Temperature (°C)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., -60"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-700 hover:border-slate-600 transition text-center font-semibold"
                >
                  Cancel
                </Link>
                <button className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 transition font-semibold">
                  Register Product on Blockchain
                </button>
              </div>
            </div>
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
