# BACK TO OG

Next.js 14 + TypeScript + Tailwind + Supabase (Postgres, Auth, Realtime), déployable sur Vercel.

## Installation
Le projet Supabase `back-to-og` est déjà créé et le schéma déjà appliqué ; `.env.local` est déjà rempli. Il reste `npm install && npm run dev`, puis la création du compte SUPER_ADMIN ci-dessous.

Pour recommencer sur un autre projet :
1. Crée un projet sur supabase.com, colle `supabase/schema.sql` dans **SQL Editor** et exécute.
2. `cp .env.example .env.local` puis renseigne l’URL et la clé **anon** (Project Settings → API). Ne mets jamais la clé `service_role` dans le front.
3. `npm install && npm run dev`

## Créer ton compte SUPER_ADMIN
1. Sur `/connexion`, « Créer un compte » avec ton e-mail et un mot de passe fort.
2. Dans SQL Editor (remplace l’e-mail) :
```sql
update profiles set role = 'SUPER_ADMIN' where id = (select id from auth.users where email = 'ton@email.com');
```
Le rôle n’est jamais donné depuis le navigateur : seules les politiques RLS décident. Ensuite, désactive les inscriptions publiques : Authentication → Providers → Email → « Allow new users to sign up ».

## Déploiement Vercel
1. Pousse le dossier sur GitHub puis « Import Project » sur vercel.com.
2. Ajoute `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`, puis Deploy.

## Avant l’événement
`delete from duos where demo;` puis ajoute les vrais duos depuis `/admin/duos` (ou import CSV).

## Non inclus
Avatars, bannière et visuels modifiables, rôle ADMIN créable depuis l’interface (à faire en SQL).
