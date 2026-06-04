import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Upload, CheckCircle2, Clock, XCircle, ChevronLeft,
  FileText, Camera, Shield, GraduationCap, Building2,
  AlertCircle, ArrowRight, Eye
} from 'lucide-react';

type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

interface DocSlot {
  key: string;
  label: string;
  hint: string;
  icon: any;
  required: boolean;
}

const STUDENT_DOCS: DocSlot[] = [
  { key: 'id_front',       label: "Pièce d'identité (recto)",    hint: 'CNI, passeport ou titre de séjour — recto', icon: Camera,    required: true },
  { key: 'id_back',        label: "Pièce d'identité (verso)",    hint: 'CNI verso (pas obligatoire pour passeport)', icon: Camera,    required: false },
  { key: 'enrollment',     label: 'Certificat de scolarité',      hint: 'Document officiel de votre université',       icon: GraduationCap, required: true },
  { key: 'photo',          label: 'Photo de profil',              hint: 'Photo récente, fond neutre',                  icon: Camera,    required: true },
];

const CENTER_DOCS: DocSlot[] = [
  { key: 'kbis',           label: 'Extrait Kbis / RCS',           hint: 'Moins de 3 mois',                             icon: FileText,  required: true },
  { key: 'id_director',    label: "Pièce d'identité du dirigeant",hint: 'CNI ou passeport du représentant légal',      icon: Camera,    required: true },
  { key: 'insurance',      label: 'Attestation RC Professionnelle',hint: 'Assurance en cours de validité',              icon: Shield,    required: true },
  { key: 'accreditation',  label: 'Agrément / Autorisation ARS',  hint: 'Si applicable',                              icon: Building2, required: false },
  { key: 'rib',            label: 'RIB bancaire',                 hint: 'IBAN du centre pour les paiements',           icon: FileText,  required: true },
];

const STATUS_CONFIG: Record<KycStatus, { label: string; color: string; bg: string; icon: any }> = {
  not_started: { label: 'Non commencé',   color: '#64748b', bg: '#f1f5f9', icon: FileText },
  pending:     { label: 'En vérification', color: '#d97706', bg: '#fffbeb', icon: Clock },
  verified:    { label: 'Vérifié ✓',       color: '#059669', bg: '#f0fdf4', icon: CheckCircle2 },
  rejected:    { label: 'Rejeté',          color: '#dc2626', bg: '#fef2f2', icon: XCircle },
};

