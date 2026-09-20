'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/domain/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, HardHat, Activity, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-mono font-medium tracking-wide">
            <Activity className="h-3.5 w-3.5" />
            SIH26025 &bull; DGMS COMPLIANT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Mine Subsidence Early Warning System
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-Time AI-Enabled Telemetry & Subsidence Risk Platform &bull; Jharia Coalfield Prototype
          </p>
        </div>

        {/* Quick Demo Access (Judges & Evaluators) */}
        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-950 dark:text-amber-200">
                <UserCheck className="h-4 w-4 text-amber-600" />
                SIH Hackathon Evaluation Persona
              </CardTitle>
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 text-[10px]">
                DEMO MODE
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              Select an operational role to immediately inspect dashboard permissions and workflow:
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('SafetyOfficer')}
              className="justify-start text-xs h-auto py-2 px-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500"
            >
              <Shield className="h-3.5 w-3.5 mr-2 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Safety Officer</div>
                <div className="text-[10px] text-muted-foreground">Alerts & Evac</div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('MineManager')}
              className="justify-start text-xs h-auto py-2 px-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500"
            >
              <HardHat className="h-3.5 w-3.5 mr-2 text-blue-600 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Mine Manager</div>
                <div className="text-[10px] text-muted-foreground">Panels & Ops</div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('Engineer')}
              className="justify-start text-xs h-auto py-2 px-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500"
            >
              <Activity className="h-3.5 w-3.5 mr-2 text-purple-600 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Geotech Eng.</div>
                <div className="text-[10px] text-muted-foreground">Telemetry & InSAR</div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectDemoPersona('Administrator')}
              className="justify-start text-xs h-auto py-2 px-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500"
            >
              <Shield className="h-3.5 w-3.5 mr-2 text-red-600 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Administrator</div>
                <div className="text-[10px] text-muted-foreground">Audit & Systems</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Credentials Form (Production Supabase) */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Authorized Credential Sign-In</CardTitle>
            <CardDescription className="text-xs">
              For colliery personnel with authenticated Supabase credentials
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCredentialsLogin}>
            <CardContent className="space-y-3">
              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Official Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="officer@coalfield.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full h-9 text-xs font-medium" disabled={isSubmitting}>
                {isSubmitting ? 'Authenticating...' : 'Sign In with Supabase'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="w-full text-xs text-muted-foreground"
              >
                Continue to Dashboard in Demo Mode <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer DGMS Notice */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          DGMS Technical Circular (Coal) No. 04 of 2017 &bull; Smart India Hackathon 2026
        </div>
      </div>
    </div>
  );
}
