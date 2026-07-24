import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Settings = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data as UserProfile;
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '' // empty by default
      });
    }
  }, [user, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const payload: any = {
        name: data.name,
        email: data.email
      };
      if (data.password && data.password.trim() !== '') {
        payload.password = data.password;
      }
      return api.put('/users/me', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-me'] });
      setSuccessMsg('Profile updated successfully!');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Force reload to update the global user object stored in Layout
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (err: any) => {
      setSuccessMsg('');
      setErrorMsg(err.response?.data?.detail || 'An error occurred while updating profile.');
    }
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Profile Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information and security preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {successMsg && (
          <div className="m-6 mb-0 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="m-6 mb-0 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
          
          {/* Personal Information Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    {...register('name', { required: 'Name is required' })} 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message?.toString()}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })} 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow text-slate-900"
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message?.toString()}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text"
                    value={user?.role.toUpperCase()}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Your role dictates your permissions and cannot be changed here.</p>
              </div>

            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Security Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" /> Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="password"
                    {...register('password', {
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })} 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow text-slate-900"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message?.toString()}</p>}
              </div>

            </div>
          </section>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => {
                reset({ name: user?.name, email: user?.email, password: '' });
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Settings;