export default function KYC() {
  const { user, role, profile } = useAuth();
  const navigate = useNavigate();

  const docs = role === 'center' ? CENTER_DOCS : STUDENT_DOCS;
  const kycStatus: KycStatus = (profile?.kyc_status as KycStatus) ?? 'not_started';
  const rejectionReason: string = profile?.kyc_rejection_reason ?? '';

  const [files, setFiles]     = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFile = (key: string, f: File | null) => {
    if (!f) return;
    setFiles(prev => ({ ...prev, [key]: f }));
    const url = URL.createObjectURL(f);
    setPreviews(prev => ({ ...prev, [key]: url }));
  };

  const requiredFilled = docs.filter(d => d.required).every(d => !!files[d.key]);

  const handleSubmit = async () => {
    if (!user || !requiredFilled) return;
    setUploading(true); setError('');
    try {
      const uploaded: Record<string, string> = {};
      for (const [key, file] of Object.entries(files)) {
        if (!file) continue;
        const ext  = file.name.split('.').pop();
        const path = `kyc/${user.id}/${key}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('kyc-documents')
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('kyc-documents').getPublicUrl(path);
        uploaded[key] = urlData.publicUrl;
      }
      const { error: dbErr } = await supabase.from('profiles').update({
        kyc_status: 'pending',
        kyc_submitted_at: new Date().toISOString(),
        kyc_documents: uploaded,
      }).eq('id', user.id);
      if (dbErr) throw dbErr;
      setSubmitted(true);
    } catch (e: any) { setError(e.message); }
    setUploading(false);
  };

  if (!user) return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24 }}>
      <Shield size={40} color="#94a3b8" />
      <p style={{ fontWeight:700, fontSize:18, color:'#0f172a' }}>Connexion requise</p>
      <button onClick={() => navigate('/auth')} style={{ background:'#1d4ed8', color:'white', border:'none', borderRadius:14, padding:'12px 24px', fontSize:15, fontWeight:700, cursor:'pointer' }}>Se connecter</button>
    </div>
  );

  // ── Soumis avec succès ──
  if (submitted) return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:32, background:'#f8fafc' }}>
      <div style={{ width:80, height:80, borderRadius:24, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <CheckCircle2 size={40} color="#059669" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 8px' }}>Documents envoyés !</h2>
        <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6 }}>Notre équipe va vérifier vos documents sous <strong>24 à 48h</strong>. Vous serez notifié par email.</p>
      </div>
      <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:16, padding:'14px 20px', display:'flex', gap:12, alignItems:'flex-start', width:'100%', maxWidth:400, boxSizing:'border-box' }}>
        <Clock size={18} color="#d97706" style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ fontSize:13, color:'#92400e', margin:0 }}>Statut actuel : <strong>En cours de vérification</strong></p>
      </div>
      <button onClick={() => navigate('/profile')} style={{ background:'#1d4ed8', color:'white', border:'none', borderRadius:14, padding:'13px 32px', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
        Retour au profil <ArrowRight size={16} />
      </button>
    </div>
  );

  // ── Déjà vérifié ──
  if (kycStatus === 'verified') return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:32, background:'#f8fafc' }}>
      <div style={{ width:80, height:80, borderRadius:24, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <CheckCircle2 size={40} color="#059669" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#059669', margin:'0 0 8px' }}>Identité vérifiée ✓</h2>
        <p style={{ fontSize:14, color:'#64748b' }}>Votre compte est pleinement vérifié et actif.</p>
      </div>
      <button onClick={() => navigate('/profile')} style={{ background:'#059669', color:'white', border:'none', borderRadius:14, padding:'13px 32px', fontSize:15, fontWeight:700, cursor:'pointer' }}>Retour au profil</button>
    </div>
  );

  const statusCfg = STATUS_CONFIG[kycStatus];
  const StatusIcon = statusCfg.icon;

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:'#f8fafc' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)', padding:'env(safe-area-inset-top,0px) 0 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px 24px' }}>
          <button onClick={() => navigate('/profile')} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'8px 14px', cursor:'pointer', color:'white' }}>
            <ChevronLeft size={16} /> <span style={{ fontSize:14, fontWeight:600 }}>Profil</span>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:statusCfg.bg, borderRadius:12, padding:'6px 12px' }}>
            <StatusIcon size={13} color={statusCfg.color} />
            <span style={{ fontSize:12, fontWeight:700, color:statusCfg.color }}>{statusCfg.label}</span>
          </div>
        </div>
        <div style={{ padding:'0 20px 28px' }}>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 6px' }}>Vérification KYC</p>
          <h1 style={{ fontSize:22, fontWeight:800, color:'white', margin:'0 0 6px' }}>
            {role === 'center' ? '🏥 Centre Médical' : '🎓 Étudiant'}
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', margin:0 }}>Transmettez vos documents pour activer votre compte</p>
        </div>
      </div>

      {/* Rejection banner */}
      {kycStatus === 'rejected' && (
        <div style={{ margin:'16px 16px 0', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:16, padding:'14px 16px', display:'flex', gap:12 }}>
          <XCircle size={18} color="#dc2626" style={{ flexShrink:0, marginTop:2 }} />
          <div>
            <p style={{ fontWeight:700, fontSize:14, color:'#dc2626', margin:'0 0 4px' }}>Documents rejetés</p>
            <p style={{ fontSize:13, color:'#b91c1c', margin:0 }}>{rejectionReason || 'Veuillez soumettre à nouveau des documents valides.'}</p>
          </div>
        </div>
      )}

      {/* Info banner */}
      {kycStatus === 'pending' && (
        <div style={{ margin:'16px 16px 0', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:16, padding:'14px 16px', display:'flex', gap:12 }}>
          <Clock size={18} color="#d97706" style={{ flexShrink:0, marginTop:2 }} />
          <p style={{ fontSize:13, color:'#92400e', margin:0 }}>Vos documents sont en cours de vérification. Délai : <strong>24 à 48h ouvrées</strong>.</p>
        </div>
      )}

      {/* Steps */}
      <div style={{ padding:'20px 16px 8px' }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {['Informations', 'Documents', 'Validation'].map((s, i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', flex: i < 2 ? 1 : 'none', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background: i < 2 ? '#1d4ed8' : '#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {i < 2 ? <CheckCircle2 size={12} color="white" /> : <span style={{ fontSize:10, fontWeight:700, color:'#64748b' }}>3</span>}
                </div>
                <span style={{ fontSize:11, fontWeight:600, color: i < 2 ? '#1d4ed8' : '#94a3b8' }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex:1, height:2, background:'#e2e8f0', borderRadius:1 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Document slots */}
      <div style={{ flex:1, padding:'12px 16px 32px', display:'flex', flexDirection:'column', gap:12 }}>
        {docs.map(({ key, label, hint, icon: Icon, required }) => {
          const file    = files[key];
          const preview = previews[key];
          const isImg   = file?.type.startsWith('image/');
          return (
            <div key={key} style={{ background:'white', borderRadius:20, border:`1.5px solid ${file ? '#1d4ed8' : '#e2e8f0'}`, overflow:'hidden', transition:'border 0.15s' }}>
              <div style={{ padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background: file ? '#eff6ff' : '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={18} color={file ? '#1d4ed8' : '#94a3b8'} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', margin:0 }}>{label}</p>
                    {required && <span style={{ fontSize:10, fontWeight:700, color:'#dc2626', background:'#fef2f2', borderRadius:6, padding:'1px 5px' }}>REQUIS</span>}
                  </div>
                  <p style={{ fontSize:12, color:'#94a3b8', margin:'2px 0 0' }}>{hint}</p>
                  {file && <p style={{ fontSize:11, color:'#059669', margin:'4px 0 0', fontWeight:600 }}>✓ {file.name}</p>}
                </div>
                {file && preview && isImg && (
                  <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', flexShrink:0 }}>
                    <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                )}
                {file && !isImg && (
                  <div style={{ width:44, height:44, borderRadius:10, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Eye size={18} color="#1d4ed8" />
                  </div>
                )}
              </div>

              {/* Upload zone */}
              {kycStatus !== 'pending' && (
                <label style={{ display:'block', margin:'0 14px 14px', cursor:'pointer' }}>
                  <div style={{ border:`1.5px dashed ${file ? '#93c5fd' : '#e2e8f0'}`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background: file ? '#f0f9ff' : '#fafafa' }}>
                    <Upload size={14} color={file ? '#1d4ed8' : '#94a3b8'} />
                    <span style={{ fontSize:13, fontWeight:600, color: file ? '#1d4ed8' : '#64748b' }}>
                      {file ? 'Changer le fichier' : 'Choisir un fichier'}
                    </span>
                  </div>
                  <input type="file" accept="image/*,application/pdf" style={{ display:'none' }}
                    onChange={e => handleFile(key, e.target.files?.[0] ?? null)} />
                </label>
              )}
            </div>
          );
        })}

        {/* Conformité */}
        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:16, padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
          <AlertCircle size={16} color="#64748b" style={{ flexShrink:0, marginTop:2 }} />
          <p style={{ fontSize:12, color:'#64748b', margin:0, lineHeight:1.5 }}>
            Vos documents sont chiffrés et stockés conformément au <strong>RGPD</strong>. Ils ne seront utilisés qu'à des fins de vérification d'identité.
          </p>
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:14, padding:'12px 16px', fontSize:13, color:'#dc2626', display:'flex', gap:8 }}>
            <AlertCircle size={15} style={{ flexShrink:0 }} /> {error}
          </div>
        )}

        {kycStatus !== 'pending' && (
          <button onClick={handleSubmit} disabled={uploading || !requiredFilled}
            style={{ width:'100%', padding:16, borderRadius:18, border:'none', cursor: requiredFilled ? 'pointer' : 'default',
              background: uploading || !requiredFilled ? '#e2e8f0' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
              color: requiredFilled ? 'white' : '#94a3b8',
              fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow: requiredFilled ? '0 4px 20px rgba(29,78,216,0.3)' : 'none',
              marginTop:8 }}>
            {uploading
              ? <><span style={{ width:20, height:20, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} /> Envoi en cours...</>
              : <>Soumettre pour vérification <ArrowRight size={18} /></>}
          </button>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
