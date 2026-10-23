-- BACK TO OG — schéma Supabase. À exécuter dans SQL Editor.
create extension if not exists pgcrypto;

create table profiles (id uuid primary key references auth.users on delete cascade, role text not null default 'USER' check (role in ('USER','ADMIN','SUPER_ADMIN')));
create table duos (
  id uuid primary key default gen_random_uuid(),
  name text not null, player1 text not null, player2 text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','ELIMINATED','ABSENT')),
  points_override int, demo boolean not null default false, created_at timestamptz default now());
create table eliminations (
  id uuid primary key default gen_random_uuid(),
  eliminated_id uuid not null references duos on delete cascade,
  eliminator_id uuid references duos on delete set null,
  happened_at timestamptz not null default now(), note text,
  cancelled boolean not null default false, created_at timestamptz default now());
create unique index one_active_elimination on eliminations (eliminated_id) where not cancelled; -- anti-doublon
create table settings (
  id int primary key default 1 check (id = 1),
  title text not null default 'BACK TO OG',
  starts_at timestamptz not null default '2026-10-24T20:00:00+02:00',
  phase text not null default 'UPCOMING' check (phase in ('UPCOMING','LIVE','PAUSED','ENDED')),
  points_per_kill int not null default 1, auto_scoring boolean not null default true, show_ranking boolean not null default true);
insert into settings default values;
create table announcements (id uuid primary key default gen_random_uuid(), body text not null, active boolean not null default true, created_at timestamptz default now());
create table audit_log (id bigserial primary key, actor uuid default auth.uid(), action text, tbl text, row jsonb, at timestamptz default now());

-- Rôles
create function is_admin() returns boolean language sql security definer stable set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role in ('ADMIN','SUPER_ADMIN')) $$;
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as
$$ begin insert into profiles (id) values (new.id); return new; end $$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

-- Statut du duo synchronisé avec les éliminations
create function sync_status() returns trigger language plpgsql security definer set search_path = public as $$
declare d uuid := coalesce(new.eliminated_id, old.eliminated_id);
begin
  update duos set status = case when exists (select 1 from eliminations where eliminated_id = d and not cancelled) then 'ELIMINATED' else 'ACTIVE' end
  where id = d and status <> 'ABSENT';
  return null;
end $$;
create trigger elim_sync after insert or update or delete on eliminations for each row execute function sync_status();

-- Journal d'audit
create function log_audit() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into audit_log (action, tbl, row) values (tg_op, tg_table_name, to_jsonb(coalesce(new, old))); return null; end $$;
create trigger a1 after insert or update or delete on duos for each row execute function log_audit();
create trigger a2 after insert or update or delete on eliminations for each row execute function log_audit();
create trigger a3 after insert or update or delete on settings for each row execute function log_audit();
create trigger a4 after insert or update or delete on announcements for each row execute function log_audit();

-- Classement (points = manuels si renseignés, sinon éliminations x barème si calcul auto)
create view ranking with (security_invoker = true) as
select d.id, d.name, d.player1, d.player2, d.status, d.demo, k.kills, p.points,
       rank() over (order by p.points desc, k.kills desc) as pos
from duos d cross join settings s
cross join lateral (select count(*)::int as kills from eliminations e where e.eliminator_id = d.id and not e.cancelled) k
cross join lateral (select coalesce(d.points_override, case when s.auto_scoring then k.kills * s.points_per_kill else 0 end) as points) p;

-- Sécurité (RLS) : lecture publique, écriture réservée aux admins
alter table profiles enable row level security; alter table duos enable row level security;
alter table eliminations enable row level security; alter table settings enable row level security;
alter table announcements enable row level security; alter table audit_log enable row level security;
create policy p_profile on profiles for select using (id = auth.uid() or is_admin());
create policy p_duos_r on duos for select using (true);
create policy p_duos_w on duos for all using (is_admin()) with check (is_admin());
create policy p_el_r on eliminations for select using (not cancelled or is_admin());
create policy p_el_w on eliminations for all using (is_admin()) with check (is_admin());
create policy p_set_r on settings for select using (true);
create policy p_set_w on settings for update using (is_admin()) with check (is_admin());
create policy p_an_r on announcements for select using (active or is_admin());
create policy p_an_w on announcements for all using (is_admin()) with check (is_admin());
create policy p_audit on audit_log for select using (is_admin());
-- Aucun client ne peut modifier profiles : les rôles se donnent uniquement via le SQL Editor (voir README).

-- Temps réel
alter publication supabase_realtime add table duos, eliminations, settings, announcements, audit_log;

-- Données de démonstration (identifiées DÉMO, à supprimer avant l'événement)
insert into duos (name, player1, player2, demo) values
 ('Duo DÉMO 1','JoueurA','JoueurB',true),('Duo DÉMO 2','JoueurC','JoueurD',true),
 ('Duo DÉMO 3','JoueurE','JoueurF',true),('Duo DÉMO 4','JoueurG','JoueurH',true);
