import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import { Activity, Zap, Map, TrendingDown, Users, Shield, Clock, Target } from 'lucide-react';

interface StatCard {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const statCards: StatCard[] = [
    {
      icon: <Activity size={28} />,
      title: 'Active Ambulances',
      value: '24',
      subtitle: 'Online & Ready',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: <Clock size={28} />,
      title: 'Avg Response Time',
      value: '4.2 min',
      subtitle: 'Down from 6.8 min',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <TrendingDown size={28} />,
      title: 'Response Efficiency',
      value: '94%',
      subtitle: '+12% improvement',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: <Users size={28} />,
      title: 'Emergency Calls',
      value: '156',
      subtitle: 'Handled today',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const featureCards: FeatureCard[] = [
    {
      icon: <Map size={32} />,
      title: 'Live Tracking',
      description: 'Real-time GPS monitoring of all ambulances with predictive routing and traffic integration',
      action: 'View Map →',
      color: 'from-blue-50 to-cyan-50'
    },
    {
      icon: <Zap size={32} />,
      title: 'Smart Allocation',
      description: 'ML-powered ambulance dispatch system that optimizes resource allocation based on demand prediction',
      action: 'View Details →',
      color: 'from-yellow-50 to-orange-50'
    },
    {
      icon: <TrendingDown size={32} />,
      title: 'Analytics & Insights',
      description: 'Comprehensive performance metrics, heatmaps, and actionable insights for operations',
      action: 'View Analytics →',
      color: 'from-purple-50 to-pink-50'
    },
    {
      icon: <Target size={32} />,
      title: 'Demand Prediction',
      description: 'Advanced ML models predict high-risk zones and emergency hotspots for proactive positioning',
      action: 'Explore Predictions →',
      color: 'from-green-50 to-emerald-50'
    },
    {
      icon: <Users size={32} />,
      title: 'Resource Management',
      description: 'Manage staff, ambulances, and equipment with automated scheduling and availability tracking',
      action: 'Manage Resources →',
      color: 'from-red-50 to-pink-50'
    },
    {
      icon: <Shield size={32} />,
      title: 'Emergency Alerts',
      description: 'Instant notifications for critical incidents with priority-based dispatching and escalation',
      action: 'View Alerts →',
      color: 'from-indigo-50 to-blue-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      {/* Hero Section with Background Image */}
      <section
        className="pt-24 pb-16 px-4 md:px-8 relative overflow-hidden"
        style={{
          backgroundImage: `url('https://media.istockphoto.com/id/1328547946/vector/rotation-of-the-ambulance-by-45-degrees.jpg?s=612x612&w=0&k=20&c=qtllVKvsf7N3_MMgUZAbm9Xr9F77OtvtveVstIdVfCA=')`,
          backgroundSize: 'contain',
          backgroundRepeat:'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-800/45 via-red-800/80 to-red-900/85"></div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-slideIn">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                  Emergency Response
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-300">
                    Redefined
                  </span>
                </h1>
              </div>
              <p className="text-xl text-red-100 max-w-xl leading-relaxed">
                Leverage machine learning to optimize ambulance allocation, predict emergency hotspots, and reduce response time by up to 40%.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="px-8 py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Start Monitoring
                </button>
                <button className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            {/* Stats on Right */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-slideIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 text-white`}>
                    {stat.icon}
                  </div>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-300 mt-1">{stat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Mobile */}
      <section className="md:hidden px-4 py-8 bg-white">
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
            >
              <div className={`bg-gradient-to-br ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-white`}>
                {stat.icon}
              </div>
              <p className="text-xs text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-green-600 mt-1">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to optimize emergency response and save lives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featureCards.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-red-900 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <button className="inline-flex items-center text-red-900 font-bold hover:text-red-700 transition-colors duration-300 group/btn">
                  <span>{feature.action}</span>
                  <span className="ml-2 transform group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-red-900 via-red-800 to-red-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">40%</p>
              <p className="text-red-200">Response Time Reduction</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">94%</p>
              <p className="text-red-200">Service Coverage</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">24/7</p>
              <p className="text-red-200">Real-time Operations</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">1000+</p>
              <p className="text-red-200">Lives Impacted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p>© 2026 Smart Ambulance Allocation System. All rights reserved.</p>
          <p className="text-sm mt-2">Machine Learning powered Emergency Medical Response</p>
        </div>
      </footer>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.8s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;