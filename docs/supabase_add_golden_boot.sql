-- Extiende la tabla existente sin recrearla.
-- Ejecutar DESPUES de supabase_setup.sql

alter table if exists predictions
  add column if not exists golden_boot_name text,
  add column if not exists golden_boot_team_id text,
  add column if not exists golden_boot_goals integer not null default 0,
  add column if not exists golden_boot_assists integer not null default 0;

create index if not exists predictions_golden_boot_goals_idx
  on predictions (golden_boot_goals desc, golden_boot_assists desc);
