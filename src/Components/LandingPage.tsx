'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  MapPin,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Users,
  Zap as Lightning,
  MapPinned,
  BarChart3,
  Smartphone,
  AlertTriangle,
  Waves,
  Star,
  CheckCircle,
  Activity,
  Ambulance,
  PhoneCall,
  Database,
  Cpu,
  Gauge,
  Headphones,
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: 'ease-in-out',
      once: false,
      offset: 50,
    });

    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Determine active section based on scroll position
      const sections = ['home', 'services', 'features', 'analytics', 'how-it-works', 'testimonials', 'why-choose-us'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
      setActiveSection(id);
    }
  };

  const navBg = scrollY > 50
    ? 'bg-gradient-to-r from-blue-600/95 to-blue-700/95 backdrop-blur-lg shadow-2xl'
    : 'bg-gradient-to-r from-blue-500 to-blue-600 backdrop-blur-md';

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Services', id: 'services' },
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Why Choose Us', id: 'why-choose-us' },
  ];
  const navigate = useNavigate();
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }

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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-10deg) scale(0.9);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flipIn {
          from {
            opacity: 0;
            transform: rotateY(100deg);
          }
          to {
            opacity: 1;
            transform: rotateY(0deg);
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }

        .animate-fade-scale {
          animation: fadeInScale 0.8s ease-out;
        }

        .animate-rotate-in {
          animation: rotateIn 0.8s ease-out;
        }

        .animate-bounce-in {
          animation: bounceIn 0.8s ease-out;
        }

        .animate-shimmer {
          background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .animate-pulse-ring {
          animation: pulse-ring 1.5s infinite;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }

        .animate-flip-in {
          animation: flipIn 0.8s ease-out;
        }

        .video-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.5;
          z-index: 0;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(37, 99, 235, 0.7) 100%);
          z-index: 1;
        }

        .services-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .services-card:hover {
          transform: translateY(-8px);
        }

        .nav-link-active {
          color: white;
          position: relative;
          font-weight: 600;
        }

        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, #FFA500, #FF6347);
          border-radius: 2px;
          animation: expandWidth 0.3s ease-out;
        }

        .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .testimonial-card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .stat-number {
          background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-text-wrap {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-110">
                <img src='Logo.png' style={{borderRadius:"8px"}} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">Smart Ambulance Allocation System</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`transition-all duration-300 font-medium relative pb-2 ${activeSection === item.id
                      ? 'nav-link-active text-white'
                      : 'text-blue-50 hover:text-white'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <button onClick={()=>{navigate('/login')}} className="hidden md:block px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Get Started
            </button>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-slide-in">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-white hover:bg-blue-400/30'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <section id="home" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 bg-gradient-to-br from-blue-500 via-blue-550 to-blue-600">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="video-background"
          src="/src/Components/Images/Video1.mp4"
        />
        <div className="video-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white" data-aos="fade-right" data-aos-duration="1200">
              <h1 className="text-4xl md:text-4xl lg:text-4xl font-bold mb-6 leading-tight animate-slide-in-left">
                AI-Powered Emergency Response System
              </h1>
              <p style={{textAlign:"justify"}} className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-lg animate-slide-up" data-aos="fade-up" data-aos-delay="200">
                Revolutionize ambulance allocation with machine learning. Reduce response time by 95% and save more lives with our intelligent dispatch system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up" data-aos="fade-up" data-aos-delay="300">
                <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95">
                  Start Free Trial
                </button>
                <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95">
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg">
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/30 animate-bounce-in" data-aos="zoom-in" data-aos-delay="200">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300">95%</div>
                  <div className="text-sm text-blue-100 font-medium">Faster Response</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/30 animate-bounce-in" data-aos="zoom-in" data-aos-delay="400">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300">500+</div>
                  <div className="text-sm text-blue-100 font-medium">Active Partners</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/30 animate-bounce-in" data-aos="zoom-in" data-aos-delay="600">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300">24/7</div>
                  <div className="text-sm text-blue-100 font-medium">Support</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:flex justify-center items-center" data-aos="fade-left" data-aos-duration="1200">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-2xl opacity-30 animate-pulse-ring"></div>
                <img
                  src="https://media.istockphoto.com/id/1127958600/vector/ambulance-service-urgent-911-hospital-emergency-call-vector-concept.jpg?s=612x612&w=0&k=20&c=9Ignl_6M8545lKr_SXFZObvp1b4aUOtKhO6fiQpVGDg="
                  alt="Ambulance Emergency Service"
                  className="relative w-full h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 filter drop-shadow-lg transform hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown size={32} className="text-white" />
        </div>
      </section>

      {/* SERVICES SECTION WITH VIDEO BACKGROUNDS */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Comprehensive solutions for modern emergency management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPinned, title: 'Hotspot Prediction', desc: 'AI predicts emergency hotspots using traffic and historical data', video: '/src/Components/Images/Video1.mp4' },
              { icon: Ambulance, title: 'Smart Allocation', desc: 'Automatically assigns nearest ambulances for optimal response', video: '/src/Components/Images/Video2.mp4' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor fleet performance with comprehensive dashboards', video: '/src/Components/Images/Video1.mp4' },
              { icon: Lightning, title: 'Quick Response', desc: 'Reduce response time with optimized routing and dispatch', video: '/src/Components/Images/Video2.mp4' },
              { icon: AlertTriangle, title: 'Incident Detection', desc: 'Advanced system detects and prioritizes emergency calls', video: '/src/Components/Images/Video1.mp4' },
              { icon: Smartphone, title: 'Mobile Management', desc: 'Manage entire fleet from any device seamlessly', video: '/src/Components/Images/Video2.mp4' },
            ].map((service, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 services-card h-80 bg-gray-100"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                {/* Video Background */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                  src={service.video}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 to-blue-700/60 group-hover:from-blue-500/70 group-hover:to-blue-600/70 transition-all duration-300" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                  <div className="text-5xl mb-4 group-hover:animate-float transform transition-transform duration-300">
                    <service.icon className="text-white drop-shadow-lg" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-blue-100">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need for efficient emergency management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'Machine Learning', desc: 'Algorithms improve with every emergency response', color: 'from-blue-500 to-cyan-500' },
              { icon: MapPin, title: 'GPS Tracking', desc: 'Real-time location tracking with live visualization', color: 'from-cyan-500 to-teal-500' },
              { icon: Shield, title: 'Secure Data', desc: 'Enterprise-grade security for sensitive data', color: 'from-green-500 to-emerald-500' },
              { icon: Clock, title: 'Fast Integration', desc: 'Compatible with existing hospital systems', color: 'from-purple-500 to-violet-500' },
              { icon: TrendingUp, title: 'Performance Metrics', desc: 'Detailed tracking of all KPIs and improvements', color: 'from-orange-500 to-red-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated team available round the clock', color: 'from-pink-500 to-rose-500' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl transform hover:scale-105 hover:-translate-y-2 animate-fade-scale group"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO ANALYTICS SECTION WITH VIDEO BACKGROUND */}
      <section id="analytics" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-blue-50">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="video-background"
          src="/src/Components/Images/Video2.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-blue-50/95 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right" data-aos-duration="1200">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Real-time Analytics & Monitoring</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Track every ambulance, every call, every response time. Our advanced analytics dashboard provides complete visibility into your emergency response operations.
              </p>
              <ul className="space-y-4">
                {['Live ambulance tracking', 'Response time analytics', 'Performance dashboards', 'Predictive insights'].map((item, idx) => (
                  <li key={idx} className="flex items-center text-gray-700 font-medium group" data-aos="fade-right" data-aos-delay={idx * 100}>
                    <CheckCircle className="w-5 h-5 text-green-500 mr-4 group-hover:scale-125 transition-transform" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:block" data-aos="fade-left" data-aos-duration="1200">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-blue-300/50 animate-float shadow-xl transform hover:scale-105 transition-transform">
                <div className="space-y-6">
                  {/* Active Ambulances */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sky-400 font-semibold">Active Ambulances</span>
                      <span className="text-3xl font-bold text-blue-400 stat-number">247</span>
                    </div>
                    <div className="w-full bg-amber-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full w-11/12 shadow-lg animate-shimmer" />
                    </div>
                  </div>

                  {/* Avg Response Time */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-amber-100 font-semibold">Avg Response Time</span>
                      <span className="text-3xl font-bold text-emerald-400 stat-number">
                        3.2 min
                      </span>
                    </div>
                    <div className="w-full bg-cyan-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full w-1/3 shadow-lg animate-shimmer" />
                    </div>
                  </div>

                  {/* Active Calls */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white">Active Calls</span>
                      <span className="text-3xl font-bold text-rose-400 stat-number">
                        1,245
                      </span>
                    </div>
                    <div className="w-full bg-blue-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full w-3/4 shadow-lg animate-shimmer" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION WITH VIDEOS */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Six-step process for optimal emergency response</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Emergency Detection', icon: PhoneCall, video: '/src/Components/Images/Video1.mp4' },
              { num: '02', title: 'Data Analysis', icon: Database, video: '/src/Components/Images/Video2.mp4' },
              { num: '03', title: 'Smart Allocation', icon: Gauge, video: '/src/Components/Images/Video1.mp4' },
              { num: '04', title: 'Route Optimization', icon: MapPin, video: '/src/Components/Images/Video2.mp4' },
              { num: '05', title: 'Patient Care', icon: Activity, video: '/src/Components/Images/Video1.mp4' },
              { num: '06', title: 'System Learning', icon: TrendingUp, video: '/src/Components/Images/Video2.mp4' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="group relative"
                data-aos="zoom-in"
                data-aos-delay={idx * 150}
              >
                {/* Video Background */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                  src={step.video}
                />

                <div className="relative bg-gradient-to-br from-blue-600/80 to-blue-700/80 group-hover:from-blue-500/90 group-hover:to-blue-600/90 rounded-2xl p-8 border-2 border-blue-400/50 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl min-h-80 flex flex-col items-center justify-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center border-4 border-white group-hover:animate-glow shadow-lg transform group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-xl">{step.num}</span>
                    </div>
                  </div>
                  <div className="pt-12 text-center">
                    <div className="mb-4 transform group-hover:scale-125 transition-transform duration-300">
                      <step.icon className="text-white drop-shadow-lg mx-auto" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Trusted by healthcare professionals across the globe</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Mitchell',
                role: 'Chief Medical Officer',
                hospital: 'City General Hospital',
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                text: 'SmartAmbulance reduced our average response time from 12 minutes to just 3 minutes. Lives are being saved every day because of this incredible system.',
                rating: 5,
              },
              {
                name: 'James Rodriguez',
                role: 'Emergency Services Director',
                hospital: 'Metro Emergency Services',
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
                text: 'The AI predictions are remarkably accurate. We can now pre-position ambulances before emergencies occur. This is the future of emergency response.',
                rating: 5,
              },
              {
                name: 'Emma Thompson',
                role: 'Hospital Administrator',
                hospital: 'St. Johns Medical Center',
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
                text: 'Implementation was seamless, and the ROI was immediate. Our dispatch team loves the mobile interface, and patient outcomes have improved significantly.',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="testimonial-card rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-flip-in"
                data-aos="fade-up"
                data-aos-delay={idx * 150}
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full mr-4 border-2 border-blue-500 shadow-md transform hover:scale-110 transition-transform"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{testimonial.role}</p>
                    <p className="text-xs text-gray-500 truncate">{testimonial.hospital}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section id="why-choose-us" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Proven results and trusted by leading healthcare organizations</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { stat: '95%', label: 'Faster Response', desc: 'Measurable impact on patient outcomes', icon: Zap },
              { stat: '500+', label: 'Active Partners', desc: 'Leading hospitals and services', icon: Users },
              { stat: '24/7', label: 'Support Available', desc: 'Dedicated technical assistance', icon: Headphones },
              { stat: '∞', label: 'Continuous Learning', desc: 'Improving with every call', icon: Cpu },
            ].map((reason, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 text-center hover:shadow-xl transform hover:scale-105 group animate-slide-up"
                data-aos="zoom-in"
                data-aos-delay={idx * 100}
              >
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all">
                    <reason.icon size={32} />
                  </div>
                </div>
                <div className="text-5xl font-bold stat-number mb-3">
                  {reason.stat}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{reason.label}</h3>
                <p className="text-gray-600">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center" data-aos="zoom-in" data-aos-duration="1200">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Emergency Response?</h2>
          <p className="text-xl text-blue-100 mb-12">
            Join hundreds of hospitals and emergency services improving patient outcomes every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Start Your Free Trial
            </button>
            <button className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER WITH VIDEO BACKGROUND */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-900">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="video-background"
          src="/src/Components/Images/FooterVideo1.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/98 via-gray-900/95 to-gray-900/85 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1" data-aos="fade-up">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <img src='Logo.png' className="text-white" style={{ borderRadius: "8px" }} />
                </div>
                <span className="text-white font-bold text-lg">SmartAmbulance</span>
              </div>
              <p className="text-yellow-400 leading-relaxed footer-text-wrap">AI-powered emergency response solutions saving lives every day.</p>
            </div>

            {/* Product */}
            <div data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-white font-bold mb-6 text-lg">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-cyan-400 hover:text-white transition-colors duration-300 flex items-center group footer-text-wrap">
                      <span className="group-hover:translate-x-2 transition-transform">→</span>
                      <span className="ml-2">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-white font-bold mb-6 text-lg">Company</h3>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-cyan-400 hover:text-white transition-colors duration-300 flex items-center group footer-text-wrap">
                      <span className="group-hover:translate-x-2 transition-transform">→</span>
                      <span className="ml-2">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div data-aos="fade-up" data-aos-delay="300">
              <h3 className="text-white font-bold mb-6 text-lg">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-400 hover:text-blue-400 transition-colors duration-300 group footer-text-wrap">
                  <span className="mr-3 mt-1 flex-shrink-0">📧</span>
                  <div className="min-w-0">
                    <p className="font-medium text-white group-hover:text-blue-400 transition-colors">Email</p>
                    <p className="text-cyan-400 hover:text-white text-sm break-words">support@smartambulance.com</p>
                  </div>
                </li>
                <li className="flex items-start text-gray-400 hover:text-blue-400 transition-colors duration-300 group footer-text-wrap">
                  <span className="mr-3 mt-1 flex-shrink-0">📞</span>
                  <div className="min-w-0">
                    <p className="font-medium text-white group-hover:text-blue-400 transition-colors">Phone</p>
                    <p className="text-cyan-400 hover:text-white text-sm break-words">+1 (555) 123-4567</p>
                  </div>
                </li>
                <li className="flex items-start text-gray-400 hover:text-blue-400 transition-colors duration-300 group footer-text-wrap">
                  <span className="mr-3 mt-1 flex-shrink-0">📍</span>
                  <div className="min-w-0">
                    <p className="font-medium text-white group-hover:text-blue-400 transition-colors">Location</p>
                    <p className="text-cyan-400 hover:text-white text-sm break-words">New York, USA</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white-700 pt-8 text-center text-white">
            <p>&copy; 2026 SmartAmbulance. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}