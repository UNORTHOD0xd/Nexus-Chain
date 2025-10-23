'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Package, MapPin, Search, Filter, Plus, Home } from 'lucide-react';
import Link from 'next/link';
import { productsAPI } from '@/services/api';
import { LoadingSpinner, StatusBadge, Card, Button, Input, ErrorMessage } from '@/components/common';
import { formatDate } from '@/utils/formatters';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch products
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      try {
        const response = await productsAPI.getAll();
        console.log('Products API Response:', response);
        return response;
      } catch (err) {
        console.error('Products API Error:', err);
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Extract products array from response with extensive safety checks
  let productsArray = [];

  if (products) {
    console.log('Products data structure:', products);

    if (Array.isArray(products)) {
      productsArray = products;
    } else if (Array.isArray(products.data?.products)) {
      productsArray = products.data.products;
    } else if (Array.isArray(products.products)) {
      productsArray = products.products;
    } else if (Array.isArray(products.data)) {
      productsArray = products.data;
    } else {
      console.warn('Unexpected products data structure:', products);
      productsArray = [];
    }
  }

  // Filter products based on search and status
  const filteredProducts = productsArray.filter((product) => {
    if (!product) return false;

    const matchesSearch =
      !searchQuery ||
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.productId && product.productId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || product.currentStatus === statusFilter || product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Dashboard</h1>
              <p className="text-xl text-slate-300">
                {user?.role === 'MANUFACTURER' && 'Manage your registered products'}
                {user?.role === 'LOGISTICS' && 'Track and update product checkpoints'}
                {user?.role === 'RETAILER' && 'Verify and manage inventory'}
                {user?.role === 'CONSUMER' && 'Track your purchased products'}
              </p>
            </div>

            {user?.role === 'MANUFACTURER' && (
              <Link href="/products/register">
                <Button variant="primary" className="mt-4 md:mt-0">
                  <Plus className="w-5 h-5 mr-2" />
                  Register Product
                </Button>
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by product name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="ALL">All Status</option>
                  <option value="REGISTERED">Registered</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="VERIFIED">Verified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <ErrorMessage
              message={error.response?.data?.message || 'Failed to load products'}
              onRetry={refetch}
            />
          ) : filteredProducts.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
              <p className="text-slate-400 mb-6">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by registering your first product'}
              </p>
              {user?.role === 'MANUFACTURER' && !searchQuery && statusFilter === 'ALL' && (
                <Link href="/products/register">
                  <Button variant="primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Register First Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {filteredProducts.length}
                  </div>
                  <div className="text-sm text-slate-400">Total Products</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {filteredProducts.filter((p) => p.status === 'DELIVERED').length}
                  </div>
                  <div className="text-sm text-slate-400">Delivered</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    {filteredProducts.filter((p) => p.status === 'IN_TRANSIT').length}
                  </div>
                  <div className="text-sm text-slate-400">In Transit</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">
                    {filteredProducts.filter((p) => p.status === 'REGISTERED').length}
                  </div>
                  <div className="text-sm text-slate-400">Registered</div>
                </div>
              </div>

              {/* Products List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:border-blue-500/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-slate-400 font-mono">
                            {product.productId}
                          </p>
                        </div>
                        <StatusBadge status={product.status} />
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Package className="w-4 h-4" />
                          <span>{product.category}</span>
                        </div>
                        {product.currentLocation && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{product.currentLocation}</span>
                          </div>
                        )}
                        <div className="text-slate-500 text-xs">
                          Registered {formatDate(product.createdAt)}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{product.checkpointsCount || 0} Checkpoints</span>
                          <span className="text-blue-400 hover:text-blue-300">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
