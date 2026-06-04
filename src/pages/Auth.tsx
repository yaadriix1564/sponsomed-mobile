import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, Stethoscope, ArrowRight,
  CheckCircle2, Shield, GraduationCap, CreditCard, Globe,
  ChevronLeft, User, Building2, MapPin, Phone, Globe2, FileText
} from 'lucide-react';
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

type Step = 'auth' | 'role' | 'profile_student' | 'profile_center';

const baseInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '13px 14px',
  borderRadius: 14, fontSize: 15, color: '#0f172a',
  background: '#f8fafc', outline: 'none',
  border: '1.5px solid #e2e8f0', fontFamily: 'inherit',
};

function Field({ icon: Icon, placeholder, value, onChange, type = 'text' }: {
  icon?: any; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {Icon && (
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
          <Icon size={16} color="#94a3b8" />
        </div>
      )}
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange} dir={type === 'email' || type === 'password' || type === 'tel' ? 'ltr' : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...baseInput, paddingLeft: Icon ? 44 : 14, border: `1.5px solid ${focused ? '#1d4ed8' : '#e2e8f0'}` }}
      />
    </div>
  );
}

function PasswordField({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <Lock size={16} color="#94a3b8" />
      </div>
      <input
        type={show ? 'text' : 'password'} placeholder={placeholder} value={value}
        onChange={onChange} dir="ltr"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...baseInput, paddingLeft: 44, paddingRight: 44, border: `1.5px solid ${focused ? '#1d4ed8' : '#e2e8f0'}` }}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        {show ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
      </button>
    </div>
  );
}

