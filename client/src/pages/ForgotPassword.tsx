import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setTokenState] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`${API}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMsg(data.message);
    if (data.resetToken) {
      setTokenState(data.resetToken);
      setStep('reset');
    } else {
      setStep('done');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`${API}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setMsg('Password reset successfully!');
      setStep('done');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-3xl font-bold text-white text-center mb-8">Reset Password</h1>

      {step === 'email' && (
        <form onSubmit={handleEmail} className="bg-dark-800 rounded-xl p-6 border border-dark-600 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Enter your email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleReset} className="bg-dark-800 rounded-xl p-6 border border-dark-600 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
          <p className="text-green-400 text-sm">{msg}</p>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Reset Token</label>
            <input type="text" value={token} onChange={e => setTokenState(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">New Password</label>
            <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-600 text-center">
          <div className="text-5xl mb-4">&#10003;</div>
          <p className="text-gray-300 mb-6">{msg}</p>
          <Link to="/login" className="btn-primary inline-block">Back to Sign In</Link>
        </div>
      )}
    </div>
  );
}