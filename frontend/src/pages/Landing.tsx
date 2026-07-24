import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, Users, ShieldCheck, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Navigation */}
      <nav className="bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">COPO Vision</span>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <a href="#features" className="hover:text-accent transition-colors">Features</a>
          <a href="#about" className="hover:text-accent transition-colors">About</a>
          <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
        </div>
        <Link 
          to="/login" 
          className="bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-full font-medium transition-all shadow-md flex items-center gap-2"
        >
          Login <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-primary to-primary-dark text-white py-20 px-6 md:px-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 max-w-4xl tracking-tight z-10">
          Predictive Analytics Platform for <span className="text-accent">NBA Outcome Attainment</span>
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mb-10 z-10 leading-relaxed">
          Streamline Outcome-Based Education (OBE) for your institution. Manage students, faculty, and master data with a robust, intelligent platform designed for modern education.
        </p>
        <div className="flex gap-4 z-10">
          <Link to="/login" className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Get Started
          </Link>
          <a href="#features" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all">
            Learn More
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-12 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Powerful Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Everything you need to manage your institution's academic architecture efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Role-Based Access</h3>
              <p className="text-slate-600 leading-relaxed">
                Dedicated dashboards and permissions for Administrators, HODs, Faculty, and Students.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-teal-50 text-accent rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Master Data Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Easily manage Departments, Courses, Subjects, and Academic Years in one centralized hub.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Enterprise Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Built with industry-standard JWT authentication and robust data protection protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 md:px-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="text-lg font-bold text-white tracking-tight">COPO Vision</span>
          </div>
          <p className="text-sm">© 2026 COPO Vision. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
