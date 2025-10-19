'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Package, MapPin, QrCode, TrendingUp, Users, ChevronRight, Menu, X, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">NexusChain</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:text-blue-400 transition">Features</a>
              <a href="#how-it-works" className="hover:text-blue-400 transition">How It Works</a>
              <a href="#stakeholders" className="hover:text-blue-400 transition">For Businesses</a>
              <button className="px-4 py-2 rounded-lg border border-blue-500 hover:bg-blue-500/10 transition">
                Login
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 transition">
                Register
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 hover:text-blue-400">Features</a>
              <a href="#how-it-works" className="block py-2 hover:text-blue-400">How It Works</a>
              <a href="#stakeholders" className="block py-2 hover:text-blue-400">For Businesses</a>
              <button className="w-full px-4 py-2 rounded-lg border border-blue-500 mb-2">
                Login
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold">
                🚀 Blockchain-Powered Supply Chain
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Stop Counterfeits.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Start Trusting.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed">
              Real-time, immutable tracking from factory to customer. 
              Verify authenticity with a simple QR scan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/50 transition text-lg font-semibold flex items-center justify-center gap-2">
                Register Your Product
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 transition text-lg font-semibold flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                Verify Product
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {[
                { value: '250k+', label: 'Deaths Prevented' },
                { value: '$4.2T', label: 'Counterfeits Blocked' },
                { value: '99.9%', label: 'Accuracy Rate' },
                { value: '< 2s', label: 'Verification Time' }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Supply Chain Crisis
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Traditional supply chains are broken, costing lives and billions in losses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertTriangle,
                color: 'red',
                stat: '250,000+',
                title: 'Annual Deaths',
                description: 'From counterfeit pharmaceuticals worldwide'
              },
              {
                icon: TrendingUp,
                color: 'orange',
                stat: '$4.2T',
                title: 'Counterfeit Market',
                description: 'Worth of fake goods circulating globally'
              },
              {
                icon: Package,
                color: 'yellow',
                stat: '35%',
                title: 'Vaccine Damage',
                description: 'Of vaccines compromised by cold chain breaks'
              }
            ].map((problem, i) => (
              <div key={i} className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition">
                <div className="w-14 h-14 rounded-lg bg-red-500/10 flex items-center justify-center mb-6">
                  <problem.icon className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-4xl font-bold mb-2">{problem.stat}</div>
                <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                <p className="text-slate-400">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How NexusChain Works
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Four simple steps to complete supply chain transparency
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: Package,
                title: 'Manufacturer Registers',
                description: 'Product registered on blockchain with unique QR code'
              },
              {
                step: '02',
                icon: MapPin,
                title: 'Real-Time Tracking',
                description: 'GPS + temperature logged at every checkpoint'
              },
              {
                step: '03',
                icon: Shield,
                title: 'Immutable Record',
                description: 'Every movement stored permanently on blockchain'
              },
              {
                step: '04',
                icon: QrCode,
                title: 'Consumer Verifies',
                description: 'Scan QR to see complete product journey'
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="text-6xl font-bold text-slate-800 mb-4">{step.step}</div>
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-24 right-0 w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 transform translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Blockchain Immutability',
                description: 'Records cannot be altered or deleted once created'
              },
              {
                icon: MapPin,
                title: 'GPS Tracking',
                description: 'Real-time location updates at every checkpoint'
              },
              {
                icon: TrendingUp,
                title: 'Temperature Monitoring',
                description: 'Automated alerts for cold chain compliance'
              },
              {
                icon: QrCode,
                title: 'QR Verification',
                description: 'Instant authenticity check for consumers'
              },
              {
                icon: Users,
                title: 'Multi-Stakeholder',
                description: 'Seamless collaboration across supply chain'
              },
              {
                icon: CheckCircle2,
                title: 'Smart Contracts',
                description: 'Automated payments on delivery confirmation'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition group">
                <div className="w-14 h-14 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section id="stakeholders" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Every Stakeholder
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Manufacturers',
                description: 'Register products, monitor journey, receive payments automatically',
                features: ['Product Registration', 'QR Generation', 'Analytics Dashboard']
              },
              {
                title: 'Logistics',
                description: 'Add checkpoints, update status, ensure compliance',
                features: ['Mobile Scanning', 'GPS Integration', 'Status Updates']
              },
              {
                title: 'Retailers',
                description: 'Verify authenticity, manage inventory, protect customers',
                features: ['Verification Tools', 'Inventory Tracking', 'Consumer Reports']
              },
              {
                title: 'Consumers',
                description: 'Scan products, verify authenticity, view complete history',
                features: ['QR Scanner', 'Journey View', 'Safety Alerts']
              }
            ].map((stakeholder, i) => (
              <div key={i} className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 hover:border-blue-500/50 transition">
                <h3 className="text-2xl font-bold mb-4">{stakeholder.title}</h3>
                <p className="text-slate-400 mb-6">{stakeholder.description}</p>
                <ul className="space-y-2">
                  {stakeholder.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of businesses building trust with blockchain transparency
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-lg bg-white text-blue-600 hover:shadow-2xl transition text-lg font-semibold">
              Start Free Trial
            </button>
            <button className="px-8 py-4 rounded-lg border-2 border-white text-white hover:bg-white/10 transition text-lg font-semibold">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">NexusChain</span>
              </div>
              <p className="text-slate-400 text-sm">
                Blockchain-powered supply chain transparency for a safer world.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Security', 'Roadmap'].map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-slate-400 hover:text-blue-400 transition text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'API Reference', 'Support', 'Community'].map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-slate-400 hover:text-blue-400 transition text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                {['GitHub', 'Twitter', 'Discord', 'Email'].map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-slate-400 hover:text-blue-400 transition text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            <p>© 2025 NexusChain. Built for Intellibus AI Hackathon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}