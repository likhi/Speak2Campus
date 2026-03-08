'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('adminToken', data.token);

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">SPEAK2CAMPUS</h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@seshadripuram.edu"
                className="h-10"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 mt-6"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">
              Email: <span className="font-mono">admin@seshadripuram.edu</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Password: <span className="font-mono">admin123</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
