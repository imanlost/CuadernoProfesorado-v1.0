# **Manual de Usuario:**

# **Cuaderno Profesorado v1.0**

El presente documento constituye la guía técnica de referencia integral para la configuración, administración, explotación y mantenimiento de la aplicación **Cuaderno del Profesorado**. Esta herramienta ha sido diseñada bajo el estricto principio de **soberanía de datos**. A diferencia de las plataformas comerciales en la nube, aquí se garantiza que toda la información sensible del alumnado (datos personales, necesidades educativas y calificaciones) y del proceso evaluativo permanezca alojada y encriptada localmente en el navegador del equipo del docente. Esto elimina dependencias de servidores externos, evita suscripciones recurrentes y anula los riesgos de privacidad asociados a la cesión de datos a terceros.

A continuación, se detallan exhaustivamente los procedimientos necesarios para la correcta implementación del flujo de trabajo docente, abarcando desde la parametrización inicial del entorno hasta la generación de informes competenciales avanzados para las sesiones de evaluación.

## **📑 Índice de Contenidos**

1. **Configuración Inicial y Parametrización del Entorno**  
2. **Gestión Académica: Estructura de Grupos y Alumnado**  
3. **Ingeniería Curricular y Planificación Didáctica**  
4. **Cuaderno de Evaluación: Calificación y Seguimiento**  
5. **Resolución de Incidencias Técnicas y Mantenimiento**  
6. **Créditos, Licencia y Filosofía del Proyecto**

## **⚙️ 1\. Configuración Inicial y Parametrización del Entorno**

Tras el despliegue exitoso de la aplicación en el entorno local (localhost), es imperativo realizar una adaptación meticulosa del entorno de trabajo antes de proceder a la introducción de datos académicos. Una configuración inicial precisa no solo es estética, sino fundamental para garantizar la automatización correcta de los cálculos de evaluación ponderada y la integridad de la planificación temporal a lo largo del curso.

Para iniciar este proceso, acceda al menú de configuración global mediante el icono del engranaje situado en la esquina superior derecha de la interfaz de usuario.

### **🛠️ Ajustes Generales del Curso**

En esta sección se definen los parámetros temporales y estructurales que regirán el comportamiento algorítmico de la aplicación durante todo el año académico.

* **Pantalla de inicio**: Permite personalizar la experiencia de usuario seleccionando la vista predeterminada al iniciar la sesión. Las opciones disponibles (por ejemplo, el *Calendario Semanal*, el *Diario de Clase* del día actual o el *Listado General de Cursos*) permiten optimizar el flujo de trabajo, priorizando el acceso inmediato a la información más relevante para el docente según su rutina diaria.  
* **Límites Temporales (Fechas)**: Establecimiento riguroso de las fechas de inicio y finalización del curso escolar. Estas fechas actúan como los límites lógicos para la generación automática del calendario, la distribución de sesiones y la visualización de informes temporales. Es crucial incluir los días de septiembre y junio si se desea planificar evaluaciones iniciales o finales.  
* **Estructura Horaria (Franjas)**: Configuración de la distribución temporal de las sesiones lectivas diarias.  
  \[\!TIP\]  
  **Recomendación técnica:** Se sugiere encarecidamente eliminar la totalidad de las franjas horarias predefinidas en la instalación por defecto y generarlas nuevamente desde cero. Esto garantiza una alineación precisa con el horario lectivo oficial del centro, permitiendo incluir recreos o cambios de clase si fuera necesario para evitar conflictos visuales en el calendario semanal.  
* **Sistema de Evaluación**: Definición de los periodos evaluativos (Trimestres, Cuatrimestres, Evaluaciones Finales) y, crucialmente, su **ponderación porcentual** en la calificación final del curso.  
  * *Implicación*: Una asignación correcta de pesos (ej. 1ª Ev: 30%, 2ª Ev: 30%, 3ª Ev: 40%) es vital, ya que el sistema utiliza estos valores para calcular automáticamente la nota media final del curso en tiempo real.  
* **Calendario Festivo**: Registro de los periodos no lectivos, vacaciones (Navidad, Semana Santa) y festividades locales, autonómicas o nacionales.  
  * *Nota*: Para festividades de jornada única, la fecha de inicio y la de finalización deberán ser coincidentes. La correcta introducción de estos datos evitará que el sistema asigne erróneamente sesiones lectivas o tareas en días inhábiles, manteniendo la fidelidad de la programación de aula.

