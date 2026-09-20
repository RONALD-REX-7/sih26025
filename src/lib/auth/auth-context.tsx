'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, USER_ROLES } from '@/lib/domain/constants';
import { UserProfile } from '@/lib/domain/types';
import { createClient } from '@/lib/supabase/client';

export interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  role: UserRole;
  isDemoUser: boolean;
  isLoading: boolean;
  setDemoRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  Administrator: {
    id: 'demo-admin-001',
    full_name: 'Dr. A. K. Sengupta (Admin)',
    email: 'admin.sih26025@coalfield.in',
    role: 'Administrator',
    mine_id: 'MINE-JHR-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  SafetyOfficer: {
    id: 'demo-safety-002',
    full_name: 'Rajesh Kumar (Safety In-Charge)',
    email: 'safety.bhowra@coalfield.in',
    role: 'SafetyOfficer',
    mine_id: 'MINE-JHR-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  MineManager: {
    id: 'demo-mgr-003',
    full_name: 'S. N. Murthy (Colliery Agent)',
    email: 'manager.bhowra@coalfield.in',
    role: 'MineManager',
    mine_id: 'MINE-JHR-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  Engineer: {
    id: 'demo-eng-004',
    full_name: 'Priyanka Verma (Geotechnical Engineer)',
    email: 'geotech.verma@coalfield.in',
    role: 'Engineer',
    mine_id: 'MINE-JHR-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('SafetyOfficer');
  const [profile, setProfile] = useState<UserProfile | null>(DEMO_PROFILES.SafetyOfficer);
  const [user, setUser] = useState<{ id: string; email: string } | null>({
    id: DEMO_PROFILES.SafetyOfficer.id,
    email: DEMO_PROFILES.SafetyOfficer.email,
  });
  const [isDemoUser, setIsDemoUser] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' });
          setIsDemoUser(false);

          // Fetch profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setProfile(data as unknown as UserProfile);
            setRole((data as unknown as UserProfile).role);
          } else {
            // Default to Engineer if profile missing
            const fallback: UserProfile = {
              id: session.user.id,
              full_name: session.user.email?.split('@')[0] ?? 'User',
              email: session.user.email ?? '',
              role: 'Engineer',
              mine_id: 'MINE-JHR-001',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setProfile(fallback);
            setRole('Engineer');
          }
        } else {
          // Default to SafetyOfficer demo persona
          setRole('SafetyOfficer');
          setProfile(DEMO_PROFILES.SafetyOfficer);
          setUser({
            id: DEMO_PROFILES.SafetyOfficer.id,
            email: DEMO_PROFILES.SafetyOfficer.email,
          });
          setIsDemoUser(true);
        }
      } catch (err) {
        console.warn('Supabase auth session check fell back to demo persona:', err);
        setRole('SafetyOfficer');
        setProfile(DEMO_PROFILES.SafetyOfficer);
        setIsDemoUser(true);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const setDemoRole = (newRole: UserRole) => {
    if (USER_ROLES.includes(newRole)) {
      setRole(newRole);
      setProfile(DEMO_PROFILES[newRole]);
      setUser({
        id: DEMO_PROFILES[newRole].id,
        email: DEMO_PROFILES[newRole].email,
      });
      setIsDemoUser(true);
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    // Reset to demo SafetyOfficer
    setRole('SafetyOfficer');
    setProfile(DEMO_PROFILES.SafetyOfficer);
    setUser({
      id: DEMO_PROFILES.SafetyOfficer.id,
      email: DEMO_PROFILES.SafetyOfficer.email,
    });
    setIsDemoUser(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isDemoUser,
        isLoading,
        setDemoRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
