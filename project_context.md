# Project Context

## Proyecto

Simulador interactivo del Mundial 2026 hecho con Next.js 16, React 19 y Supabase.

Ruta del proyecto:
`D:\.CodeProjects\fixture`

## Stack

- Next.js `16.2.9`
- React `19.2.4`
- TypeScript
- Supabase JS `2.x`
- Framer Motion
- Lucide React

## Estado funcional actual

### Fase de grupos

- Hay 12 grupos de 4 equipos.
- Se pueden simular partidos de grupos o ajustar posiciones manualmente.
- Los grupos completos se ordenan abajo y arrancan colapsados.
- Los grupos pendientes suben arriba.
- Cada grupo muestra top 5 jugadores por selección.

### Mejores terceros

- Se calculan los 8 mejores terceros.
- Se muestran en una tabla dedicada.

### Cuadro eliminatorio

- El cuadro de 16avos está alineado al formato oficial FIFA 2026.
- Octavos también siguen el árbol oficial FIFA, no el lineal simple.
- En cruces se puede:
  - elegir ganador manualmente
  - cargar marcador manual tipo `2-1`, `6-3`, etc.
  - definir si se resolvió en `90'`, `ET` o `PEN`
  - permitir empate si se define por penales
  - marcar distintos tipos de partido `Chungo`

### Eventos de cruces

- A partir del marcador de un cruce, el sistema reparte automáticamente:
  - goleadores
  - asistidores
- El reparto usa:
  - top 5 jugadores de campo por equipo
  - peso por calidad del jugador
  - forma actual del torneo para varios nombres fuertes

### Jugadores por selección

- Cada selección expone `6` jugadores destacados:
  - `5` jugadores de campo
  - `1` arquero fijo en sexto lugar
- El arquero nunca entra al algoritmo de goleadores o asistidores.
- El arquero sí pesa en:
  - `Guante de Oro`
  - tandas de penales

### Estado "Chungo"

- Hay tipos distintos:
  - `Patadas`
  - `Ritmo`
  - `Roja`
  - `Lesión`
- El ganador arrastra penalizaciones acumulativas al siguiente cruce.
- Las penalizaciones afectan ataque, defensa y/o stamina según el tipo.
- Visualmente se muestra la marca del tipo y su acumulado.

### Empates, prórroga y penales

- En cruces ahora existe:
  - victoria en `90'`
  - victoria en `ET`
  - empate en el partido y definición por `PEN`
- En penales:
  - el usuario no elige goleadores
  - la tanda se simula según calidad de pateadores y arquero rival
- En prórroga:
  - el marcador cargado es el final del partido tras 120 minutos

### Comunidad

- Se muestran las predicciones guardadas de otros usuarios.
- Cada usuario muestra:
  - campeón predicho
  - goleador
  - máximo asistidor
  - MVP
  - guante de oro
  - método de cruces

### Login por nickname

- El nickname funciona como login rápido.
- Si el usuario escribe un nickname existente, entra a ese perfil.
- Si no existe, crea uno nuevo.

## UI / diseño actual

Se hizo una pasada grande hacia un estilo más limpio tipo Apple Sports:

- paleta dinámica por carga, dentro de un set curado
- mejor jerarquía visual
- menos texto redundante
- cards más limpias
- mobile bastante más adaptado
- grupos completos colapsados
- motion con Framer Motion
- inputs de marcador sin zoom molesto en mobile

## Archivos clave

### App principal

- [app/page.tsx](D:\.CodeProjects\fixture\app\page.tsx)
  - estado global
  - login / perfil
  - guardado en Supabase
  - simulación de grupos
  - simulación y persistencia de cruces
  - comunidad

- [app/globals.css](D:\.CodeProjects\fixture\app\globals.css)
  - diseño global
  - responsive
  - estilo de cards, tablas, botones y bracket

- [app/layout.tsx](D:\.CodeProjects\fixture\app\layout.tsx)
  - layout raíz
  - `lang="es"`

### Componentes

- [components/GroupCard.tsx](D:\.CodeProjects\fixture\components\GroupCard.tsx)
  - tabla del grupo
  - partidos del grupo
  - top 5 + arquero por selección
  - colapso de grupos completos

- [components/BestThirdsTable.tsx](D:\.CodeProjects\fixture\components\BestThirdsTable.tsx)
  - tabla de mejores terceros

