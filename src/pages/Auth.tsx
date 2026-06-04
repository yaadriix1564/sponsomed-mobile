import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const FEATURES = [
  { emoji: '🏥', key: 'fr' },
  { emoji: '🎓', key: 'ro' },
  { emoji: '💳', key: 'it' },
];

const FEATURE_LABELS: Record<string, Record<string, string>> = {
  fr: { fr: 'Centres médicaux partenaires', ro: 'Centres médicaux partenaires', it: 'Centres médicaux partenaires', pt: 'Centros parceiros', ar: 'مراكز طبية شريكة', es: 'Centros médicos asociados', de: 'Partnerkliniken', en: 'Partner medical centers', },
  ro: { fr: 'Financements sécurisés', ro: 'Finanțări securizate', it: 'Finanziamenti sicuri', pt: 'Financiamentos seguros', ar: 'تمويلات آمنة', es: 'Financiaciones seguras', de: 'Sichere Finanzierungen', en: 'Secure fundings', },
  it: { fr: 'Paiements Stripe Escrow', ro: 'Plăți Stripe Escrow', it: 'Pagamenti Stripe Escrow', pt: 'Pagamentos Stripe Escrow', ar: 'مدفوعات Stripe Escrow', es: 'Pagos Stripe Escrow', de: 'Stripe Escrow-Zahlungen', en: 'Stripe Escrow payments', },
};

export default function Auth() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

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
        setSuccess(t('auth.verifyEmail'));
      }
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const isRTL = lang === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Language switcher top right */}
      <div className="absolute top-4 right-4 z-50" style={{ right: isRTL ? 'auto' : '1rem', left: isRTL ? '1rem' : 'auto' }}>
        <LanguageSwitcher />
      </div>

      {/* Hero section */}
      <div className="bg-gradient-to-br from-primary via-blue-700 to-accent px-6 pt-16 pb-16 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -left-8 bottom-0 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute right-8 bottom-4 w-16 h-16 bg-white/10 rounded-full" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="w-14 h-14 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-5 border border-white/20">
            <Stethoscope size={26} className="text-white" />
          </div>

          <h1 className="font-display font-extrabold text-3xl leading-tight mb-1">
            {mode === 'login' ? t('auth.welcomeBack') : t('auth.join')}
          </h1>
          <p className="text-white/70 text-sm mb-6">
            {mode === 'login' ? t('auth.subtitleLogin') : t('auth.subtitleSignup')}
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-2">
            {Object.entries(FEATURE_LABELS).map(([key, labels]) => (
              <div key={key} className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-300 shrink-0" />
                <span className="text-white/80 text-xs font-medium">{labels[lang] ?? labels['fr']}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form card — overlaps hero */}
      <div className="flex-1 -mt-6 bg-surface rounded-t-3xl px-5 pt-7 pb-10 space-y-4">

        {/* Mode toggle pills */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-2">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            {t('auth.signIn')}
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            {t('auth.signUp')}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl px-4 py-3 animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-2xl px-4 py-3 flex items-start gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
            {success}
          </div>
        )}

        {/* Email field */}
        <div className="relative">
          <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            className={`input ${isRTL ? 'pr-9' : 'pl-9'}`}
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Password field */}
        <div className="relative">
          <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            className={`input ${isRTL ? 'pr-9 pl-10' : 'pl-9 pr-10'}`}
            type={show ? 'text' : 'password'}
            placeholder={t('auth.password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'}`}
          >
            {show ? <EyeOff size={16} className="text-slate-400" /> : <Eye size={16} className="text-slate-400" />}
          </button>
        </div>

        {/* Forgot password */}
        {mode === 'login' && (
          <div className={`text-${isRTL ? 'left' : 'right'} -mt-1`}>
            <button className="text-xs text-primary font-medium">{t('auth.forgotPassword')}</button>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handle}
          disabled={loading || !email || !password}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-base py-4"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Tagline */}
        <p className="text-center text-xs text-slate-400 pt-1">{t('auth.tagline')}</p>
      </div>
    </div>
  );
}
