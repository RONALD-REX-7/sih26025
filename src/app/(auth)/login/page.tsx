'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/domain/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, HardHat, Activity, UserCheck, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoPersona = (role: UserRole) => {
    setDemoRole(role);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#173B57] text-[#FFFFFF] text-xs font-mono-tech font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2F6B4F]" />
            SIH26025 &bull; DGMS CMR 2017 Reg 112
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D2933]">
            Mine Subsidence Early Warning System
          </h1>
          <p className="text-xs text-[#52606D]">
            Real-Time AI-Enabled Telemetry &amp; Subsidence Risk Platform &bull; Jharia Coalfield Prototype
          </p>
        </div>

        {/* Quick Demo Access (Judges & Evaluators) */}
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D7DEDC] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-[#173B57]" />
              Evaluation personas (instant demo mode)
            </span>
            <span className="px-1.5 py-0.5 rounded-sm bg-[#EDF1F0] text-[#173B57] text-xs font-mono-tech font-semibold">
              DEMO
            </span>
          </div>
          <p className="text-xs text-[#52606D]">
            Select an operational colliery role to evaluate permissions, alerting, and statutory workflows:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('SafetyOfficer')}
              className="justify-start text-xs h-auto py-2.5 px-3 bg-[#FFFFFF] border-[#D7DEDC] hover:bg-[#EDF1F0] hover:border-[#173B57]"
            >
              <Shield className="h-4 w-4 mr-2 text-[#2F6B4F] shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-[#1D2933]">Safety Officer</div>
                <div className="text-xs text-[#52606D]">Alerts &amp; Evacuation</div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('MineManager')}
              className="justify-start text-xs h-auto py-2.5 px-3 bg-[#FFFFFF] border-[#D7DEDC] hover:bg-[#EDF1F0] hover:border-[#173B57]"
            >
              <HardHat className="h-4 w-4 mr-2 text-[#173B57] shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-[#1D2933]">Mine Manager</div>
                <div className="text-xs text-[#52606D]">Panels &amp; Operations</div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('Engineer')}
              className="justify-start text-xs h-auto py-2.5 px-3 bg-[#FFFFFF] border-[#D7DEDC] hover:bg-[#EDF1F0] hover:border-[#173B57]"
            >
              <Activity className="h-4 w-4 mr-2 text-[#9A6A00] shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-[#1D2933]">Geotech Engineer</div>
                <div className="text-xs text-[#52606D]">Sensors &amp; Calibration</div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('Administrator')}
              className="justify-start text-xs h-auto py-2.5 px-3 bg-[#FFFFFF] border-[#D7DEDC] hover:bg-[#EDF1F0] hover:border-[#173B57]"
            >
              <ShieldCheck className="h-4 w-4 mr-2 text-[#173B57] shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-[#1D2933]">Administrator</div>
                <div className="text-xs text-[#52606D]">Audit &amp; System</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Credentials Form (Production Supabase) */}
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3">
          <div className="border-b border-[#D7DEDC] pb-2">
            <h2 className="text-sm font-bold text-[#1D2933]">Authorized Credential Sign-In</h2>
            <p className="text-xs text-[#52606D]">
              For colliery personnel with authenticated Supabase credentials
            </p>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-3">
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-sm text-xs bg-[#FBEBE9] text-[#B42318] border border-[#B42318]/30">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs text-[#52606D]">Official email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="officer@coalfield.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs font-mono-tech bg-[#F4F6F5] border-[#D7DEDC]"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs text-[#52606D]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-xs font-mono-tech bg-[#F4F6F5] border-[#D7DEDC]"
                required
              />
            </div>
            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                className="w-full h-9 text-xs font-semibold bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating...' : 'Sign in with Supabase'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="w-full text-xs text-[#52606D] hover:text-[#1D2933] hover:bg-[#EDF1F0]"
              >
                Continue to dashboard in demo mode <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer DGMS Notice */}
        <div className="text-center text-xs text-[#74808A] font-mono-tech">
          DGMS Technical Circular (Coal) No. 04 of 2017 &bull; Smart India Hackathon 2026
        </div>
      </div>
    </div>
  );
}