### **📚 Ajustes de Cursos y Materias**

Configuración de la carga docente anual y la estructura administrativa de las asignaturas impartidas.

1. **Nivel Educativo**: Seleccione el nivel correspondiente en el menú desplegable (ej. 3º ESO, 1º Bachillerato, FP Básica). Esta selección etiqueta internamente los datos, preparando al sistema para vincular los currículos oficiales correspondientes en pasos posteriores.  
2. **Denominación de la Materia**: Introduzca el nombre oficial de la asignatura (ej. Matemáticas Académicas, Geografía e Historia, Tecnología). Se recomienda usar nombres distintivos si imparte materias similares en distintos niveles.  
3. **Gestión de Tareas No Lectivas (*Otras ocupaciones*)**: Esta funcionalidad está destinada al registro de actividades complementarias que forman parte del horario laboral pero no de la docencia directa (guardias de recreo, reuniones de departamento, horas de coordinación pedagógica o tareas administrativas de jefatura). Su uso permite completar el horario personal, ofreciendo una visión holística de la jornada laboral del docente en el calendario.

## **👥 2\. Gestión Académica: Alumnado y Grupos**

Esta sección aborda la creación de la arquitectura de grupos y la matriculación virtual de los estudiantes, pasos previos indispensables para habilitar las funciones de evaluación.

### **Creación y Organización de Grupos (Clases)**

El sistema permite la creación flexible de grupos de alumnos asociados a las materias previamente configuradas, soportando tanto grupos naturales como desdobles.

1. Seleccione la opción \+ Añadir clase dentro de la configuración de la materia específica.  
2. Asigne una nomenclatura clara e identificativa (ej. 3ºA, 1ºBachi-C, 4ºESO-Diver). Se recomienda mantener una coherencia en la nomenclatura (siglas, guiones) para facilitar la navegación rápida y visual entre grupos en el menú lateral.

### **Importación Masiva y Gestión de Datos del Alumnado**

La aplicación incorpora herramientas avanzadas para la carga de datos en lote (*bulk import*), diseñadas específicamente para optimizar el tiempo de configuración inicial y minimizar los errores humanos derivados de la transcripción manual de listados.

\[\!NOTE\]

**Procedimiento de importación:**

Es posible transferir los listados de estudiantes copiando y pegando directamente desde fuentes externas como hojas de cálculo (Excel, Google Sheets, LibreOffice Calc) o documentos de texto planos generados por plataformas de gestión educativa (Séneca, Raíces, etc.), siempre que los nombres estén separados por saltos de línea claros.

\[\!IMPORTANT\]

**Protocolo de reconocimiento de listas:**

En ocasiones, al introducir manualmente nombres o pegar desde formatos con codificación extraña, el sistema puede no procesar la lista inmediatamente. El protocolo de solución es simple: se requiere seleccionar la totalidad del texto introducido en el cuadro de importación, copiarlo (Ctrl+C) y pegarlo nuevamente (Ctrl+V) en el mismo campo. Esta acción fuerza al sistema a disparar el evento de reconocimiento, re-indexando el contenido y validando cada línea como un registro de estudiante independiente.

**Atención a la Diversidad:**

Tras la importación exitosa, el sistema habilita campos específicos en la ficha del alumno para registrar las *Necesidades Educativas Especiales (NEE)* o *Necesidades Específicas de Apoyo Educativo (NEAE)*. Cumplimentar esta información es esencial para tener presentes las adaptaciones curriculares (significativas o no significativas) o metodológicas necesarias durante el proceso de evaluación y planificación diaria.

### **📅 Configuración del Horario Semanal**

Una vez definidos los cursos y las franjas horarias, proceda a la asignación de los grupos a sus bloques temporales correspondientes mediante una interfaz visual. Esta acción no solo ordena la semana, sino que poblará automáticamente el calendario anual y habilitará el seguimiento diario de la programación de aula a través del Diario de Clase.

## **🧠 3\. Ingeniería Curricular y Planificación Didáctica**