- [components/BracketView.tsx](D:\.CodeProjects\fixture\components\BracketView.tsx)
  - cuadro eliminatorio
  - score manual
  - selector `90' / ET / PEN`
  - selector de tipos `Chungo`
  - detalle de eventos de gol/asistencia
  - detalle de penales

### Datos

- [data/teams.ts](D:\.CodeProjects\fixture\data\teams.ts)
  - equipos
  - grupos
  - standings
  - simulación base de grupos

- [data/players.ts](D:\.CodeProjects\fixture\data\players.ts)
  - top 5 jugadores de campo + arquero por selección
  - forma actual del torneo para algunos jugadores
  - generación de goleadores y asistencias
  - cálculo de premios individuales
  - cálculo de `Chungo`
  - simulación de tandas de penales

## Premios individuales implementados

Se calculan desde `koMatchDetails`:

- `Goleador`
- `Máximo asistidor`
- `MVP`
- `Guante de oro`

### Criterios actuales

- Goleador:
  - goles
  - desempate por asistencias

- Asistidor:
  - asistencias
  - desempate por goles

- MVP:
  - fórmula interna combinando goles, asistencias, calidad del jugador y bonus si salió campeón

- Guante de Oro:
  - vallas invictas
  - desempate por menos goles recibidos

## Supabase

Tabla principal:
- `predictions`

Archivo base existente:
- [docs/supabase_setup.sql](D:\.CodeProjects\fixture\docs\supabase_setup.sql)

Migración nueva para goleador:
- [docs/supabase_add_golden_boot.sql](D:\.CodeProjects\fixture\docs\supabase_add_golden_boot.sql)

Migración nueva para premios individuales:
- [docs/supabase_add_individual_awards.sql](D:\.CodeProjects\fixture\docs\supabase_add_individual_awards.sql)

### Columnas agregadas recientemente

De goleador:
- `golden_boot_name`
- `golden_boot_team_id`
- `golden_boot_goals`
- `golden_boot_assists`

De premios individuales:
- `assist_king_name`
- `assist_king_team_id`
- `assist_king_goals`
- `assist_king_assists`
- `mvp_name`
- `mvp_team_id`
- `mvp_goals`
- `mvp_assists`
- `golden_glove_name`
- `golden_glove_team_id`
- `golden_glove_clean_sheets`
- `golden_glove_goals_conceded`

## Persistencia actual

Dentro de `predictions` se guarda también JSON con:

- `matches`
- `manualStandings`
- `gdTweaks`
- `gfTweaks`
- `koWinners`
- `koMatchDetails`
- `goldenBoot`
- `assistKing`
- `mvp`
- `goldenGlove`
- `isBracketSimulated`

Además se guardan columnas planas para Comunidad:

- campeón sigue saliendo del JSON
- premios individuales salen de columnas dedicadas

## Verificación

Última verificación realizada:

- `npm run build`

Compila correctamente después de:

- UI cleanup
- cuadro FIFA oficial
- login por nickname
- grupos colapsables
- top jugadores
- score manual en cruces
- eventos de gol/asistencia
- chungo
- premios individuales
- empate / ET / penales
- arquero como 6to jugador
- accent dinámico por carga

## Cosas a tener en cuenta

- El modelo de reparto de goles/asistencias es heurístico, no estadístico real.
- La tabla actual del torneo usada como semilla en jugadores está hardcodeada parcialmente en `data/players.ts`.
- El `Guante de Oro` es una aproximación razonable para el simulador.
- Las tandas de penales son heurísticas: usan calidad de pateadores y arquero, no una base histórica real.
- Hay warnings/lint viejos en el repo que no se limpiaron todos; el build de producción sí está pasando.
- La UI mejoró bastante en mobile, pero todavía se puede pulir más la pestaña Comunidad y la de Stats.

## Posibles próximos pasos

- Crear una sección visual de `Premios del torneo` arriba de Comunidad.
- Mejorar la UI de Comunidad con layout más compacto.
- Agregar máximo asistidor y premios al modal/lectura de otro usuario con mejor presentación.
- Refinar pesos del MVP y Guante de Oro.
- Crear dataset más realista y completo de jugadores por selección.
- Agregar visualización tipo timeline de goles en cada cruce.
- Agregar tarjetas de jugador con goles/asistencias acumuladas del torneo.
