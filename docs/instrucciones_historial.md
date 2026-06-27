# Instrucciones: Historial de Partidos y Algoritmo de Simulación

Hemos automatizado por completo el proceso de extracción, procesamiento y carga de los datos históricos de partidos de selecciones (periodo 2021-2026). No necesitas realizar ninguna configuración manual compleja en bases de datos o servicios externos. 

## 1. Funcionamiento del Pipeline

El script automatizado realiza las siguientes tareas:
1. **Descarga de Datos Reales:** Descarga el archivo de resultados históricos `results.csv` de fútbol internacional (Mart Jürisoo) que incluye todos los encuentros oficiales clase "A" disputados hasta la fecha.
2. **Filtrado y Procesamiento:**
   * Filtra los partidos jugados desde el **1 de enero de 2021**.
   * Identifica y mapea los nombres en inglés del dataset a los códigos ISO/FIFA del simulador (ej. *United States -> USA*, *Côte d'ivoire -> CIV*).
3. **Cálculo de Métricas Clave:**
   * **Win-Rate (WR):** Porcentaje neto de victorias.
   * **Diferencia de Goles Promedio (GD_avg):** Promedio de goles a favor vs goles en contra.
   * **Strength of Schedule (SoS):** Fuerza de los rivales enfrentados, normalizando los puntos FIFA promedio del oponente.
   * **Head-to-Head (H2H):** Record específico de enfrentamientos entre los 48 equipos clasificados.
4. **Generación de JSON:** Compila todo en `data/historial_equipos.json` para su carga estática y rápida en la web.

---

## 2. Cómo Actualizar los Datos en el Futuro

Si deseas actualizar el simulador con nuevos partidos jugados a medida que pase el tiempo, solo debes ejecutar el script en tu terminal:

```powershell
python scripts/parse_history.py
```

*Nota: Para forzar una descarga limpia y descartar la caché de partidos vieja, puedes eliminar el archivo `scripts/results.csv` antes de volver a ejecutar el comando.*

---

## 3. Algoritmo de Simulación Integrado

El simulador en `data/teams.ts` ahora utiliza un modelo enriquecido para calcular el "Poder" de cada selección:

### Fórmula de Poder Enriquecido:
$$\text{Poder} = (\text{Puntos FIFA} \times 0.60) + (\text{Rendimiento Histórico} \times 400) + (\text{Forma Reciente} \times 5)$$

Donde el **Rendimiento Histórico** se calcula a partir de las métricas reales del periodo 2021-2026:
$$\text{Rendimiento Histórico} = (WR \times 0.40) + (\tanh(GD\_avg) \times 0.35) + (SoS \times 0.25)$$

*   La función **tangente hiperbólica ($\tanh$)** comprime la diferencia de goles para evitar que goleadas anormales desvíen drásticamente las predicciones.

### Ajuste Head-to-Head (H2H):
Cuando dos selecciones se cruzan, el balance neto de sus partidos previos (2021-2026) modifica las probabilidades de victoria con un factor de hasta **$\pm 15\%$**, reflejando la "paternidad" histórica sobre el campo de juego.
