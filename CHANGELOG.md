# Changelog - Cuaderno del Profesorado

## [2026-03-17] - Sesión Actual
### Añadido
- **Umbral de Aprobado Personalizable:** Implementada la posibilidad de definir una nota de corte distinta de 5.0 en Ajustes.
- **Estadísticas Dinámicas:** El cálculo de éxito en el Cuaderno y Estadísticas de Grupo ahora utiliza el umbral configurado.
- **Relación Numérica de Éxito:** El badge de porcentaje de aprobados ahora muestra también la relación real (ej. 17/20).
- **Nota Informativa:** Aviso en Ajustes para sincronizar la escala de colores con el nuevo umbral de aprobado.

### Modificado
- **Visualización de Unidades:** En el planificador, las unidades marcadas como "impartidas" ya no se tachan; ahora se muestran en un color gris suave para mejorar la legibilidad.
- **Lógica de Colores:** La función de asignación de colores por defecto ahora respeta el umbral de aprobado configurado.

---

## [2026-02-01 a 2026-03-16] - Mejoras Consolidadas
### Evaluación LOMLOE
- **Gestión de Recuperaciones:** Lógica para tareas que sobreescriben o promedian notas de criterios.
- **Herramientas de Evaluación:** Integración de Rúbricas, Listas de Cotejo y Escalas de Valoración vinculadas a criterios.
- **Escalas de Calificación:** Sistema de "semáforos" de colores totalmente editables.

### Planificación y Programación
- **Planificador de Unidades (UDIs):** Definición de unidades, sesiones y vinculación con Saberes y Criterios.
- **Calendario Inteligente:** Generación automática basada en el horario del grupo y festivos.
- **Diario de Clase:** Notas diarias vinculadas a sesiones específicas.

### Análisis de Datos
- **Logro de Competencias:** Paneles de consecución de Competencias Específicas y Clave.
- **Distribución de Notas:** Gráficos de barras para análisis de rendimiento grupal.

### Usabilidad y UX
- **Modo Spreadsheet:** Entrada rápida de notas con teclado.
- **Etiquetas ACNEAE:** Sistema personalizable para atención a la diversidad.
- **Diseño Adaptativo:** Optimización para tablets y ordenadores de aula.

### Gestión de Datos
- **Importación/Exportación:** Soporte CSV para alumnos, criterios y saberes.
- **Copia de Seguridad:** Exportación a archivo local de la base de datos SQLite.
