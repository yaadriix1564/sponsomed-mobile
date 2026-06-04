# Fix RLS — Données vides dans l'app

Si l'app affiche "Aucune offre" ou des erreurs, c'est que les tables Supabase ont RLS activé sans policy de lecture.

## Solution rapide

Dans **Supabase → SQL Editor**, colle et exécute :

```sql
-- Permettre la lecture publique des offres
create policy "public can read offers"
on public.offers for select to anon using (true);

-- Permettre la lecture des messages pour les utilisateurs connectés
create policy "auth users read messages"
on public.messages for select to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Permettre la lecture des candidatures pour les utilisateurs connectés
create policy "auth users read applications"
on public.applications for select to authenticated
using (auth.uid() = student_id);
```

## Vérification

Après avoir exécuté ces 3 commandes :
- `/offers` → les offres s'affichent
- `/messages` → les conversations s'affichent
- `/dashboard` → les candidatures s'affichent
