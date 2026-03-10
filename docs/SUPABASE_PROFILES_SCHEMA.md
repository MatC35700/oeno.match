# Schéma table PROFILES (Supabase)

## Tables référencées dans le projet

Le projet utilise **2 tables** Supabase, sans doublon :

| Table   | Usage                    |
|---------|--------------------------|
| `profiles` | Profil utilisateur (auth + onboarding) |
| `wines`   | Cave à vin               |

---

## Colonne `appellation` sur `public.wines`

- **Migration** : `supabase/migrations/20250310110000_add_appellation_to_wines.sql`
- **Type** : `text` (nullable)
- **Usage** : Appellation (AOC/AOP, IGP, etc.) — même niveau que domaine, cuvée, millésime. Référentiel par pays/région à intégrer dans `src/config/appellations.ts`.

---

## Colonnes de la table `public.profiles`

Toutes les données d'onboarding sont stockées dans cette table unique.

| Colonne               | Type      | Description |
|-----------------------|-----------|-------------|
| `id`                  | `uuid`    | PK, FK vers `auth.users.id` |
| `email`               | `text`    | Email utilisateur |
| `first_name`          | `text`    | Prénom |
| `last_name`           | `text`    | Nom |
| `avatar_url`          | `text`    | URL avatar (OAuth) |
| `preferred_language`  | `text`    | Langue (ex: fr, en) |
| `age`                 | `integer` | Âge |
| `experience_level`    | `text`    | beginner, amateur, confirmed, expert, master_sommelier |
| **`favorite_regions`**| **`text[]`** | Régions favorites (bordeaux, burgundy, champagne, etc.) |
| **`goals`**           | **`text[]`** | Objectifs (pairing, cellar, tasting, tasting_advice, buying_tips) |
| `onboarding_completed`| `boolean` | Onboarding terminé |
| `nationality`         | `text`    | (optionnel) |
| `created_at`          | `timestamptz` | |
| `updated_at`          | `timestamptz` | |

---

## Migration à exécuter

Si `favorite_regions` et `goals` manquent, exécuter dans **Supabase → SQL Editor** :

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorite_regions text[] DEFAULT '{}';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}';
```

Ou utiliser le fichier : `supabase/migrations/20250310000000_add_favorite_regions_and_goals_to_profiles.sql`

---

## Format des données

- **favorite_regions** : `["bordeaux", "burgundy", "champagne"]` (clés i18n)
- **goals** : `["pairing", "cellar", "tasting"]` (clés UserGoal)

Le client Supabase envoie des tableaux JS ; PostgREST les convertit automatiquement en `text[]`.
