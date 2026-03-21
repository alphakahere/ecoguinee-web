'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { redirectForRole } from '@/lib/types';
import type { UserRole } from '@/lib/types';

interface AuthGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount detection
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.replace('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      router.replace(redirectForRole(user.role));
    }
  }, [mounted, token, user, allowedRoles, router]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) return null;
  if (user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
