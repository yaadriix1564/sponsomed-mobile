import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Stethoscope, ArrowRight, CheckCircle2, Shield, GraduationCap, CreditCard, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

const LANGS = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'ro', flag: '🇷🇴', label: 'Română' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
];

export default function Auth() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGS.find(l => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    setLangOpen(false);
  };

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
    { icon: Shield, label: { fr:'Centres médicaux partenaires', en:'Partner medical centers', ro:'Centre medicale partenere', it:'Centri medici partner', pt:'Centros médicos parceiros', ar:'مراكز طبية شريكة', es:'Centros médicos asociados', de:'Partnerkliniken' }},
    { icon: GraduationCap, label: { fr:'Financements sécurisés', en:'Secure funding', ro:'Finanțări securizate', it:'Finanziamenti sicuri', pt:'Financiamentos seguros', ar:'تمويلات آمنة', es:'Financiaciones seguras', de:'Sichere Finanzierungen' }},
    { icon: CreditCard, label: { fr:'Paiements Stripe Escrow', en:'Stripe Escrow payments', ro:'Plăți Stripe Escrow', it:'Pagamenti Stripe Escrow', pt:'Pagamentos Stripe Escrow', ar:'مدفوعات Stripe آمنة', es:'Pagos Stripe Escrow', de:'Stripe Escrow-Zahlungen' }},
  ];

  /* ── Lang bottom-sheet portal ─────────────────── */
  const langModal = langOpen ? createPortal(
    <div dir="ltr" style={{ position:'fixed', inset:0, zIndex:9999,
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }}
      onClick={() => setLangOpen(false)}>
      <div dir="ltr" style={{ background:'white', borderRadius:'24px 24px 0 0',
        width:'100%', maxWidth:'480px', paddingBottom:'env(safe-area-inset-bottom,16px)',
        animation:'slideUp 0.22s ease' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4 }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'#e2e8f0' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px 8px' }}>
          <p style={{ fontWeight:700, fontSize:16, color:'#0f172a', margin:0 }}>{t('profile.language')}</p>
        </div>
        <div style={{ padding:'4px 12px 12px' }}>
          {LANGS.map(({ code, flag, label }) => {
            const active = lang === code;
            return (
              <button key={code} onClick={() => changeLang(code)} style={{
                width:'100%', display:'flex', alignItems:'center', gap:14,
                padding:'11px 12px', borderRadius:16, border:'none', cursor:'pointer',
                background: active ? '#eff6ff' : 'transparent', textAlign:'left',
              }}>
                <span style={{ fontSize:24, minWidth:32, textAlign:'center' }}>{flag}</span>
                <span style={{ flex:1, fontSize:15, fontWeight: active?700:500,
                  color: active?'#1d4ed8':'#334155' }}>{label}</span>
                {active && (
                  <span style={{ width:22, height:22, borderRadius:'50%', background:'#1d4ed8',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <CheckCircle2 size={12} color="white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ minHeight:'100dvh', display:'flex', flexDirection:'column',
               background:'#f8fafc', overflowX:'hidden' }}>

      {/* ── TOP BAR ─────────────────────────────── */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:`env(safe-area-inset-top,0px) 16px 0`,
        height:'calc(56px + env(safe-area-inset-top,0px))',
      }}>
        {/* ⭐ Logo = bouton retour accueil */}
        <button
          onClick={() => navigate('/')}
          style={{ display:'flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.25)',
            borderRadius:14, padding:'7px 12px 7px 8px',
            cursor:'pointer', transition:'transform 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform='scale(0.95)')}
          onMouseUp={e   => (e.currentTarget.style.transform='scale(1)')}
        >
          <div style={{ width:28, height:28, borderRadius:8, background:'white',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Stethoscope size={15} color="#1d4ed8" />
          </div>
          <span style={{ fontWeight:800, fontSize:15, color:'white', letterSpacing:'-0.3px' }}>SponsoMed</span>
        </button>

        {/* 🌍 Bouton langue visible — pill avec drapeau + code */}
        <button
          dir="ltr"
          onClick={() => setLangOpen(true)}
          style={{
            display:'flex', alignItems:'center', gap:7,
            background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.3)',
            borderRadius:14, padding:'7px 12px',
            cursor:'pointer', transition:'transform 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform='scale(0.95)')}
          onMouseUp={e   => (e.currentTarget.style.transform='scale(1)')}
        >
          <Globe size={15} color="white" />
          <span style={{ fontSize:13, fontWeight:700, color:'white', letterSpacing:'0.5px' }}>
            {currentLang.flag} {lang.toUpperCase()}
          </span>
        </button>
      </div>

      {/* ── HERO ──────────────────────────────── */}
      <div style={{
        background:'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #0ea5e9 100%)',
        paddingTop:'calc(56px + env(safe-area-inset-top,0px) + 20px)',
        paddingBottom:'44px', paddingLeft:'24px', paddingRight:'24px',
        color:'white', position:'relative', overflow:'hidden', flexShrink:0,
      }}>
        <div style={{ position:'absolute', right:'-48px', top:'-48px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', left:'-32px', bottom:'-32px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />

        <h1 style={{ fontSize:'26px', fontWeight:800, lineHeight:1.2, margin:'0 0 6px', letterSpacing:'-0.5px' }}>
          {mode === 'login' ? t('auth.welcomeBack') : t('auth.join')}
        </h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', margin:'0 0 20px' }}>
          {t('auth.tagline')}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {features.map(({ icon: Icon, label }) => (
            <div key={Object.values(label)[0]} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={14} color="white" />
              </div>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.85)', fontWeight:500 }}>
                {(label as any)[lang] ?? (label as any)['fr']}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM CARD ──────────────────────────── */}
      <div style={{ flex:1, background:'white', borderRadius:'24px 24px 0 0',
        marginTop:'-16px', padding:'28px 20px 40px',
        display:'flex', flexDirection:'column', gap:16 }}>

        {/* Tabs */}
        <div style={{ display:'flex', background:'#f1f5f9', borderRadius:16, padding:4, gap:4 }}>
          {(['login','signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{ flex:1, padding:'11px 8px', borderRadius:12, border:'none', cursor:'pointer',
                fontSize:14, fontWeight:700, transition:'all 0.18s',
                background: mode===m ? 'white' : 'transparent',
                color: mode===m ? '#1d4ed8' : '#64748b',
                boxShadow: mode===m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {m === 'login' ? t('auth.signIn') : t('auth.signUp')}
            </button>
          ))}
        </div>

        {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:14, padding:'12px 16px', fontSize:13, color:'#dc2626' }}>{error}</div>}
        {success && (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14,
            padding:'12px 16px', fontSize:13, color:'#16a34a', display:'flex', alignItems:'flex-start', gap:8 }}>
            <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink:0, marginTop:1 }} />
            {success}
          </div>
        )}

        {/* Email */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:lang==='ar'?'auto':'14px', right:lang==='ar'?'14px':'auto',
            top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
            <Mail size={16} color="#94a3b8" />
          </div>
          <input type="email" placeholder={t('auth.email')} value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="email" dir="ltr"
            style={{ width:'100%', boxSizing:'border-box',
              padding: lang==='ar' ? '14px 44px 14px 14px' : '14px 14px 14px 44px',
              borderRadius:14, border:'1.5px solid #e2e8f0',
              fontSize:15, color:'#0f172a', background:'#f8fafc', outline:'none' }}
            onFocus={e => e.target.style.borderColor='#1d4ed8'}
            onBlur={e  => e.target.style.borderColor='#e2e8f0'} />
        </div>

        {/* Password */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:lang==='ar'?'auto':'14px', right:lang==='ar'?'14px':'auto',
            top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
            <Lock size={16} color="#94a3b8" />
          </div>
          <input type={show?'text':'password'} placeholder={t('auth.password')} value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode==='login'?'current-password':'new-password'}
            style={{ width:'100%', boxSizing:'border-box', padding:'14px 44px',
              borderRadius:14, border:'1.5px solid #e2e8f0',
              fontSize:15, color:'#0f172a', background:'#f8fafc', outline:'none' }}
            onFocus={e => e.target.style.borderColor='#1d4ed8'}
            onBlur={e  => e.target.style.borderColor='#e2e8f0'} />
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position:'absolute', right:lang==='ar'?'auto':'14px', left:lang==='ar'?'14px':'auto',
              top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            {show ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
          </button>
        </div>

        {mode === 'login' && (
          <div style={{ textAlign: lang==='ar'?'left':'right', marginTop:-8 }}>
            <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#1d4ed8', fontWeight:600 }}>
              {t('auth.forgotPassword')}
            </button>
          </div>
        )}

        {/* Submit */}
        <button onClick={handle} disabled={loading || !email || !password}
          style={{ width:'100%', padding:15,
            background: loading||!email||!password ? '#93c5fd' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
            color:'white', border:'none', borderRadius:16, cursor:'pointer',
            fontSize:16, fontWeight:700, display:'flex', alignItems:'center',
            justifyContent:'center', gap:8,
            boxShadow:'0 4px 16px rgba(29,78,216,0.3)' }}>
          {loading
            ? <span style={{ width:20, height:20, border:'2px solid white', borderTopColor:'transparent',
                borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            : <>{mode==='login' ? t('auth.signIn') : t('auth.signUp')} <ArrowRight size={18} /></>}
        </button>

        <p style={{ textAlign:'center', fontSize:12, color:'#94a3b8', margin:0 }}>{t('auth.tagline')}</p>
      </div>

      {langModal}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
