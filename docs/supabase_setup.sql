-- 1. Crear la tabla de predicciones
create table if not exists predictions (
  id text primary key,
  username text not null unique,
  avatar text, -- Almacena la imagen del avatar comprimida en base64
  predictions jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar la seguridad a nivel de fila (RLS)
alter table predictions enable row level security;

-- 3. Crear políticas de acceso público (Lectura y Escritura anónima)
-- Esto permite que cualquier usuario desde el navegador pueda registrar o comparar fixtures

-- Política: Permitir que cualquiera lea las predicciones
create policy "Permitir lectura pública de predicciones"
on predictions for select
using (true);

-- Política: Permitir que cualquiera inserte nuevas predicciones
create policy "Permitir inserción de predicciones"
on predictions for insert
with check (true);

-- Política: Permitir que cualquiera modifique su propia predicción (según el id de usuario)
create policy "Permitir actualización de predicciones"
on predictions for update
using (true)
with check (true);
