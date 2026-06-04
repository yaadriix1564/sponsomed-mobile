-- ==============================================
-- FIX RLS — Offres visibles par tout le monde
-- Coller dans Supabase → SQL Editor → Run
-- ==============================================

-- 1. Autoriser la lecture des offres publiées (utilisateurs connectés ET anonymes)
drop policy if exists "public read published offers" on offers;
create policy "public read published offers"
  on offers for select
  using (status = 'published');

-- 2. Autoriser la lecture des centres (pour le join dans les offres)
drop policy if exists "public read centers" on centers;
create policy "public read centers"
  on centers for select
  using (true);

-- Vérification : doit retourner les offres
-- select count(*) from offers where status = 'published';
