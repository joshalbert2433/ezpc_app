'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Account created successfully! Please sign in.');
        router.push('/login');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 bg-[var(--card)] p-10 rounded-3xl border border-[var(--card-border)] shadow-2xl backdrop-blur-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-[var(--foreground)] uppercase">
            Create Account<span className="text-[var(--primary)]">_</span>
          </h2>
          <p className="mt-2 text-center text-xs font-black uppercase tracking-widest text-[var(--muted)]">
            Initialize new user profile
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Full Identity</label>
              <input
                {...register('name')}
                type="text"
                className={`block w-full bg-[var(--input)] border ${
                  errors.name ? 'border-red-500' : 'border-[var(--card-border)]'
                } rounded-xl py-3 px-4 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1.5 text-[10px] font-black text-red-500 uppercase tracking-tight">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Comms Address</label>
              <input
                {...register('email')}
                type="email"
                className={`block w-full bg-[var(--input)] border ${
                  errors.email ? 'border-red-500' : 'border-[var(--card-border)]'
                } rounded-xl py-3 px-4 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all`}
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-[10px] font-black text-red-500 uppercase tracking-tight">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2">Access Key</label>
              <input
                {...register('password')}
                type="password"
                className={`block w-full bg-[var(--input)] border ${
                  errors.password ? 'border-red-500' : 'border-[var(--card-border)]'
                } rounded-xl py-3 px-4 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-[10px] font-black text-red-500 uppercase tracking-tight">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              {loading ? 'Processing...' : 'Execute Initialization'}
            </button>
          </div>
        </form>
        <div className="text-center text-xs font-black uppercase tracking-widest">
          <span className="text-[var(--muted)]">Already active? </span>
          <Link href="/login" className="text-[var(--primary)] hover:opacity-80 transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
