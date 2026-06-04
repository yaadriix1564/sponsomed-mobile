import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Stethoscope } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handle = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      if (mode === 'login') {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        navigate('/');
      } else {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setSuccess('Vérifiez votre email pour confirmer votre inscription.');
      }
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Top brand */}
      <div className="bg-gradient-to-br from-primary to-accent px-6 pt-10 pb-12 text-white">
        <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center mb-4">
          <Stethoscope size={28} className="text-white" />
        </div>
        <h1 className="font-display font-extrabold text-2xl">{mode === 'login' ? 'Bon retour !' : 'Rejoindre SponsoMed'}</h1>
        <p className="text-white/70 text-sm mt-1">{mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuitement'}</p>
      </div>

      {/* Form card — overlaps hero */}
      <div className="flex-1 -mt-6 bg-surface rounded-t-3xl px-5 pt-6 pb-8 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-2xl px-4 py-3">{success}</div>}

        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 pr-10" type={show ? 'text' : 'password'} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {show ? <EyeOff size={16} className="text-slate-400" /> : <Eye size={16} className="text-slate-400" />}
          </button>
        </div>

        <button onClick={handle} disabled={loading || !email || !password} className="btn-primary w-full text-center disabled:opacity-50">
          {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>

        <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')} className="w-full text-center text-sm text-slate-500">
          {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          <span className="text-primary font-semibold">{mode === 'login' ? "S'inscrire" : 'Se connecter'}</span>
        </button>
      </div>
    </div>
  );
}
