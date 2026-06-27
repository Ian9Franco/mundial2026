# Roadmap & Documentación del Simulador de Mundial

Este proyecto es un simulador de la fase de grupos y fixture del Mundial (formato de 48 equipos con 12 grupos de 4).

## Características Implementadas

### 1. Simulación por Partidos (Automático)
- Cada grupo consta de 4 equipos y 6 partidos.
- No se requiere ingresar goles (sin marcador numérico).
- El usuario selecciona directamente el resultado de cada partido: **1** (Gana local), **X** (Empate), **2** (Gana visitante).
- Las posiciones se calculan automáticamente en tiempo real basándose en los puntos y criterios de desempate.
- El usuario puede ajustar individualmente la Diferencia de Goles (DG) y Goles a Favor (GF) de cada equipo usando botones `+` y `-` en la tabla para resolver empates manualmente sin ingresar marcadores completos.

### 2. Ordenación Manual de Standings (Modo Manual)
- Cada grupo se puede cambiar a **Modo Manual**.
- En este modo, se deshabilitan los partidos y se muestran controles de flechas (`▲` / `▼`) junto a cada equipo en la tabla.
- El usuario puede arrastrar/reordenar la posición final exacta de los equipos (1º, 2º, 3º y 4º) de forma directa y visual.

### 3. Tabla de Mejores Terceros
- Recopila en tiempo real a los 12 equipos que quedaron en 3º lugar de cada grupo.
- Los ordena bajo las reglas del torneo:
  1. Puntos
  2. Diferencia de goles
  3. Goles anotados
  4. Ranking FIFA (Ranking pre-torneo asignado a cada equipo)
- Resalta visualmente el Top 8 (Clasificados) en color esmeralda y los últimos 4 (Eliminados) en color rojo.

### 4. Llave de Cruces de Dieciseisavos (16avos)
- Genera dinámicamente las 16 llaves del cuadro de 32 equipos.
- Asocia los 12 ganadores de grupo, los 12 segundos y los 8 mejores terceros clasificados en base al emparejamiento preestablecido libre de colisiones.
- Destaca de manera interactiva el camino de un equipo al posicionar el cursor sobre él en cualquier sección del sitio.

### 5. Acciones Globales
- **Escenario Inicial:** Pre-carga el estado inicial real especificado en `detalles.txt` donde Suecia, Ecuador, Bosnia y Croacia, entre otros, lideran los mejores terceros.
- **Simular Todo:** Corre un algoritmo aleatorio sobre todos los partidos del fixture para generar un escenario completo instantáneamente.
- **Limpiar Todo:** Restablece todo el fixture a cero para iniciar una simulación desde una hoja en blanco.

## Criterios de Desempate Aplicados
El simulador sigue el orden establecido de criterios para ordenar la tabla:
1. Puntos obtenidos.
2. Diferencia de goles (modificable con botones +/-).
3. Goles anotados (modificable con botones +/-).
4. Mejor ranking FIFA previo al torneo (cada equipo cuenta con su ranking real/asignado del 1 al 48).
