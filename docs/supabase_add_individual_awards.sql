-- Agrega premios individuales adicionales sin tocar los scripts previos.
-- Ejecutar despues de supabase_setup.sql
-- Puede ejecutarse tambien despues de supabase_add_golden_boot.sql

alter table if exists predictions
  add column if not exists assist_king_name text,
  add column if not exists assist_king_team_id text,
  add column if not exists assist_king_goals integer not null default 0,
  add column if not exists assist_king_assists integer not null default 0,
  add column if not exists mvp_name text,
  add column if not exists mvp_team_id text,
  add column if not exists mvp_goals integer not null default 0,
  add column if not exists mvp_assists integer not null default 0,
  add column if not exists golden_glove_name text,
  add column if not exists golden_glove_team_id text,
  add column if not exists golden_glove_clean_sheets integer not null default 0,
  add column if not exists golden_glove_goals_conceded integer not null default 0;

create index if not exists predictions_assist_king_idx
  on predictions (assist_king_assists desc, assist_king_goals desc);

create index if not exists predictions_golden_glove_idx
  on predictions (golden_glove_clean_sheets desc, golden_glove_goals_conceded asc);
