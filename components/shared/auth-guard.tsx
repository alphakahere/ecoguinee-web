'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth';
import { redirectByRole } from '@/lib/types';
import type { UserRole } from '@/lib/types';

interface AuthGuardProps {
  allowedRoles: UserRole[];
  /** Require the user to be linked to an organization (organizationId or memberOrganizationId). Shows an error if not. */
  requireOrganization?: boolean;
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, requireOrganization = false, children }: AuthGuardProps) {
  const router = useRouter();
  const { user, token, setUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [rehydrating, setRehydrating] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount detection
  useEffect(() => { setMounted(true); }, []);

  // Rehydrate user from token when user is null (e.g. after page refresh)
  useEffect(() => {
    if (!mounted || !token || user || rehydrating) return;
    setRehydrating(true);
    authService.me()
      .then((me) => { setUser(me, token); })
      .catch(() => { logout(); })
      .finally(() => { setRehydrating(false); });
  }, [mounted, token, user, rehydrating, setUser, logout]);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.replace('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      router.replace(redirectByRole(user.role));
    }
  }, [mounted, token, user, allowedRoles, router]);

  if (!mounted || rehydrating) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) return null;
  if (user && !allowedRoles.includes(user.role)) return null;

  if (requireOrganization && user && !user.organizationId && !user.memberOrganizationId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-sm space-y-3">
          <p className="text-sm font-semibold">Accès refusé</p>
          <p className="text-xs font-mono text-muted-foreground">
            Votre compte n'est associé à aucune organisation. Contactez un administrateur pour être rattaché à une organisation.
          </p>
          <button
            onClick={() => router.replace('/')}
            className="text-xs font-mono text-primary hover:underline"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
