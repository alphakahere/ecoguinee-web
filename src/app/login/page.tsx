'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth.store';
import { redirectByRole } from '@/lib/types';
import { getErrorMessage } from '@/services/api';

function looksLikePhone(value: string) {
  return /^[+\d]/.test(value.trim()) && /\d{6,}/.test(value.replace(/\s/g, ''));
}

/** Internal paths only — blocks open redirects */
function safeInternalNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const nextPath = useMemo(
    () => safeInternalNext(searchParams.get('next')),
    [searchParams],
  );

  useEffect(() => {
    if (token && user) router.replace(redirectByRole(user.role));
  }, [token, user, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: '', password: '' },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- idiomatic RHF pattern
  const emailOrPhoneValue = watch('emailOrPhone');
  const isPhone = looksLikePhone(emailOrPhoneValue);

  async function onSubmit(data: LoginInput) {
    try {
      const { user, token } = await authService.login(data.emailOrPhone, data.password);
      setUser(user, token);
      toast.success(`Bienvenue, ${user.name} !`);
      router.push(nextPath ?? redirectByRole(user.role));
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Identifiants incorrects. Veuillez réessayer.');
      toast.error(message);
    }
  }

  const inputCls =
    'flex h-11 w-full rounded-xl border border-input bg-input-background pl-10 pr-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: '#0A1A10' }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1200 700"
        >
          <g fill="none" stroke="rgba(111,207,74,0.1)" strokeWidth="1">
            {[280, 240, 200, 162, 126, 92, 60].map((r, i) => (
              <ellipse key={i} cx="600" cy="350" rx={r * 2.2} ry={r * 1.3} />
            ))}
          </g>
        </svg>
        <div
          className="absolute pointer-events-none"
          style={{
            width: '60vw', height: '60vw', maxWidth: 700, maxHeight: 700,
            background: 'radial-gradient(circle, rgba(45,125,70,0.25) 0%, transparent 65%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white block">EcoGuinée</span>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              Conakry · Guinée
            </span>
          </div>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1
              className="font-bold text-white mb-4"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', lineHeight: 1.2 }}
            >
              Ensemble pour une Guinée
              <br />
              <span style={{ color: '#6FCF4A' }}>plus propre</span>
            </h1>
            <p className="font-mono text-white/50 max-w-md" style={{ lineHeight: 1.7 }}>
              Connectez-vous pour accéder à votre espace de gestion et contribuer
              à la lutte contre les déchets sauvages.
            </p>
          </motion.div>
        </div>

        <p className="relative text-xs font-mono text-white/30">
          © {new Date().getFullYear()} EcoGuinée — République de Guinée
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">EcoGuinée</span>
          </div>

          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(45,125,70,0.08)', border: '1px solid rgba(45,125,70,0.2)' }}
            >
              <Leaf className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-primary">
                Connexion
              </span>
            </div>
            <h2 className="font-bold text-2xl mb-2">Accédez à votre espace</h2>
            <p className="text-sm font-mono text-muted-foreground">
              Entrez vos identifiants pour vous connecter.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="emailOrPhone" className="text-sm font-medium">
                Email ou téléphone
              </label>
              <div className="relative">
                {isPhone ? (
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                ) : (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
                <input
                  id="emailOrPhone"
                  type="text"
                  autoComplete="username"
                  placeholder="nom@ecoguinee.gn ou +224 6XX…"
                  className={`${inputCls} ${errors.emailOrPhone ? 'border-[#D94035] focus-visible:ring-[#D94035]' : ''}`}
                  {...register('emailOrPhone')}
                />
              </div>
              {errors.emailOrPhone && (
                <p className="text-xs text-[#D94035]">{errors.emailOrPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-mono text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputCls} pr-10 ${errors.password ? 'border-[#D94035] focus-visible:ring-[#D94035]' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#D94035]">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full h-11 rounded-xl bg-primary text-white font-mono text-sm flex items-center justify-center gap-2 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
