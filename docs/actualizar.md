# Actualizar Datos Rápidamente ⚡

Para actualizar los datos del simulador con los partidos más recientes jugados a nivel mundial:

1. Abrí la terminal en la raíz del proyecto.
2. Ejecutá:
   ```bash
   python scripts/parse_history.py
   ```
3. *(Opcional)* Si querés descargar todo desde cero borrando la caché local:
   ```bash
   rm scripts/results.csv; python scripts/parse_history.py
   ```
