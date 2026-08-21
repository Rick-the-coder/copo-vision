import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setError(null);
      // We will mock this request for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      // await api.post('/auth/forgot-password', { email: data.email });
      setIsSuccess(true);
    } catch (err: any) {
      setError("An error occurred while sending the reset link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-extrabold text-primary tracking-tight">COPO Vision</span>
        </Link>
        <h2 className="mt-2 text-center text-2xl font-bold text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Check your email</h3>
                <p className="text-slate-500 mt-2 text-sm">
                  We have sent a password reset link to your email address. Please check your inbox and spam folder.
                </p>
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 text-left">
                  <strong>Demo Note:</strong> Since this is a demo, you can directly proceed to the <Link to="/reset-password" className="underline font-bold">Reset Password</Link> page.
                </div>
              </div>
              <div className="pt-4">
                <Link to="/login" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to log in
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className={`block w-full pl-10 sm:text-sm rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 transition-shadow ${errors.email ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-primary'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
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
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </div>
              
              <div className="text-center">
                <Link to="/login" className="text-primary hover:text-primary-dark font-medium text-sm inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