function TextArea({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea placeholder={placeholder} value={value} onChange={onChange} rows={4}
      style={{ ...baseInput, resize: 'none', border: `1.5px solid ${focused ? '#1d4ed8' : '#e2e8f0'}` }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [step, setStep] = useState<Step>('auth');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'center' | ''>('');

  const [sFirstName, setSFirstName] = useState('');
  const [sLastName, setSLastName] = useState('');
  const [sUniversity, setSUniversity] = useState('');
  const [sSpecialty, setSSpecialty] = useState('');
  const [sCountry, setSCountry] = useState('');
  const [sPhone, setSPhone] = useState('');

  const [cName, setCName] = useState('');
  const [cLegal, setCLegal] = useState('');
  const [cSiret, setCSiret] = useState('');
  const [cVat, setCVat] = useState('');
  const [cCountry, setCCountry] = useState('');
  const [cRegion, setCRegion] = useState('');
  const [cCity, setCCity] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cZip, setCZip] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cWebsite, setCWebsite] = useState('');
  const [cDesc, setCDesc] = useState('');

  const currentLang = LANGS.find(l => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const handleAuth = async () => {
    if (!email || !password) return;
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        navigate('/');
      } else {
        const { data, error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setUserId(data.user?.id ?? '');
        setStep('role');
      }
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const handleRole = () => {
    if (!selectedRole) return;
    setStep(selectedRole === 'student' ? 'profile_student' : 'profile_center');
  };

  const handleStudentProfile = async () => {
    setLoading(true); setError('');
    try {
      const { error: e } = await supabase.from('profiles').upsert({
        id: userId, role: 'student',
        full_name: `${sFirstName} ${sLastName}`.trim(),
        first_name: sFirstName, last_name: sLastName,
        university: sUniversity, specialty: sSpecialty,
        country: sCountry, phone: sPhone, email,
      });
      if (e) throw e;
      navigate('/');
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const handleCenterProfile = async () => {
    setLoading(true); setError('');
    try {
      const { error: e } = await supabase.from('profiles').upsert({
        id: userId, role: 'center',
        clinic_name: cName, full_name: cName,
        legal_form: cLegal, siret: cSiret, vat_number: cVat,
        country: cCountry, region: cRegion, city: cCity,
        address: cAddress, zip_code: cZip,
        phone: cPhone, website: cWebsite,
        description: cDesc, email,
      });
      if (e) throw e;
      navigate('/');
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const features = [
    { icon: Shield, label: { fr: 'Centres médicaux partenaires', en: 'Partner medical centers', ro: 'Centre medicale partenere', it: 'Centri medici partner', pt: 'Centros médicos parceiros', ar: 'مراكز طبية شريكة', es: 'Centros médicos asociados', de: 'Partnerkliniken' } },
    { icon: GraduationCap, label: { fr: 'Financements sécurisés', en: 'Secure funding', ro: 'Finanțări securizate', it: 'Finanziamenti sicuri', pt: 'Financiamentos seguros', ar: 'تمويلات آمنة', es: 'Financiaciones seguras', de: 'Sichere Finanzierungen' } },
    { icon: CreditCard, label: { fr: 'Paiements Stripe Escrow', en: 'Stripe Escrow payments', ro: 'Plăți Stripe Escrow', it: 'Pagamenti Stripe Escrow', pt: 'Pagamentos Stripe Escrow', ar: 'مدفوعات Stripe آمنة', es: 'Pagos Stripe Escrow', de: 'Stripe Escrow-Zahlungen' } },
  ];

  const heroGrad = 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #0ea5e9 100%)';
  const heroPadTop = 'calc(56px + env(safe-area-inset-top,0px) + 20px)';

  const langModal = langOpen ? createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setLangOpen(false)}>
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, paddingBottom: 'env(safe-area-inset-bottom,16px)', animation: 'slideUp 0.22s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0' }} /></div>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', margin: '8px 20px 8px' }}>Langue / Language</p>
        <div style={{ padding: '4px 12px 12px' }}>
          {LANGS.map(({ code, flag, label }) => (
            <button key={code} onClick={() => changeLang(code)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '11px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', background: lang === code ? '#eff6ff' : 'transparent' }}>
              <span style={{ fontSize: 24, minWidth: 32, textAlign: 'center' }}>{flag}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: lang === code ? 700 : 500, color: lang === code ? '#1d4ed8' : '#334155' }}>{label}</span>
              {lang === code && <CheckCircle2 size={18} color="#1d4ed8" />}
            </button>
          ))}
        </div>
      </div>
    </div>, document.body
  ) : null;

  const TopBar = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `env(safe-area-inset-top,0px) 16px 0`, height: 'calc(56px + env(safe-area-inset-top,0px))' }}>
      <button onClick={() => step === 'auth' ? navigate('/') : setStep(step === 'role' ? 'auth' : 'role')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '7px 12px 7px 8px', cursor: 'pointer' }}>
        {step !== 'auth'
          ? <ChevronLeft size={16} color="white" />
          : <div style={{ width: 28, height: 28, borderRadius: 8, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Stethoscope size={15} color="#1d4ed8" /></div>}
        <span style={{ fontWeight: 800, fontSize: 15, color: 'white' }}>{step !== 'auth' ? 'Retour' : 'SponsoMed'}</span>
      </button>
      <button onClick={() => setLangOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '7px 12px', cursor: 'pointer' }}>
        <Globe size={15} color="white" />
        <span style={{ fontSize: 20, lineHeight: 1 }}>{currentLang.flag}</span>
      </button>
    </div>
  );

  const ErrBox = () => error ? (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '12px 16px', fontSize: 13, color: '#dc2626' }}>{error}</div>
  ) : null;

  const Btn = ({ onClick, disabled, children, green = false }: any) => (
    <button onClick={onClick} disabled={disabled}
      style={{ width: '100%', padding: 15, border: 'none', borderRadius: 16, cursor: disabled ? 'default' : 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, transition: 'opacity 0.15s',
        background: disabled ? '#e2e8f0' : green ? 'linear-gradient(135deg,#059669,#0ea5e9)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
        color: disabled ? '#94a3b8' : 'white',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(29,78,216,0.25)' }}>
      {children}
    </button>
  );

  const Spinner = () => <span style={{ width: 20, height: 20, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;

  // ── STEP 1: AUTH ──
  if (step === 'auth') return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <TopBar />
      <div style={{ background: heroGrad, paddingTop: heroPadTop, paddingBottom: 44, padding: `${heroPadTop} 24px 44px`, color: 'white', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', right: -48, top: -48, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: '0 0 6px' }}>{mode === 'login' ? t('auth.welcomeBack') : t('auth.join')}</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>{t('auth.tagline')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map(({ icon: Icon, label }) => (
            <div key={(label as any).fr} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={14} color="white" /></div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{(label as any)[lang] ?? (label as any).fr}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, background: 'white', borderRadius: '24px 24px 0 0', marginTop: -16, padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 16, padding: 4, gap: 4 }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, padding: '11px 8px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.18s', background: mode === m ? 'white' : 'transparent', color: mode === m ? '#1d4ed8' : '#64748b', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {m === 'login' ? t('auth.signIn') : t('auth.signUp')}
            </button>
          ))}
        </div>

        <ErrBox />

        {/* Email — UN SEUL champ */}
        <Field icon={Mail} placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} type="email" />

        {/* Password */}
        <PasswordField placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} />

        {mode === 'login' && (
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>{t('auth.forgotPassword')}</button>
          </div>
        )}

        <Btn onClick={handleAuth} disabled={loading || !email || !password}>
          {loading ? <Spinner /> : <>{mode === 'login' ? t('auth.signIn') : t('auth.signUp')} <ArrowRight size={18} /></>}
        </Btn>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: 0 }}>{t('auth.terms', 'En continuant vous acceptez nos CGU')}</p>
      </div>
      {langModal}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );

  // ── STEP 2: ROLE ──
  if (step === 'role') return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <TopBar />
      <div style={{ background: heroGrad, paddingTop: heroPadTop, paddingBottom: 36, padding: `${heroPadTop} 24px 36px`, color: 'white', flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Inscription — Étape 1/2</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>Qui êtes-vous ?</h1>
      </div>
      <div style={{ flex: 1, background: 'white', borderRadius: '24px 24px 0 0', marginTop: -16, padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[{ role: 'student' as const, emoji: '🎓', title: 'Compte Étudiant', desc: 'Je suis étudiant en médecine', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
          { role: 'center' as const, emoji: '🏥', title: 'Centre Médical', desc: 'Je souhaite parrainer des étudiants', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
        ].map(({ role, emoji, title, desc, color, bg, border }) => (
          <button key={role} onClick={() => setSelectedRole(role)}
            style={{ width: '100%', padding: 20, borderRadius: 20, border: `2px solid ${selectedRole === role ? color : border}`, background: selectedRole === role ? bg : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 36 }}>{emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', margin: '0 0 4px' }}>{title}</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{desc}</p>
              </div>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${selectedRole === role ? color : '#cbd5e1'}`, background: selectedRole === role ? color : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selectedRole === role && <CheckCircle2 size={14} color="white" />}
              </div>
            </div>
          </button>
        ))}
        <ErrBox />
        <Btn onClick={handleRole} disabled={!selectedRole}>Continuer <ArrowRight size={18} /></Btn>
      </div>
      {langModal}
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );

  // ── STEP 3a: ÉTUDIANT ──
  if (step === 'profile_student') return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <TopBar />
      <div style={{ background: heroGrad, paddingTop: heroPadTop, paddingBottom: 36, padding: `${heroPadTop} 24px 36px`, color: 'white', flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Inscription — Étape 2/2</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>🎓 Profil Étudiant</h1>
      </div>
      <div style={{ flex: 1, background: 'white', borderRadius: '24px 24px 0 0', marginTop: -16, padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field icon={User} placeholder="Prénom *" value={sFirstName} onChange={e => setSFirstName(e.target.value)} />
          <Field icon={User} placeholder="Nom *" value={sLastName} onChange={e => setSLastName(e.target.value)} />
        </div>
        <Field icon={GraduationCap} placeholder="Université *" value={sUniversity} onChange={e => setSUniversity(e.target.value)} />
        <Field icon={Stethoscope} placeholder="Spécialité" value={sSpecialty} onChange={e => setSSpecialty(e.target.value)} />
        <Field icon={MapPin} placeholder="Pays" value={sCountry} onChange={e => setSCountry(e.target.value)} />
        <Field icon={Phone} placeholder="Téléphone" value={sPhone} onChange={e => setSPhone(e.target.value)} type="tel" />
        <ErrBox />
        <Btn onClick={handleStudentProfile} disabled={loading || !sFirstName || !sLastName || !sUniversity}>
          {loading ? <Spinner /> : <>Créer mon compte <ArrowRight size={18} /></>}
        </Btn>
      </div>
      {langModal}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );

  // ── STEP 3b: CENTRE ──
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <TopBar />
      <div style={{ background: heroGrad, paddingTop: heroPadTop, paddingBottom: 36, padding: `${heroPadTop} 24px 36px`, color: 'white', flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Inscription — Étape 2/2</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>🏥 Centre Médical</h1>
      </div>
      <div style={{ flex: 1, background: 'white', borderRadius: '24px 24px 0 0', marginTop: -16, padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        <Label>🏥 Informations générales</Label>
        <Field icon={Building2} placeholder="Nom du centre *" value={cName} onChange={e => setCName(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field icon={FileText} placeholder="Forme juridique" value={cLegal} onChange={e => setCLegal(e.target.value)} />
          <Field icon={FileText} placeholder="SIRET" value={cSiret} onChange={e => setCSiret(e.target.value)} />
        </div>
        <Field icon={FileText} placeholder="N° TVA" value={cVat} onChange={e => setCVat(e.target.value)} />
        <Label>📍 Localisation</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field icon={MapPin} placeholder="Pays *" value={cCountry} onChange={e => setCCountry(e.target.value)} />
          <Field icon={MapPin} placeholder="Région" value={cRegion} onChange={e => setCRegion(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <Field icon={MapPin} placeholder="Ville *" value={cCity} onChange={e => setCCity(e.target.value)} />
          <Field icon={MapPin} placeholder="Code postal" value={cZip} onChange={e => setCZip(e.target.value)} />
        </div>
        <Field icon={MapPin} placeholder="Adresse" value={cAddress} onChange={e => setCAddress(e.target.value)} />
        <Label>📞 Contact</Label>
        <Field icon={Phone} placeholder="Téléphone" value={cPhone} onChange={e => setCPhone(e.target.value)} type="tel" />
        <Field icon={Globe2} placeholder="Site web" value={cWebsite} onChange={e => setCWebsite(e.target.value)} type="url" />
        <Label>📝 Description</Label>
        <TextArea placeholder="Décrivez votre centre médical..." value={cDesc} onChange={e => setCDesc(e.target.value)} />
        <ErrBox />
        <Btn onClick={handleCenterProfile} disabled={loading || !cName || !cCountry || !cCity} green>
          {loading ? <Spinner /> : <>Créer mon compte 🏥 <ArrowRight size={18} /></>}
        </Btn>
      </div>
      {langModal}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '4px 0 0' }}>{children}</p>;
}
