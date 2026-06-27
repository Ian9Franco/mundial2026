# Propuesta de Integración: Datos Históricos (2021-2026) para el Motor de Predicción

Este documento presenta una propuesta técnica para recopilar e integrar resultados reales de partidos internacionales de las selecciones durante los últimos 5 años (2021-2026). El objetivo es complementar el ranking oficial de la FIFA con métricas de rendimiento realistas, mejorando sustancialmente el motor de simulación.

---

## 1. Fuentes Gratuitas de Datos Disponibles

Para obtener un historial completo de partidos clase 'A' de la FIFA sin incurrir en costos de licencias, proponemos las siguientes tres alternativas principales:

### Alternativa A: Kaggle Dataset (Recomendada)
* **Dataset:** *International football results from 1872 to 2026* (de Mart Jürisoo).
* **Licencia:** CC0 (Dominio Público).
* **Descripción:** Archivo CSV actualizado mensualmente que contiene todos los resultados internacionales de fútbol de la historia. Es la fuente abierta más limpia.
* **Filtro Aplicado:** Seleccionar registros de `date` entre `2021-01-01` y la actualidad.
* **URL:** `https://www.kaggle.com/datasets/martjyr/international-football-results-from-1872-to-2017`

### Alternativa B: API-Football (Plan Gratuito)
* **Proveedor:** API-Football (disponible en RapidAPI).
* **Plan:** Free Tier (50 peticiones/día).
* **Descripción:** Permite obtener resultados históricos en formato JSON directo de ligas y partidos de selecciones.
* **URL:** `https://www.api-football.com/`

### Alternativa C: RSSSF & Scrapers de Wikipedia
* **Descripción:** Scrapear los módulos de Wikipedia correspondientes a los partidos de cada selección o utilizar la base de datos abierta de RSSSF (Rec.Sport.Soccer Statistics Foundation).

---

## 2. Métricas a Extraer (Periodo 2021-2026)

Con los datos crudos de los partidos, se calcularán las siguientes métricas clave para cada una de las 48 selecciones:

| Métrica | Descripción | Peso Propuesto |
| :--- | :--- | :--- |
| **Win-Rate General (WR)** | Porcentaje de victorias en el periodo 2021-2026. | 35% |
| **Diferencia de Goles Promedio (GD_avg)** | Promedio de goles a favor menos goles en contra por partido. | 25% |
| **Factor Rival (SoS - Strength of Schedule)** | Nivel promedio de los rivales enfrentados (basado en su ranking FIFA en la fecha del encuentro). Evita inflar métricas de equipos que solo juegan contra rivales débiles. | 25% |
| **Rendimiento en Torneos Oficiales (CO)** | Rendimiento específico en competiciones oficiales de peso (Mundial 2022, Copas Continentales como Eurocopa, Copa América, Copa Africana, etc.) frente a partidos amistosos. | 15% |

---

## 3. Modelo Matemático Enriquecido

Actualmente, el poder de un equipo se calcula de forma lineal:
$$\text{Poder} = \text{Puntos FIFA} + (\text{Forma Reciente} \times 10)$$

### Nueva Propuesta de Cálculo de Poder:
$$\text{Poder Enriquecido} = (\text{Puntos FIFA} \times 0.60) + (\text{Rendimiento Histórico} \times 400)$$

Donde el **Rendimiento Histórico** se define como:
$$\text{Rendimiento Histórico} = (WR \times 0.40) + (\tanh(GD\_avg) \times 0.35) + (SoS \times 0.25)$$

* **$\tanh(GD\_avg)$**: Se utiliza la función tangente hiperbólica para normalizar la diferencia de goles a un rango de $[-1, 1]$, evitando que goleadas atípicas desvíen drásticamente el resultado.
* **$SoS$ (Strength of Schedule)**: Un multiplicador entre $[0.5, 1.5]$ basado en el ranking promedio de los oponentes.

### Historial de Enfrentamientos Directos (Head-to-Head / H2H)
Si dos selecciones se cruzan en una eliminatoria (ej. 16avos de final) y registran enfrentamientos directos entre 2021 y 2026:
* Calculamos el balance neto del H2H: $H2H_{neto} = \text{Victorias A} - \text{Victorias B}$.
* Modificamos la probabilidad final del partido:
  $$P(\text{Ganar A})_{final} = P(\text{Ganar A})_{poder} + (H2H_{neto} \times 0.05)$$
  *(Ajuste máximo topado en $\pm 0.15$ para no invalidar el poder del ranking).*

---

## 4. Plan de Implementación de Datos

1. **Extracción y Compresión:** Escribir un script en `/scripts/parse_history.py` que descargue el dataset de Kaggle, filtre por fechas y selecciones del mundial, calcule las métricas y las consolide en un archivo liviano llamado `data/historial_equipos.json` (aproximadamente 15 KB).
2. **Estructura del JSON resultante:**
   ```json
   {
     "ARG": {
       "win_rate": 0.78,
       "gd_average": 1.45,
       "strength_of_schedule": 1.25,
       "h2h": {
         "BRA": { "played": 4, "won": 2, "drawn": 1, "lost": 1 },
         "FRA": { "played": 1, "won": 0, "drawn": 1, "lost": 0 }
       }
     }
   }
   ```
3. **Carga en el Frontend:** Importar `historial_equipos.json` en `data/teams.ts` para ajustar las probabilidades de simulación en tiempo real sin requerir consultas de red.
