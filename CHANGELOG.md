# Changelog - Cuaderno del Profesor

## [2026-06-08] - Inyección de Recuperaciones Globales en Criterios
- **Mejorado**: Ahora la nota de una categoría de "Recuperación de Evaluación" no solo reemplaza la media final del periodo suspenso, sino que se proyecta e inyecta directamente hacia abajo en *todos los criterios de evaluación* (y por ende competencias) trabajados en las tareas de dicho periodo, superando la nota si la de recuperación es mayor. Evita tener que replicar tareas a mano.

## [2026-06-08] - Corrección Recuperación de Evaluación
- **Corregido**: Ahora la "Recuperación de Evaluación" solo sobreescribe las notas de las evaluaciones seleccionadas si estas están **suspensas** (nota inferior al nivel de aprobado configurado) y si la nota de la recuperación es superior.

## [2026-06-04] - Informes de Curso Completo y Recuperaciones de Evaluación
- **Añadido**: Posibilidad de exportar los informes completos (criterios y competencias) para todo el "Curso Completo", sin dividirlos por evaluación (útil a final de curso).
- **Añadido**: Nuevo tipo de categoría en el cuaderno: "Recuperación de Evaluación".
- **Mejorado**: Las categorías de "Recuperación de Evaluación" pueden configurarse para sustituir automáticamente la nota final de una o varias evaluaciones concretas, aplicándose sola y estrictamente si la nota de recuperación es superior a la previa.
- **Mejorado**: La inserción de nota "directa" para la categoría de "Recuperación de Evaluación" permite establecer y recuperar de un solo dato la evaluación.

## [2026-04-17] - Robustez en Gestión de Archivos (Iframe Fallback)
- **Corregido**: Error de permisos ("Cross origin sub frames") al intentar abrir o guardar archivos en entornos de iframe (como el previsualizador de AI Studio).
- **Añadido**: Sistema de *fallback* automático. Si el navegador bloquea el cuadro de diálogo nativo por seguridad, la aplicación ahora realiza una descarga directa estándar (para guardar) o utiliza un selector de archivos tradicional (para abrir).
- **Mejorado**: Mayor compatibilidad del "Modo Archivo Local" en navegadores que restringen las APIs modernas de sistema de archivos.
- **Archivos modificados**:
    - `App.tsx`: Líneas 313-420. (Implementación de fallbacks en `saveToLocalFile` y `openLocalFile`).

## [2026-04-13] - Transparencia en Calificaciones y Desglose de Notas
- **Añadido**: Nuevo modal de "Desglose de Calificación" que muestra la fórmula matemática y el detalle de cómo se ha calculado la nota final de un alumno.
- **Añadido**: Visualización de la media de cada categoría dentro del desglose detallado.
- **Mejorado**: Las celdas de nota final (tanto por evaluación como final del curso) ahora son clicables para abrir el desglose.
- **Corregido**: Sincronización de colores y notas entre el Calendario y el Diario de Clase. Se ha unificado el manejo de fechas a UTC para evitar desfases por zona horaria que hacían que los cambios parecieran "perderse".
- **Archivos modificados**:
    - `components/GradebookTable.tsx`: Líneas 13, 76-78, 471-481, 688-710, 772-777, 830-840.
    - `services/gradeCalculations.ts`: Líneas 269-367.
    - `components/Icons.tsx`: Líneas 189-201.
    - `components/ClassJournal.tsx`: Líneas 16-27, 38-39, 48-49, 56-57, 70-71, 74-75, 84-85.
    - `components/GradeBreakdownModal.tsx`: Nuevo archivo.

## [2026-03-24] - Gestión de Copias de Seguridad y Persistencia
- **Mejorado**: El botón de "Descargar Copia (.db)" ahora utiliza el cuadro de diálogo nativo del sistema para permitir elegir la ubicación y el nombre del archivo (en navegadores compatibles).
- **Añadido**: Persistencia del archivo local vinculado. La aplicación ahora recuerda el archivo seleccionado en el "Modo Archivo Local" incluso después de recargar la página.
- **Mejorado**: Sistema de re-conexión de archivos locales. Por seguridad del navegador, se ha añadido un botón para re-conceder permisos de escritura al archivo recordado al iniciar la sesión.
- **Añadido**: Botón de "Desvincular Archivo" para desconectar la sincronización automática de forma segura.
- **Mejorado**: El nombre sugerido para los backups ahora incluye la fecha actual automáticamente.

## [2026-03-23] - Personalización de Sesiones y Mejoras en el Diario
- **Añadido**: Posibilidad de asignar un color de una paleta predeterminada a cada sesión individual desde el Calendario o el Diario de Clase.
- **Añadido**: Los colores de las sesiones se visualizan en la vista de mes, semana y día del calendario.
- **Mejorado**: El Diario de Clase ahora permite seleccionar el color de la sesión directamente.
- **Mejorado**: Sincronización bidireccional entre el Calendario y el Diario de Clase para las notas y colores de las sesiones.
- **Corregido**: Se ha eliminado el tachado del texto en las unidades didácticas marcadas como impartidas, usando ahora un color más suave para indicar el estado.
- **Mejorado**: En las estadísticas de éxito, ahora se muestra la relación numérica real de aprobados/total (ej. "80% (16/20)").

## [2026-02-xx] - Versión Inicial y Mejoras de Febrero
- Implementación del Calendario dinámico con programación de unidades.
- Gestión de Unidades Didácticas y Saberes Básicos.
- Diario de Clase integrado con la programación.
- Sistema de evaluación basado en criterios y competencias.
- Soporte para ACNEAE y adaptaciones.
