import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, Shield, UserCheck, GraduationCap, School } from 'lucide-react';
import api from '../services/api';

const loginSchema = z.object({
  email: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@copovision.edu',
      password: 'Admin@123',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        username: data.email.trim(),
        password: data.password
      });
      
      const token = response.data.token || response.data.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data && (err.response.data.message || err.response.data.detail)) {
        setError(err.response.data.message || err.response.data.detail);
      } else {
        setError("Could not connect to backend server. Make sure 'python app.py' is running on port 5000.");
      }
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-extrabold text-primary tracking-tight">COPO Vision</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Outcome-Based Education Management Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email / Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  {...register("email")}
                  className={`block w-full pl-10 sm:text-sm rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 transition-shadow ${errors.email ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-primary'}`}
                  placeholder="admin@copovision.edu"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className={`block w-full pl-10 pr-10 sm:text-sm rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 transition-shadow ${errors.password ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-primary'}`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Demo Role Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@copovision.edu', 'Admin@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hod.cse@copovision.edu', 'Hod@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <School className="w-3.5 h-3.5 text-accent" />
                HOD
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('amit.verma@copovision.edu', 'Faculty@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('aarav.mehta@copovision.edu', 'Student@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                Student
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
