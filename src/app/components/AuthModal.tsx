import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      toast.success('Welcome back, Admin!');
      onOpenChange(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <div className="bg-black p-8 text-center text-white">
          <DialogHeader className="p-0">
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">Admin Login</DialogTitle>
            <p className="mt-2 text-sm text-gray-400">Enter your credentials to manage Clicksuq</p>
          </DialogHeader>
        </div>

        <div className="p-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="admin@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="h-11 border-gray-200 focus:border-black focus:ring-black transition-all"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">Password</Label>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="h-11 border-gray-200 focus:border-black focus:ring-black transition-all"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-black hover:bg-black/90 text-white font-bold rounded-lg transition-all shadow-lg active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Authenticating...
                </span>
              ) : 'Sign In to Dashboard'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
