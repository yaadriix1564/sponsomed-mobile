# 🔔 Web Push Notifications — Guide de mise en place

## 1. Générer les clés VAPID (une seule fois)

```bash
npx web-push generate-vapid-keys
```

## 2. Secrets Supabase
**Dashboard → Settings → Edge Functions → Secrets**

| Clé | Valeur |
|-----|--------|
| `VAPID_PUBLIC_KEY` | Clé publique générée |
| `VAPID_PRIVATE_KEY` | Clé privée générée |
| `VAPID_SUBJECT` | `mailto:contact@sponsomed.com` |

## 3. Variable d'environnement projet mobile
```env
VITE_VAPID_PUBLIC_KEY=ta_clé_publique
```

## 4. Table SQL (Supabase → SQL Editor)
```sql
create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  updated_at timestamptz default now()
);
alter table push_subscriptions enable row level security;
create policy "users manage own subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);
```

## 5. Déployer les Edge Functions
```bash
npx supabase functions deploy send-push
npx supabase functions deploy notify-status-change
```

## 6. Database Webhooks (Supabase → Database → Webhooks)

### Webhook 1 — Statut KYC
- Table: `students` | Event: `UPDATE`
- URL: `https://<ref>.supabase.co/functions/v1/notify-status-change`

### Webhook 2 — Statut Candidature  
- Table: `applications` | Event: `UPDATE`
- URL: `https://<ref>.supabase.co/functions/v1/notify-status-change`

### Webhook 3 — Nouveau message
- Table: `messages` | Event: `INSERT`
- URL: `https://<ref>.supabase.co/functions/v1/notify-status-change`

> Ajouter le header : `Authorization: Bearer <SERVICE_ROLE_KEY>`
