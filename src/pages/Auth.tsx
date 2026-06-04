import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Stethoscope, ArrowRight, CheckCircle2, Shield, GraduationCap, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handle = async () => {
    if (!email || !password) return;
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

  const features = [
    { icon: Shield,        label: {
        fr:'Centres médicaux partenaires', en:'Partner medical centers',
        ro:'Centre medicale partenere', it:'Centri medici partner',
        pt:'Centros médicos parceiros', ar:'مراكز طبية شريكة',
        es:'Centros médicos asociados', de:'Partnerkliniken',
    }},
    { icon: GraduationCap, label: {
        fr:'Financements sécurisés', en:'Secure funding',
        ro:'Finanțări securizate', it:'Finanziamenti sicuri',
        pt:'Financiamentos seguros', ar:'تمويلات آمنة',
        es:'Financiaciones seguras', de:'Sichere Finanzierungen',
    }},
    { icon: CreditCard,    label: {
        fr:'Paiements Stripe Escrow', en:'Stripe Escrow payments',
        ro:'Plăți Stripe Escrow', it:'Pagamenti Stripe Escrow',
        pt:'Pagamentos Stripe Escrow', ar:'مدفوعات Stripe آمنة',
        es:'Pagos Stripe Escrow', de:'Stripe Escrow-Zahlungen',
    }},
  ];

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
               background: '#f8fafc', overflowX: 'hidden' }}
    >
      {/* ── TOP BAR ─────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'env(safe-area-inset-top, 0px) 16px 0',
        height: 'calc(52px + env(safe-area-inset-top, 0px))',
        background: 'transparent',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:32, height:32, borderRadius:10, background:'#1e40af',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Stethoscope size={16} color="white" />
          </div>
          <span style={{ fontWeight:800, fontSize:16, color:'#0f172a', letterSpacing:'-0.3px' }}>SponsoMed</span>
        </div>
        <div dir="ltr"><LanguageSwitcher compact /></div>
      </div>

      {/* ── HERO ────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0ea5e9 100%)',
        paddingTop: 'calc(52px + env(safe-area-inset-top, 0px) + 24px)',
        paddingBottom: '40px',
        paddingLeft: '24px', paddingRight: '24px',
        color: 'white',
        position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Deco blobs */}
        <div style={{ position:'absolute', right:'-48px', top:'-48px', width:'180px', height:'180px',
                      borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', left:'-32px', bottom:'-32px', width:'120px', height:'120px',
                      borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />

        <h1 style={{ fontSize:'26px', fontWeight:800, lineHeight:1.2, margin:'0 0 6px',
                     letterSpacing:'-0.5px' }}>
          {mode === 'login' ? t('auth.welcomeBack') : t('auth.join')}
        </h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', margin:'0 0 20px' }}>
          {t('auth.tagline')}
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {features.map(({ icon: Icon, label }) => (
            <div key={Object.values(label)[0]} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.15)',
                            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={14} color="white" />
              </div>
              <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.85)', fontWeight:500 }}>
                {(label as any)[lang] ?? (label as any)['fr']}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM CARD ───────────────────────────── */}
      <div style={{
        flex: 1,
        background: 'white',
        borderRadius: '24px 24px 0 0',
        marginTop: '-16px',
        padding: '28px 20px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>

        {/* Toggle Se connecter / S'inscrire */}
        <div style={{ display:'flex', background:'#f1f5f9', borderRadius:'16px', padding:'4px', gap:'4px' }}>
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '11px 8px',
                borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700,
                transition: 'all 0.18s',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#1d4ed8' : '#64748b',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {m === 'login' ? t('auth.signIn') : t('auth.signUp')}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'14px',
                        padding:'12px 16px', fontSize:'13px', color:'#dc2626' }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'14px',
                        padding:'12px 16px', fontSize:'13px', color:'#16a34a',
                        display:'flex', alignItems:'flex-start', gap:'8px' }}>
            <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink:0, marginTop:1 }} />
            {success}
          </div>
        )}

        {/* Email */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left: lang==='ar'?'auto':'14px', right: lang==='ar'?'14px':'auto',
                        top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
            <Mail size={16} color="#94a3b8" />
          </div>
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            dir="ltr"
            style={{
              width: '100%', boxSizing:'border-box',
              padding: lang==='ar' ? '14px 44px 14px 14px' : '14px 14px 14px 44px',
              borderRadius:'14px', border:'1.5px solid #e2e8f0',
              fontSize:'15px', color:'#0f172a', background:'#f8fafc',
              outline:'none', transition:'border 0.15s',
            }}
            onFocus={e => e.target.style.borderColor='#1d4ed8'}
            onBlur={e  => e.target.style.borderColor='#e2e8f0'}
          />
        </div>

        {/* Password */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left: lang==='ar'?'auto':'14px', right: lang==='ar'?'14px':'auto',
                        top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
            <Lock size={16} color="#94a3b8" />
          </div>
          <input
            type={show ? 'text' : 'password'}
            placeholder={t('auth.password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode==='login' ? 'current-password' : 'new-password'}
            style={{
              width: '100%', boxSizing:'border-box',
              padding: lang==='ar' ? '14px 44px 14px 44px' : '14px 44px 14px 44px',
              borderRadius:'14px', border:'1.5px solid #e2e8f0',
              fontSize:'15px', color:'#0f172a', background:'#f8fafc',
              outline:'none', transition:'border 0.15s',
            }}
            onFocus={e => e.target.style.borderColor='#1d4ed8'}
            onBlur={e  => e.target.style.borderColor='#e2e8f0'}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position:'absolute', right: lang==='ar'?'auto':'14px', left: lang==='ar'?'14px':'auto',
                     top:'50%', transform:'translateY(-50%)',
                     background:'none', border:'none', cursor:'pointer', padding:0 }}
          >
            {show ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
          </button>
        </div>

        {/* Forgot */}
        {mode === 'login' && (
          <div style={{ textAlign: lang==='ar' ? 'left' : 'right', marginTop:'-8px' }}>
            <button style={{ background:'none', border:'none', cursor:'pointer',
                             fontSize:'13px', color:'#1d4ed8', fontWeight:600 }}>
              {t('auth.forgotPassword')}
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handle}
          disabled={loading || !email || !password}
          style={{
            width:'100%', padding:'15px',
            background: loading || !email || !password
              ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
            color:'white', border:'none', borderRadius:'16px', cursor:'pointer',
            fontSize:'16px', fontWeight:700, letterSpacing:'-0.2px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            transition:'opacity 0.2s', boxShadow: '0 4px 16px rgba(29,78,216,0.3)',
          }}
        >
          {loading
            ? <span style={{ width:20, height:20, border:'2px solid white',
                             borderTopColor:'transparent', borderRadius:'50%',
                             display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            : <>{mode==='login' ? t('auth.signIn') : t('auth.signUp')} <ArrowRight size={18} /></>}
        </button>

        {/* Footer */}
        <p style={{ textAlign:'center', fontSize:'12px', color:'#94a3b8', margin:0 }}>
          {t('auth.tagline')}
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
