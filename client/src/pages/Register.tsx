import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-3xl font-bold text-white text-center mb-8">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl p-6 border border-dark-600 space-y-4">
        {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <div>
          <label className="text-gray-300 text-sm font-medium block mb-1.5">Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-gray-300 text-sm font-medium block mb-1.5">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-gray-300 text-sm font-medium block mb-1.5">Password</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign In</Link>
        </p>
      </form>
    </div>
  );
}