Este módulo constituye el núcleo pedagógico de la aplicación, permitiendo la alineación técnica de la evaluación con los marcos normativos vigentes (LOMLOE y decretos autonómicos).

### **Importación y Estructuración del Currículo (CSV)**

Para la implementación efectiva de una evaluación competencial real, es necesario cargar la estructura curricular completa de la materia. El sistema procesa un archivo en formato CSV estándar que debe relacionar jerárquicamente los siguientes elementos normativos:

Criterios de Evaluación ➡️ Competencias Específicas ➡️ Descriptores Operativos ➡️ Perfil de Salida

Una correcta vinculación en este archivo base permitirá que, al calificar una simple tarea diaria (ej. "Ejercicio de integrales"), el sistema calcule en cascada y en segundo plano el grado de adquisición de las competencias clave asociadas, sin necesidad de cálculos manuales complejos por parte del docente.

\[\!TIP\]

**Automatización mediante IA:**

Dada la complejidad sintáctica y el volumen de datos de las relaciones curriculares (que pueden sumar cientos de cruces), se aconseja encarecidamente el uso de herramientas de Inteligencia Artificial Generativa (como Gemini o ChatGPT) para la estructuración y generación de este archivo CSV con el formato requerido. Una configuración correcta en una única hoja de cálculo permite la carga automática de miles de relaciones curriculares en cuestión de segundos, ahorrando días de trabajo administrativo.

### **Planificación de Unidades Didácticas y Sesiones**

Sección destinada a la organización temporal de los saberes básicos y contenidos.

* **Unidades Didácticas**: Defina los bloques temáticos, sus objetivos didácticos y su duración estimada en sesiones.  
* **Sesiones**: Desglose operativo de las unidades en sesiones diarias concretas.  
  Al igual que en el apartado curricular, la importación mediante hoja de cálculo optimiza este proceso masivo. Una vez finalizada la configuración, la planificación diaria se reflejará automáticamente en la vista de calendario, permitiendo al docente anticipar las necesidades de cada clase y ajustar la programación ante imprevistos.

### **📏 Instrumentos de Evaluación Diversificados**

El sistema trasciende la calificación numérica simple (0-10), permitiendo el uso de herramientas cualitativas y cuantitativas alineadas con la evaluación formativa y continua:

* **Rúbricas**: Matrices de evaluación complejas con niveles de desempeño fijos (ej. Experto, Avanzado, Aprendiz, Nobel) y descriptores cualitativos detallados para cada nivel. Ideales para proyectos o exposiciones orales.  
* **Escalas de valoración**: Herramientas flexibles para la evaluación de aspectos concretos, frecuencia de comportamientos o grados de consecución, sin la rigidez estructural de los niveles fijos obligatorios de las rúbricas.  
* **Listas de cotejo**: Herramientas de evaluación binaria (Sí/No, Logrado/No Logrado, Presentado/No Presentado) ideales para la observación sistemática de conductas, revisión de tareas diarias o procedimientos de seguridad en laboratorio.

## **📝 4\. Cuaderno de Evaluación y Calificación**

Este es el espacio de trabajo diario donde se registra el progreso del alumnado. Acceda al grupo específico para iniciar el proceso de calificación.

### **Categorización y Ponderación (Estructura de Evaluación)**

Utilice el icono de la **cruz verde** ➕ para generar categorías evaluables o dimensiones de calificación personalizadas (ej. *Pruebas Escritas*, *Cuaderno de Clase*, *Proyectos Cooperativos*, *Observación Directa*, *Actitud*).

* **Ponderación**: Asigne el peso porcentual de cada categoría dentro de la evaluación total. La suma de las ponderaciones de todas las categorías activas determinará la calificación final del periodo.  
* **Mecanismo de Recuperación**: Al activar la opción "Recuperación" en una categoría específica, el sistema modificará su algoritmo de cálculo. Entenderá que la calificación introducida en esta categoría tiene prioridad y sobrescribirá, a efectos de cálculo de medias, las calificaciones previas de las categorías seleccionadas como "recuperables". Esto es fundamental para gestionar exámenes de recuperación o segundas oportunidades sin perder el registro histórico de la primera calificación.

\[\!TIP\]

**Optimización del flujo de trabajo (Replicación):**

