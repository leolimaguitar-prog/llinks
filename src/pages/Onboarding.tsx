import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';

const Onboarding: React.FC = () => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const { error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      setCheckingUsername(false);
      if (error && error.code === 'PGRST116') {
        // Not found means available
        setUsernameStatus('available');
      } else {
        setUsernameStatus('taken');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Redirect if already finished onboarding
  if (profile && !profile.username.startsWith('user_')) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== 'available') return;
    
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        username, 
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', user?.id);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      await refreshProfile();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
            <Sparkles className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Quase lá!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Escolha como as pessoas vão te encontrar
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Seu link único
              </label>
              <div className="mt-1 relative flex rounded-xl shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  biolinks.com/
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`block w-full flex-1 px-4 py-3 border ${
                    usernameStatus === 'available' ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : 
                    usernameStatus === 'taken' ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                    'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-r-xl sm:text-sm transition-all`}
                  placeholder="seu-nome"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {checkingUsername && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
                  {!checkingUsername && usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                  {!checkingUsername && usernameStatus === 'taken' && <X className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {usernameStatus === 'taken' && (
                <p className="mt-2 text-sm text-red-600">Este username já está em uso.</p>
              )}
              {usernameStatus === 'available' && (
                <p className="mt-2 text-sm text-green-600">Disponível! 🎉</p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio (Opcional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Conte um pouco sobre você..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Preview Section */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview do Perfil</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {username ? username[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">@{username || 'seu-user'}</h4>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{bio || 'Sua bio aparecerá aqui'}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || usernameStatus !== 'available'}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-100"
            >
              {loading ? 'Salvando...' : 'Finalizar Configuração'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
