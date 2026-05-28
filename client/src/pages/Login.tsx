import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-3xl font-bold text-white text-center mb-8">Sign In</h1>
      <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl p-6 border border-dark-600 space-y-4">
        {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <div>
          <label className="text-gray-300 text-sm font-medium block mb-1.5">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-gray-300 text-sm font-medium block mb-1.5">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="text-center text-sm text-gray-400 space-y-2">
          <p><Link to="/forgot-password" className="text-brand-400 hover:text-brand-300">Forgot password?</Link></p>
          <p>Don't have an account? <Link to="/register" className="text-brand-400 hover:text-brand-300">Sign Up</Link></p>
        </div>
      </form>
    </div>
  );
}