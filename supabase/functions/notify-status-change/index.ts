// Edge Function : notify-status-change
// Appelée par Database Webhooks sur : students (UPDATE), applications (UPDATE), messages (INSERT)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STATUS_LABELS: Record<string, { title: string; body: string; type: string }> = {
  verified:      { title: '✅ KYC Validé',             body: 'Votre identité a été vérifiée avec succès.',            type: 'success' },
  rejected:      { title: '❌ KYC Rejeté',             body: 'Votre dossier KYC a été rejeté. Vérifiez vos documents.', type: 'warning' },
  manual_review: { title: '🔍 KYC En cours',           body: 'Votre dossier est en cours de vérification manuelle.',   type: 'info'    },
  accepted:      { title: '🎉 Candidature acceptée !', body: 'Un centre médical a accepté votre candidature.',          type: 'success' },
  declined:      { title: '🚫 Candidature refusée',    body: 'Votre candidature a été refusée par le centre.',          type: 'warning' },
  pending:       { title: '⏳ Candidature reçue',      body: 'Votre candidature a bien été envoyée.',                   type: 'info'    },
  under_review:  { title: '👀 Candidature en révision', body: 'Le centre examine votre dossier.',                       type: 'info'    },
};

serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const { type, table, record, old_record } = await req.json();
    let user_id: string | null = null;
    let notif: { title: string; body: string; type: string; link: string } | null = null;

    // KYC
    if (table === 'students' && type === 'UPDATE') {
      const ns = record.verification_status;
      if (ns !== old_record?.verification_status && STATUS_LABELS[ns]) {
        user_id = record.user_id;
        notif = { ...STATUS_LABELS[ns], link: '/kyc' };
      }
    }

    // Candidature
    if (table === 'applications' && type === 'UPDATE') {
      const ns = record.status;
      if (ns !== old_record?.status && STATUS_LABELS[ns]) {
        user_id = record.student_user_id ?? null;
        if (!user_id && record.student_id) {
          const { data } = await supabase.from('students').select('user_id').eq('id', record.student_id).maybeSingle();
          user_id = data?.user_id ?? null;
        }
        if (user_id) notif = { ...STATUS_LABELS[ns], link: '/dashboard' };
      }
    }

    // Nouveau message
    if (table === 'messages' && type === 'INSERT') {
      const recipientId = record.recipient_id ?? record.receiver_id ?? null;
      const senderId    = record.sender_id ?? null;
      if (recipientId && recipientId !== senderId) {
        user_id = recipientId;
        const preview = record.content
          ? record.content.substring(0, 80) + (record.content.length > 80 ? '…' : '')
          : 'Vous avez reçu un nouveau message.';
        notif = { title: '💬 Nouveau message', body: preview, type: 'message', link: '/messages' };
      }
    }

    if (!user_id || !notif) return new Response(JSON.stringify({ skipped: true }), { headers: CORS });

    // 1. In-app notification
    await supabase.from('notifications').insert({
      user_id, title: notif.title, message: notif.body,
      type: notif.type, link: notif.link, is_read: false,
    });

    // 2. Push native
    await supabase.functions.invoke('send-push', {
      body: { user_id, title: notif.title, body: notif.body, type: notif.type, link: notif.link },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
});
