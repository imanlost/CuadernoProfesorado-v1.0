# Changelog - Cuaderno del Profesor

## [2026-09-04] - v2.14: Guardado automático de medidas ACNEAE + limpieza de PDFs
- **Corregido**: Las medidas ACNEAE del selector de la pestaña Anotaciones se guardan automáticamente en cuanto se marca o desmarca una casilla, sin necesidad de añadir una anotación con texto (antes solo se persistían al pulsar «Añadir anotación», que exigía comentario).
- **Documentación**: Eliminados los PDFs obsoletos de los manuales del repositorio; la documentación viva son los `.md` (el usuario genera los PDFs localmente).

## [2026-09-04] - v2.13: Etiqueta REP (repetidor/a) y selector de medidas ACNEAE
- **Añadido**: Nueva etiqueta ACNEAE **REP** (repetidor/a), que se muestra siempre como la medida menos prioritaria (última bolita, incluso por debajo de FPEX/NN).
- **Añadido**: Selector de medidas ACNEAE al añadir anotaciones en la ficha del alumno/a (marcas sus medidas: RE, REP, PAC...).

## [2026-09-03] - v2.12: Anotaciones por alumno, avisos flotantes y diálogos propios
- **Añadido**: Pestaña **Anotaciones** en la ficha del alumno/a (texto, fecha, aviso importante ⚠ con indicador en lista y ficha).
- **Añadido**: Sistema de **avisos flotantes** (toasts) que sustituye a los `alert()` nativos (descentrados en WebKitGTK).
- **Añadido**: **Diálogos de confirmación propios y centrados** sustituyendo a los `confirm()` nativos en acciones destructivas.
- **Añadido**: Modales de **importación en bloque editables** (escribir o pegar, revisar y redistribuir antes de guardar).
- **Corregido**: El pegado directo en los textareas de importación ya funciona (antes exigía pegar en un txt intermedio).

## [2026-09-02] - v2.11: Documentación y manuales
- **Documentación**: Limpieza del formato del manual de usuario y versionado de PDFs.

## [2026-06-23] - v2.10: Corrección al importar CSV
- **Corregido**: Vinculación EC→SC al importar CSV (se quitaba un espacio: "CEs N" → "CEsN").

## [2026-06-12] - v2.9: Modo LOMLOE Puro y orden alfabético de clases
- **Añadido**: **Modo LOMLOE Puro** (evaluación competencial): campo Peso (%) en competencias específicas, cálculo con `comp.weight`, badge de peso en la UI.
- **Añadido**: Orden alfabético de las clases.

## [2026-06-09] - Inicio de Nuevo Curso y Mejoras de Usabilidad
- **Novedad**: Múltiples Cursos Concurrentes (Entornos Locales). Añadido un nuevo gestor interno de bases de datos que permite crear, cambiar y borrar diferentes cursos / cuadernos directamente dentro de la aplicación, sin depender de la descarga de archivos `.db` al ordenador. ¡Ideal para trabajar aislando datos anualmente (ej. 24/25, 25/26...) o separar especialidades, siendo 100% compatible con lanzaderas tipo Tauri!
- **Novedad**: Añadido botón "Iniciar Nuevo Curso" en Ajustes > Copia de Seguridad. Permite realizar una transición limpia de año: elimina todos los datos fijos del año pasado (alumnos, diarios, calificaciones, tareas) pero conserva de manera intacta toda tu configuración inamovible (currículo, saberes, rúbricas, cursos). Además, adelanta automáticamente 1 año real todas las fechas del calendario, festivos y trimestres.
- **Novedad**: Ahora las **Unidades Didácticas (UD)** en la Planificación son arrastrables. Puedes reorganizar su orden desplazándolas hacia arriba o abajo cómodamente sin necesidad de borrarlas y volver a crearlas.
- **Mejorado**: La visualización de la tabla del cuaderno de evaluación (`GradebookTable`) se ha optimizado. Ya no se expande ocupando todo el ancho innecesariamente (ahora utiliza un tamaño ajustado al contenido para evitar columnas gigantes) y se han integrado sombras y resaltados visuales que conectan la interacción del cursor a lo largo de toda la fila, mejorando la legibilidad.
- **Archivos modificados**:
    - `/App.tsx`: Refactorizado `indexedDB.get/set` para parametrizar el nombre de la base de datos subyacente según un `cuaderno_active_workspace` en `localStorage`.
    - `/components/SettingsModal.tsx`: Añadido Panel visual "Múltiples Cursos (Entornos Locales)" permitiendo inyectar un cambio de Entorno (Workspace) con recarga automática, aislando bases `sql.js` independientes entre sí.

## [2026-06-08] - Inyección de Recuperaciones Globales en Criterios
- **Mejorado**: Ahora la nota de una categoría de "Recuperación de Evaluación" no solo reemplaza la media final del periodo suspenso en el boletín, sino que se proyecta e inyecta directamente hacia abajo en *todos los criterios de evaluación* (y por ende competencias) asociados a tareas de dicho periodo, actualizando sus promedios transparentemente si la nota de recuperación es mayor. Evita tener que replicar tareas a mano.
- **Archivos modificados**:
    - `components/GradebookTable.tsx`: Líneas modificadas para interceptar el cálculo de promedios locales inyectando una nueva pseudo-calificación (`recovery_grade`) aplicable a los criterios.
    - `services/gradeCalculations.ts`: Ajuste profundo en la lógica de consolidación de periodos para recoger y distribuir en cascada dinámicamente este valor superpuesto a todos los Criterios evaluados dentro del lapso de la evaluación suspensa.

## [2026-06-08] - Corrección Recuperación de Evaluación
- **Corregido**: Ahora la "Recuperación de Evaluación" solo sobreescribe las notas de las evaluaciones seleccionadas si estas están verdaderamente **suspensas** (nota inferior al nivel de aprobado configurado en Ajustes) y si la nota obtenida en la recuperación es estrictamente superior.
- **Archivos modificados**:
    - `services/gradeCalculations.ts`: Parche de lógica booleana sobre el control de umbrales en `calculatePeriodAverages`.

## [2026-06-04] - Informes de Curso Completo y Recuperaciones de Evaluación
- **Añadido**: Posibilidad de exportar los informes completos de alumnos (criterios y competencias) agrupados para el "Curso Completo", sin necesidad de aislarlos iterativamente por bloques de evaluación, lo que genera un acta resolutiva muy útil a final de curso.
- **Añadido**: Nuevo tipo estructural de Categoría de evaluación dentro del cuaderno: "Recuperación de Evaluación".
- **Mejorado**: Las categorías configuradas como "Recuperación de Evaluación" actúan interconectadas; pueden configurarse para reemplazar automáticamente la nota base en el cálculo final de una o varias evaluaciones concretas, funcionando de manera independiente y retroactiva.
- **Mejorado**: Soporte optimizado para las "notas directas": bastará un solo input numérico del profesor para alterar un árbol dependiente de notas de una evaluación.
- **Archivos modificados**:
    - `components/GradebookTable.tsx`: Integración de la UI para marcar categorías de recuperación con visualizador específico ("REC") en su celda superior.
    - `components/CategoryModal.tsx`: Nuevo Checkbox y Panel desplegable para permitir decidir a qué periodos previos concretos apunta esta categoría de recuperación retroactiva.
    - `components/StudentReportModal.tsx`: Botonera expandida para habilitar la extracción masiva seleccionando la vista combinada "Curso Completo".

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
