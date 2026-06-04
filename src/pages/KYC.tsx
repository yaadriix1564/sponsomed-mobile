import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Shield, Upload, CheckCircle, XCircle, Clock, FileText,
  Building2, GraduationCap, AlertTriangle, ScanSearch,
  ChevronLeft, ArrowRight
} from 'lucide-react';

interface VerificationResult {
  is_valid: boolean;
  confidence: number;
  issues: string[];
  document_type_detected?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nationality?: string;
  document_number?: string;
  student_name?: string;
  university?: string;
  academic_year?: string;
  study_year?: number;
  field_of_study?: string;
  document_date?: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  pending:       { label: 'En attente',        color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', Icon: Clock },
  manual_review: { label: 'En vérification',  color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  verified:      { label: 'Vérifié ✓',         color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle },
  rejected:      { label: 'Rejeté',            color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: XCircle },
};

export default function KYC() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [analyzingDoc, setAnalyzingDoc] = useState<string | null>(null);
  const [profileData, setProfileData]   = useState<any>(null);
  const [idResult, setIdResult]         = useState<VerificationResult | null>(null);
  const [certResult, setCertResult]     = useState<VerificationResult | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: 'ok' | 'err' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' | 'info' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    loadProfile();
  }, [user, role, authLoading]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const table = role === 'center' ? 'centers' : 'students';
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      setProfileData(data);
    } catch {}
    setLoading(false);
  };

  const analyzeDocument = async (path: string, docType: 'certificate' | 'id_document') => {
    setAnalyzingDoc(docType);
    try {
      const { data, error } = await supabase.functions.invoke('verify-document', {
        body: { document_type: docType, storage_path: path },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result = data.verification as VerificationResult;
      if (docType === 'id_document') setIdResult(result);
      else setCertResult(result);
      const status = data.status;
      if (status === 'verified')      showToast(t('kyc.aiVerified'), 'ok');
      else if (status === 'manual_review') showToast(t('kyc.aiManualReview'), 'info');
      else showToast(t('kyc.aiRejected'), 'err');
      loadProfile();
    } catch (e: any) {
      showToast(e?.message || t('kyc.aiError'), 'err');
    }
    setAnalyzingDoc(null);
  };

  const handleFileUpload = async (file: File, type: 'certificate' | 'id_document') => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `${user.id}/${type}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('kyc-documents')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      if (role === 'student' && profileData) {
        const upd: any = {};
        if (type === 'certificate')  upd.certificate_url  = path;
        else                         upd.id_document_url  = path;
        const { error } = await supabase.from('students').update(upd).eq('id', profileData.id);
        if (error) throw error;
      }
      showToast(t('kyc.uploadSuccess'), 'ok');
      await loadProfile();
      await analyzeDocument(path, type);
    } catch (e: any) {
      showToast(e?.message || t('kyc.uploadError'), 'err');
    }
    setUploading(false);
  };

  const handleSubmitStudentKYC = async () => {
    if (!profileData?.certificate_url || !profileData?.id_document_url) {
      showToast(t('kyc.missingDocuments'), 'err'); return;
    }
    try {
      const { error } = await supabase
        .from('students')
        .update({ verification_status: 'manual_review' })
        .eq('id', profileData.id);
      if (error) throw error;
      showToast(t('kyc.submitted'), 'ok');
      loadProfile();
    } catch (e: any) { showToast(e?.message, 'err'); }
  };

  const handleVerifyBusiness = async () => {
    if (!profileData) return;
    setVerifying(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('verify-business', {
        body: { center_id: profileData.id, verification_type: 'all' },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      const s = result?.verification_status;
      if (s === 'verified')  showToast(t('kyc.verificationSuccess'), 'ok');
      else if (s === 'rejected') showToast(t('kyc.verificationFailed'), 'err');
      else showToast(t('kyc.verificationPending'), 'info');
      loadProfile();
    } catch (e: any) { showToast(e?.message || t('kyc.verificationError'), 'err'); }
    setVerifying(false);
  };

  const renderAiResult = (result: VerificationResult, type: 'id_document' | 'certificate') => {
    const ok   = result.is_valid && result.confidence >= 80;
    const mid  = result.confidence >= 50;
    const color = ok ? '#059669' : mid ? '#d97706' : '#dc2626';
    const bg    = ok ? '#f0fdf4' : mid ? '#fffbeb' : '#fef2f2';
    const border= ok ? '#bbf7d0' : mid ? '#fde68a' : '#fecaca';
    return (
      <div style={{ marginTop:12, padding:'14px 16px', background:bg, border:`1px solid ${border}`, borderRadius:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <ScanSearch size={16} color={color} />
          <span style={{ fontWeight:700, fontSize:13, color:'#0f172a', flex:1 }}>{t('kyc.aiAnalysis')}</span>
          <span style={{ fontSize:12, fontWeight:700, color, background:'white', borderRadius:8, padding:'2px 8px', border:`1px solid ${border}` }}>
            {result.confidence}% {t('kyc.confidence')}
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 12px' }}>
          {type === 'id_document' && <>
            {result.document_type_detected && <KV label={t('kyc.docType')} val={result.document_type_detected} />}
            {result.first_name  && <KV label={t('kyc.firstName')}  val={result.first_name} />}
            {result.last_name   && <KV label={t('kyc.lastName')}   val={result.last_name} />}
            {result.date_of_birth && <KV label={t('kyc.dateOfBirth')} val={result.date_of_birth} />}
            {result.nationality && <KV label={t('kyc.nationalityLabel')} val={result.nationality} />}
          </>}
          {type === 'certificate' && <>
            {result.student_name  && <KV label={t('kyc.studentName')}  val={result.student_name} />}
            {result.university    && <KV label={t('kyc.universityLabel')} val={result.university} />}
            {result.academic_year && <KV label={t('kyc.academicYear')} val={result.academic_year} />}
            {result.field_of_study && <KV label={t('kyc.fieldOfStudy')} val={result.field_of_study} />}
            {result.study_year    && <KV label={t('kyc.yearOfStudy')} val={String(result.study_year)} />}
          </>}
        </div>
        {result.issues.length > 0 && (
          <div style={{ marginTop:10 }}>
            {result.issues.map((issue, i) => (
              <div key={i} style={{ display:'flex', gap:6, alignItems:'flex-start', fontSize:12, color:'#dc2626', marginBottom:4 }}>
                <AlertTriangle size={12} style={{ flexShrink:0, marginTop:2 }} />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (authLoading || loading) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:36, height:36, border:'3px solid #1d4ed8', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const vstatus = profileData?.verification_status || 'pending';
  const scfg    = STATUS_CFG[vstatus] ?? STATUS_CFG.pending;
  const SIcon   = scfg.Icon;

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:'#f8fafc' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:9999,
          background: toast.type === 'ok' ? '#059669' : toast.type === 'err' ? '#dc2626' : '#d97706',
          color:'white', borderRadius:14, padding:'10px 20px', fontSize:13, fontWeight:700,
          boxShadow:'0 4px 20px rgba(0,0,0,0.15)', maxWidth:'calc(100vw - 32px)', textAlign:'center' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%)', paddingTop:'env(safe-area-inset-top,0px)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px 24px' }}>
          <button onClick={() => navigate('/profile')} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'8px 14px', cursor:'pointer', color:'white' }}>
            <ChevronLeft size={16} /> <span style={{ fontSize:14, fontWeight:600 }}>Profil</span>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:scfg.bg, borderRadius:12, padding:'6px 12px', border:`1px solid ${scfg.border}` }}>
            <SIcon size={13} color={scfg.color} />
            <span style={{ fontSize:12, fontWeight:700, color:scfg.color }}>{scfg.label}</span>
          </div>
        </div>
        <div style={{ padding:'0 20px 28px' }}>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 6px' }}>{t('kyc.title')}</p>
          <h1 style={{ fontSize:22, fontWeight:800, color:'white', margin:'0 0 4px' }}>
            {role === 'center' ? '🏥 Centre Médical' : '🎓 Étudiant'}
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', margin:0 }}>{t('kyc.subtitle')}</p>
        </div>
      </div>

      <div style={{ flex:1, padding:'20px 16px 40px', display:'flex', flexDirection:'column', gap:16 }}>

        {/* AI Banner — student only */}
        {role === 'student' && (
          <SCard border="#bfdbfe" bg="#eff6ff">
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <ScanSearch size={20} color="#1d4ed8" style={{ flexShrink:0, marginTop:2 }} />
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:'#1e40af', margin:'0 0 4px' }}>{t('kyc.aiVerificationTitle')}</p>
                <p style={{ fontSize:13, color:'#3b82f6', margin:0 }}>{t('kyc.aiVerificationDesc')}</p>
              </div>
            </div>
          </SCard>
        )}

        {/* ── STUDENT ── */}
        {role === 'student' && (
          <>
            {/* Certificate */}
            <SCard title={<><GraduationCap size={17} color="#1d4ed8" />&nbsp;{t('kyc.certificate')}</>}>
              <p style={{ fontSize:13, color:'#64748b', margin:'0 0 12px' }}>{t('kyc.certificateDesc')}</p>
              {profileData?.certificate_url && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#eff6ff', borderRadius:12, padding:'10px 14px', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle size={15} color="#059669" />
                    <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{t('kyc.documentUploaded')}</span>
                  </div>
                  <button onClick={() => analyzeDocument(profileData.certificate_url, 'certificate')} disabled={!!analyzingDoc}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'white', border:'1px solid #bfdbfe', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:700, color:'#1d4ed8', cursor:'pointer' }}>
                    {analyzingDoc === 'certificate' ? <Spin /> : <><ScanSearch size={12} /> {t('kyc.reanalyze')}</>}
                  </button>
                </div>
              )}
              <FileInput id="cert" label={profileData?.certificate_url ? t('kyc.replaceDocument') : t('kyc.uploadCertificate')} disabled={uploading || !!analyzingDoc}
                onChange={f => handleFileUpload(f, 'certificate')} />
              {analyzingDoc === 'certificate' && <AnalyzingBanner label={t('kyc.analyzing')} />}
              {certResult && renderAiResult(certResult, 'certificate')}
            </SCard>

            {/* ID Document */}
            <SCard title={<><FileText size={17} color="#1d4ed8" />&nbsp;{t('kyc.idDocument')}</>}>
              <p style={{ fontSize:13, color:'#64748b', margin:'0 0 12px' }}>{t('kyc.idDocumentDesc')}</p>
              {profileData?.id_document_url && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#eff6ff', borderRadius:12, padding:'10px 14px', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle size={15} color="#059669" />
                    <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{t('kyc.documentUploaded')}</span>
                  </div>
                  <button onClick={() => analyzeDocument(profileData.id_document_url, 'id_document')} disabled={!!analyzingDoc}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'white', border:'1px solid #bfdbfe', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:700, color:'#1d4ed8', cursor:'pointer' }}>
                    {analyzingDoc === 'id_document' ? <Spin /> : <><ScanSearch size={12} /> {t('kyc.reanalyze')}</>}
                  </button>
                </div>
              )}
              <FileInput id="id_doc" label={profileData?.id_document_url ? t('kyc.replaceDocument') : t('kyc.uploadIdDocument')} disabled={uploading || !!analyzingDoc}
                onChange={f => handleFileUpload(f, 'id_document')} />
              {analyzingDoc === 'id_document' && <AnalyzingBanner label={t('kyc.analyzing')} />}
              {idResult && renderAiResult(idResult, 'id_document')}
            </SCard>

            {/* Submit */}
            {vstatus === 'pending' && (
              <button onClick={handleSubmitStudentKYC}
                disabled={!profileData?.certificate_url || !profileData?.id_document_url}
                style={{ width:'100%', padding:16, borderRadius:18, border:'none',
                  background: (profileData?.certificate_url && profileData?.id_document_url) ? 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' : '#e2e8f0',
                  color: (profileData?.certificate_url && profileData?.id_document_url) ? 'white' : '#94a3b8',
                  fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow:'0 4px 20px rgba(29,78,216,0.25)' }}>
                <Shield size={18} /> {t('kyc.submitForReview')}
              </button>
            )}
          </>
        )}

        {/* ── CENTER ── */}
        {role === 'center' && (
          <>
            <SCard title={<><Building2 size={17} color="#1d4ed8" />&nbsp;{t('kyc.businessInfo')}</>}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 16px' }}>
                <KV label={t('kyc.companyName')} val={profileData?.name || '—'} />
                <KV label={t('kyc.legalForm')} val={profileData?.legal_form || '—'} />
                <KV label="SIRET" val={profileData?.siret || '—'} mono />
                <KV label={t('kyc.vatNumber')} val={profileData?.vat_number || '—'} mono />
                <KV label={t('kyc.country')} val={profileData?.country || '—'} />
                <KV label={t('kyc.city')} val={profileData?.city || '—'} />
              </div>
              {!profileData?.siret && !profileData?.vat_number && (
                <div style={{ display:'flex', gap:8, alignItems:'center', background:'#fef2f2', borderRadius:12, padding:'10px 14px', marginTop:14 }}>
                  <AlertTriangle size={15} color="#dc2626" />
                  <span style={{ fontSize:13, color:'#dc2626' }}>{t('kyc.noBusinessNumber')}</span>
                </div>
              )}
            </SCard>

            {vstatus !== 'verified' && (profileData?.siret || profileData?.vat_number) && (
              <button onClick={handleVerifyBusiness} disabled={verifying}
                style={{ width:'100%', padding:16, borderRadius:18, border:'none',
                  background: verifying ? '#e2e8f0' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
                  color: verifying ? '#94a3b8' : 'white',
                  fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: verifying ? 'none' : '0 4px 20px rgba(29,78,216,0.25)' }}>
                {verifying ? <><Spin /> {t('kyc.verifying')}</> : <><Shield size={18} /> {t('kyc.verifyBusiness')}</>}
              </button>
            )}

            {vstatus === 'verified' && (
              <SCard border="#bbf7d0" bg="#f0fdf4">
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <CheckCircle size={22} color="#059669" />
                  <div>
                    <p style={{ fontWeight:700, fontSize:15, color:'#064e3b', margin:0 }}>{t('kyc.verified')}</p>
                    {profileData?.verified_at && (
                      <p style={{ fontSize:12, color:'#6ee7b7', margin:0 }}>
                        {t('kyc.verifiedAt')} {new Date(profileData.verified_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </SCard>
            )}
          </>
        )}

        <button onClick={() => navigate('/dashboard')}
          style={{ width:'100%', padding:14, borderRadius:16, border:'1.5px solid #e2e8f0', background:'white', fontSize:14, fontWeight:700, color:'#64748b', cursor:'pointer' }}>
          {t('kyc.backToDashboard')}
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Small helpers ── */
function SCard({ children, title, bg = 'white', border = '#e2e8f0' }: any) {
  return (
    <div style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:20, padding:'16px 16px' }}>
      {title && <p style={{ fontWeight:800, fontSize:15, color:'#0f172a', margin:'0 0 12px', display:'flex', alignItems:'center', gap:6 }}>{title}</p>}
      {children}
    </div>
  );
}

function KV({ label, val, mono }: { label: string; val: string; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize:11, color:'#94a3b8', margin:'0 0 2px', fontWeight:600 }}>{label}</p>
      <p style={{ fontSize:13, fontWeight:700, color:'#0f172a', margin:0, fontFamily: mono ? 'monospace' : undefined }}>{val}</p>
    </div>
  );
}

function FileInput({ id, label, disabled, onChange }: { id: string; label: string; disabled: boolean; onChange: (f: File) => void }) {
  return (
    <label htmlFor={id} style={{ display:'block', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <div style={{ border:'1.5px dashed #bfdbfe', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:8, background:'#f8fafc', opacity: disabled ? 0.5 : 1 }}>
        <Upload size={14} color="#1d4ed8" />
        <span style={{ fontSize:13, fontWeight:600, color:'#1d4ed8' }}>{label}</span>
      </div>
      <input id={id} type="file" accept="image/*,.pdf" disabled={disabled} style={{ display:'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
    </label>
  );
}

function AnalyzingBanner({ label }: { label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f1f5f9', borderRadius:12, padding:'10px 14px', marginTop:8 }}>
      <Spin /><span style={{ fontSize:13, color:'#64748b' }}>{label}</span>
    </div>
  );
}

function Spin() {
  return <div style={{ width:16, height:16, border:'2px solid #1d4ed8', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />;
}
