'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(`Welcome back, ${result.user.name}!`);
        window.location.href = result.user.role === 'admin' ? '/admin' : '/';
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-white">
            Welcome Back<span className="text-cyan-400">_</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to access your PC builds
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                className={`block w-full bg-slate-800 border ${
                  errors.email ? 'border-red-500' : 'border-slate-700'
                } rounded-lg py-2.5 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password"
                className={`block w-full bg-slate-800 border ${
                  errors.password ? 'border-red-500' : 'border-slate-700'
                } rounded-lg py-2.5 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <span className="text-slate-400">Don't have an account? </span>
          <Link href="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