En la zona inferior de la interfaz, se encuentra disponible la función de **replicación de categorías**. Utilice esta opción para transferir la estructura de evaluación completa (categorías y ponderaciones) a otros grupos del mismo nivel educativo (ej. copiar de 3ºA a 3ºB), garantizando la coherencia en los criterios de calificación en líneas paralelas.

### **Gestión de Tareas y Registro de Calificaciones**

Genere tareas específicas dentro de las categorías creadas y vincúlelas directamente con los *Criterios de Evaluación* pertinentes del currículo importado. Esta vinculación es lo que permite la "evaluación criterial".

* **Replicación de tareas**: Es posible copiar una tarea individual ya configurada y pegarla en otros cursos, así como duplicarla dentro de la misma categoría para generar variantes (ej. *Examen T1* duplicarlo para crear *Examen T2*), ahorrando tiempo en la configuración de actividades recurrentes.  
* **Modalidades de Calificación**: El sistema admite dos modos de entrada de datos:  
  1. **Desglosada**: Evaluando cada criterio asociado por separado para una mayor precisión competencial.  
  2. **Global**: Introduciendo una nota única para la tarea, la cual el sistema distribuirá equitativamente entre todos los criterios asociados para mantener la coherencia de los cálculos internos.

\[\!NOTE\]

**Importación de calificaciones externas:**

De manera análoga a la gestión de alumnado, es posible copiar una columna de calificaciones numéricas desde una hoja de cálculo externa (por ejemplo, resultados exportados de un formulario online tipo Google Forms o Moodle). La aplicación asignará cada valor al estudiante correspondiente siguiendo estrictamente el orden de lista establecido, validando que los valores estén dentro del rango permitido.

### **📊 Informes de Seguimiento Competencial**

Esta sección ofrece vistas analíticas de solo lectura y alto valor pedagógico. Su función es visualizar el cálculo automático del grado de consecución de las competencias específicas y las competencias clave, basándose en los datos atómicos registrados día a día en el cuaderno de evaluación. Estos informes son esenciales para preparar las sesiones de evaluación oficiales y para la toma de decisiones pedagógicas basadas en datos objetivos.

## **🔧 5\. Resolución de Incidencias Técnicas y Mantenimiento**

Al tratarse de una aplicación de ejecución local basada en tecnologías web modernas (React/Node.js), pueden surgir incidencias puntuales de renderizado debido a la gestión de memoria del navegador.

\[\!WARNING\]

**Protocolo de actuación ante Error de Carga (Pantalla en Blanco):**

En caso de visualizar el mensaje "Seleccione la clase" de manera persistente o experimentar un error de renderizado (pantalla en blanco) al intentar acceder a un grupo de calificación específico:

1. Navegue inmediatamente al menú Cuaderno \> Informes en la barra lateral.  
2. Seleccione el grupo afectado en el menú desplegable superior de esa pantalla. Esto fuerza al sistema a realizar una petición de lectura completa de los datos de ese grupo y recargarlos en la memoria activa.  
3. Regrese a la sección Calificaciones.

*Este procedimiento de "refresco" o "rehidratación de datos" habitualmente restablece la correcta visualización de la interfaz y la funcionalidad de las celdas de nota.*

## **📄 6\. Créditos, Licencia y Filosofía del Proyecto**

* **Desarrollo Asistido por IA**: Esta aplicación ha sido conceptualizada y desarrollada íntegramente con la asistencia técnica de modelos de Inteligencia Artificial avanzados (Google AI Studio) mediante un extenso proceso iterativo de depuración, diseño y refactorización. El autor declara no ser desarrollador de software profesional, por lo que el código fuente se ofrece "tal cual" (*as is*), abierto a la auditoría, implementación de mejoras, corrección de errores y adaptación por parte de la comunidad educativa y desarrolladora.  
* **Licenciamiento Abierto**: La obra se distribuye bajo la licencia **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**, fomentando el espíritu de colaboración en la educación pública.  
  * **Usted es libre de**: Compartir (copiar y redistribuir el material en cualquier medio o formato) y Adaptar (remezclar, transformar y construir a partir del material para sus propias necesidades).  
  * **Bajo las siguientes condiciones**: Debe reconocer adecuadamente la autoría original y no puede utilizar el material con fines comerciales ni lucrar con su distribución.

