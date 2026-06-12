# 📚 Manual de Usuario — Cuaderno del Profesorado (Web)

<p align="center">
  <img src="https://raw.githubusercontent.com/imanlost/CuadernoProfesorado-v1.0/main/public/cuadernoprofesor.svg" alt="Cuaderno Profesorado" width="200">
</p>

<p align="center">
  <a href="http://creativecommons.org/licenses/by-nc/4.0/"><img src="https://licensebuttons.net/l/by-nc/4.0/88x31.png" alt="CC BY-NC 4.0"></a>
</p>

Guía completa para la versión web del Cuaderno del Profesorado, accesible desde cualquier navegador moderno en **[cuadernodocentev2.vercel.app**](https://cuadernodocentev2.vercel.app/).


## Índice

1. [Primeros pasos y navegación](#1-primeros-pasos-y-navegación)

2. [Configuración inicial (Ajustes)](#2-configuración-inicial-ajustes)

   - [2.1 Configuración del Curso](#21-configuración-del-curso)

   - [2.2 Cursos y Materias](#22-cursos-y-materias)

   - [2.3 Clases y Alumnado](#23-clases-y-alumnado)

   - [2.4 Horario Semanal](#24-horario-semanal)

   - [2.5 Gestionar Currículo](#25-gestionar-currículo)

   - [2.6 Planificación de Unidades Didácticas](#26-planificación-de-unidades-didácticas)

   - [2.7 Instrumentos de Evaluación](#27-instrumentos-de-evaluación)

   - [2.8 Copia de Seguridad y Múltiples Cursos](#28-copia-de-seguridad-y-múltiples-cursos)

3. [El Calendario](#3-el-calendario)

4. [El Cuaderno de Notas](#4-el-cuaderno-de-notas)

   - [4.1 Calificaciones](#41-calificaciones)

   - [4.2 Informes competenciales](#42-informes-competenciales)

   - [4.3 Estadísticas de grupo](#43-estadísticas-de-grupo)

5. [El Diario de Clase](#5-el-diario-de-clase)

6. [Evaluación LOMLOE Puro](#6-evaluación-lomloe-puro)

7. [Exportación e impresión de informes](#7-exportación-e-impresión-de-informes)

8. [Consejos y buenas prácticas](#8-consejos-y-buenas-prácticas)

9. [Resolución de problemas](#9-resolución-de-problemas)


## 1. Primeros pasos y navegación

Al abrir la aplicación verás la pantalla principal con el **Calendario** como vista por defecto. La interfaz se compone de:

```
┌─────────────────────────────────────────────────┐  
│  Cuaderno Docente   \[Calendario\] \[Cuaderno ▼\] \[Diario\]  ⚙️ │ ← Barra superior  
├─────────────────────────────────────────────────┤  
│                                                     │  
│                 Área de trabajo                     │ ← Contenido principal  
│      (Calendario / Calificaciones / Diario)         │  
│                                                     │  
└─────────────────────────────────────────────────┘
```

- **Calendario**: planificador temporal con vistas de mes, semana y día

- **Cuaderno ▼**: menú desplegable con Calificaciones, Informes y Estadísticas

- **Diario de Clase**: registro textual diario

- **⚙️**: panel de Ajustes con toda la configuración

### ¿Dónde se guardan mis datos?

Tus datos se almacenan automáticamente en el **almacenamiento interno del navegador** (IndexedDB). No necesitas guardar manualmente; cada cambio se persiste en menos de 2 segundos. Para mayor seguridad, puedes sincronizar con un archivo `.db` en tu disco (ver [Copia de Seguridad](#28-copia-de-seguridad-y-múltiples-cursos)).

> ⚠️ **Importante**: Si borras los datos de navegación de tu navegador, perderás la base de datos. Haz copias de seguridad periódicas.


## 2. Configuración inicial (Ajustes)

Haz clic en el icono **⚙️** de la barra superior. Se abre el panel de Ajustes con las siguientes secciones en la barra lateral:

### 2.1 Configuración del Curso

Establece los parámetros fundamentales del año académico:

| Campo | Descripción |
| - | - |
| **Fechas del Curso** | Día de inicio y fin del curso. El calendario solo muestra días dentro de este rango |
| **Periodos de Evaluación** | Define 1ª, 2ª y 3ª Evaluación con sus fechas de inicio y fin. Puedes añadir más periodos con el botón **+ Añadir Periodo** |
| **Umbral de Aprobado** | Nota mínima para considerar aprobado (por defecto: 5.0) |
| **Ponderación de Evaluaciones** | Peso relativo de cada evaluación para la nota final (ej. 30% + 30% + 40%). El porcentaje se calcula automáticamente |
| **Modo de Evaluación** | Elige entre *Clásico* (media de categorías) o *LOMLOE Puro* (media de competencias específicas) |
| **Escala de Calificación** | Colores para rangos de nota (ej. rojo \< 5, verde ≥ 5). Configurable completamente |
| **Vacaciones y Festivos** | Días no lectivos que el calendario respetará al colocar sesiones |


> 💡 **Consejo**: Configura primero las fechas del curso y los periodos de evaluación. El resto de secciones dependen de estos datos.

### 2.2 Cursos y Materias

Aquí defines qué asignaturas impartes:

1. Selecciona el **Nivel Educativo** (1º ESO a 2º Bachillerato)

2. Escribe el nombre de la materia (ej. "Biología y Geología")

3. Haz clic en **Añadir Curso**

También puedes añadir **Otras Ocupaciones** (guardias, reuniones de departamento, etc.) que aparecerán en tu horario pero no tendrán alumnado ni calificaciones.

### 2.3 Clases y Alumnado

Gestiona tus grupos y su alumnado:

**Crear una clase:**

1. Haz clic en **Añadir Clase**

2. Asígnale un nombre (ej. "Biología y Geología 3ºA")

3. Selecciona el curso al que pertenece

**Añadir alumnado:**

- **Manual**: escribe los nombres uno a uno en la tabla

- **Carga masiva**: haz clic en **Añadir Alumnado en Lote**, pega una columna de nombres (copiada de Excel, Séneca o Raíces), un nombre por línea

**Etiquetas ACNEAE:** Haz clic en el botón **ACNEAE (N)** junto a cada alumno para añadir anotaciones de necesidades educativas (RE, ACS, TDAH, etc.). El contador indica cuántas etiquetas tiene ese alumno.

- Usa las flechas ▲▼ para reordenar al alumnado

- Usa el icono 🗑️ para eliminar un alumno

### 2.4 Horario Semanal

Configura tu horario para que el calendario sepa qué días tienes clase con cada grupo:

1. Define las **franjas horarias** de tu centro (ej. 8:30-9:25, 9:25-10:20... incluyendo el recreo)

2. Arrastra cada clase a la casilla correspondiente del horario

3. Las clases aparecerán automáticamente en el calendario los días que correspondan

### 2.5 Gestionar Currículo

El corazón de la evaluación competencial. Aquí importas y gestionas todos los elementos curriculares de la LOMLOE:

**Importar currículo desde CSV:**

1. Selecciona el curso en el desplegable

2. Prepara un archivo CSV con el formato descrito en el [README](file:///mnt/DATOS/PROYECTOS/CUADERNO/fusion_cuaderno/README.md#-formato-del-csv-curricular)

3. Haz clic en **Seleccionar y Cargar Archivo CSV**

4. Confirma la importación

**Secciones del gestor curricular:**

- **Competencias Clave y Descriptores Operativos**: elementos comunes a toda la etapa (ESO/Bachillerato). Solo lectura (no se pueden eliminar)

- **Competencias Específicas**: propias de cada materia. Puedes:

  - Editar código, descripción y **peso (%)** para el modo LOMLOE Puro

  - Vincular/desvincular Descriptores Operativos (aparecen como pastillas azules)

  - Añadir nuevas o eliminar existentes

- **Criterios de Evaluación**: vinculados a una Competencia Específica. Se vinculan automáticamente por su numeración (el criterio "1.2" se vincula a la competencia "CEs 1")

- **Saberes Básicos**: contenidos de la materia, organizados por bloques

**Exportar currículo:** haz clic en **Exportar CSV** para descargar una copia de tu currículo actual.

> ⚠️ **Zona de Peligro**: el botón rojo "Eliminar Currículo de la Etapa Seleccionada" borra TODO el currículo de ESO o Bachillerato. Úsalo solo si vas a reimportar desde cero.

### 2.6 Planificación de Unidades Didácticas

Crea tus UD (Unidades Didácticas o Situaciones de Aprendizaje):

1. Haz clic en **+ Nueva Unidad Didáctica**

2. Rellena:

   - **Nombre** (ej. "T1. La Célula")

   - **N.º de sesiones**: el calendario reservará ese número de días

   - **Saberes Básicos**: selecciona los contenidos vinculados

   - **Criterios de Evaluación**: selecciona los criterios que trabajas en esta unidad

3. Opcionalmente, define una **fecha de inicio** fija, o deja que el calendario la coloque secuencialmente

Las UD son **arrastrables** (drag & drop) para reordenarlas. También puedes marcarlas como **impartidas** ✅.

### 2.7 Instrumentos de Evaluación

Crea plantillas reutilizables para calificar tareas. Hay tres tipos:

#### Listas de Cotejo

Evaluación binaria (Sí/No). Cada ítem tiene un peso y puede vincularse a criterios de evaluación.

- Ejemplo: "Entrega a tiempo", "Incluye bibliografía", "Respeta el formato"

#### Escalas de Valoración

Niveles numéricos (ej. 1-5) con etiquetas (Insuficiente, Suficiente, Bien, Notable, Excelente).

- Ejemplo: Escala de 1 a 4 para evaluar la claridad expositiva

#### Rúbricas

Matrices con niveles y descriptores textuales detallados para cada criterio.

- Ejemplo: Rúbrica de informe de laboratorio con 4 niveles y descriptores específicos

**Importar/Exportar**: puedes importar instrumentos desde CSV para compartirlos con compañeros.

### 2.8 Copia de Seguridad y Múltiples Cursos

#### Copias de Seguridad

- **Descargar Copia (.db)**: guarda toda tu base de datos en un archivo. Haz esto periódicamente

- **Cargar Copia (.db)**: restaura una base de datos previamente guardada

- **Iniciar Nuevo Curso**: vacía alumnado, notas y diario, pero conserva currículo, instrumentos y configuración. Las fechas avanzan automáticamente 1 año. Ideal para la transición entre cursos académicos

#### Múltiples Cursos (Entornos Locales)

Puedes crear **espacios de trabajo independientes** para separar datos (ej. "24-25" y "25-26", o "Biología" y "Física y Química"). Cada espacio tiene su propia base de datos aislada.

#### Modo Archivo Local

Si tu navegador lo permite (Chrome, Edge), puedes **vincular un archivo `.db`** en tu disco:

1. Haz clic en **Seleccionar archivo local**

2. Elige un archivo `.db` (o créalo nuevo)

3. La aplicación escribirá automáticamente en ese archivo tras cada cambio

Esto te permite, por ejemplo, guardar el `.db` en una carpeta sincronizada con Google Drive o Dropbox.


## 3. El Calendario

El Calendario es la vista principal. Muestra:

- **Vista Mes**: días del mes con las sesiones programadas. Las UD aparecen como barras coloreadas

- **Vista Semana**: franjas horarias con las clases y sesiones de cada día

- **Vista Día**: detalle de un día concreto

### Navegación

- Usa las flechas **◀ ▶** para cambiar de mes/semana/día

- Haz clic en **Hoy** para volver a la fecha actual

- Usa los botones **Mes | Semana | Día** para cambiar la vista

### Acciones desde el Calendario

- **Añadir tarea calificable**: haz clic en cualquier día para crear una tarea que aparecerá en el Cuaderno de Notas

- **Ver/editar sesión**: haz clic en una sesión existente para ver sus detalles, cambiar el color o añadir notas

- Las sesiones de UD se colocan automáticamente en días laborables (L-V), saltando fines de semana y festivos


## 4. El Cuaderno de Notas

Accede desde el botón **Cuaderno ▼** en la barra superior. El menú desplegable ofrece tres secciones:

### 4.1 Calificaciones

La vista principal de evaluación. Estructura:

```
\[Biología y Geología 3ºA ▼\]  ← Selector de clase  
  
\[1ª Evaluación\] \[2ª Evaluación\] \[3ª Evaluación\] \[Final\]  ← Pestañas de periodo  
  
┌──────────┬───────────────┬───────────────┬───────────────┬───────────┐  
│ ALUMN@   │ 1ª EVALUACIÓN │ 2ª EVALUACIÓN │ 3ª EVALUACIÓN │ NOTA FINAL│  
├──────────┼───────────────┼───────────────┼───────────────┼───────────┤  
│ Elena G. │     7.5       │     8.2       │     6.9       │   7.5     │  
│ Marcos R.│     5.4       │     4.8       │     6.1       │   5.4     │  
│ ...      │               │               │               │           │  
└──────────┴───────────────┴───────────────┴───────────────┴───────────┘
```

**Cambiar de periodo**: haz clic en las pestañas superiores (1ª, 2ª, 3ª, Final). La pestaña **Final** consolida las tres evaluaciones con la ponderación configurada.

**Categorías y Tareas**:

1. Haz clic en el botón **+ Nueva Categoría** para crear un grupo de notas (ej. "Exámenes", "Trabajos", "Actitud")

2. Asígnale un **peso** a cada categoría (los pesos se normalizan automáticamente)

3. Dentro de cada categoría, añade **tareas** con el botón ➕

4. Para cada tarea, puedes elegir el **método de evaluación**:

   - **Nota directa**: introduces un número del 0 al 10

   - **Instrumento**: seleccionas una lista de cotejo, escala o rúbrica creada previamente

**Recuperaciones**:

- **Recuperación de tarea**: crea una tarea y asígnale la(s) tarea(s) que recupera. La nota de recuperación sustituye automáticamente la original si es mayor

- **Recuperación de evaluación**: en la pestaña Final, crea una categoría tipo "Recuperación de Evaluación" y selecciona qué evaluaciones recupera. Solo aplica si el alumno estaba suspenso en esa evaluación

**Desglose de nota**: haz clic en cualquier celda de nota para ver el desglose completo con la fórmula de cálculo.

### 4.2 Informes competenciales

Visualiza el grado de adquisición de cada elemento curricular:

| Informe | ¿Qué muestra? |
| - | - |
| **Inf. Criterios** | Grado de consecución de cada Criterio de Evaluación por alumno |
| **Inf. Competencias** | Nivel de cada Competencia Específica (media de sus criterios vinculados) |
| **Inf. Comp. Clave** | Aportación a cada Competencia Clave (CCL, STEM, CD, CPSAA...) |
| **Inf. Descriptores** | Grado de adquisición de cada Descriptor Operativo del Perfil de Salida |


**Filtro por periodo**: selecciona "Curso Completo", "1ª Evaluación", "2ª Evaluación" o "3ª Evaluación".

Los informes usan un código de color:

- 🟢 Verde: conseguido

- 🟡 Amarillo: en proceso

- 🔴 Rojo: no conseguido

- ⬜ Gris: no evaluado

### 4.3 Estadísticas de grupo

Gráficos visuales del rendimiento del grupo:

- **Distribución de notas**: histograma con la frecuencia de cada rango

- **Porcentaje de aprobados**: indicador con la relación numérica (ej. "80% (16/20)")

- **Medias por evaluación**: evolución de la nota media a lo largo del curso


## 5. El Diario de Clase

Accede desde el botón **Diario de Clase** en la barra superior.

- **Selector de clase**: elige el grupo

- **Selector de fecha**: navega entre días

- **Área de texto**: escribe observaciones, incidencias o el desarrollo de la sesión

- **Color de sesión**: asígnale un color para identificarla visualmente en el calendario

El Diario está sincronizado con el Calendario: lo que escribas aquí aparece en la sesión del calendario y viceversa.


## 6. Evaluación LOMLOE Puro

El modo **LOMLOE Puro** calcula la nota final como la media ponderada de las Competencias Específicas, en lugar de las categorías de tareas. Es el método más alineado con la normativa LOMLOE.

### Activar y configurar

1. En **Ajustes ⚙️ → Configuración del Curso**, selecciona el radio button **LOMLOE Puro (Media de Competencias Específicas)**

2. Ve a **Gestionar Currículo**, despliega "Competencias Específicas" y edita cada una:

   - Haz clic en el icono del lápiz ✏️

   - En el campo **Peso (%)** , asigna el porcentaje deseado (ej. CE1: 25%, CE2: 30%, CE3: 20%, CE4: 25%)

   - Haz clic en **Guardar Cambios**

### ¿Cómo se calcula?

```
Nota de cada CE = Media de las notas de los criterios vinculados a esa CE  
Nota Final = (CE1 × peso\_CE1 + CE2 × peso\_CE2 + ...) / Suma de pesos
```

Cada tarea calificada se vincula a uno o varios criterios de evaluación. El sistema:

1. Calcula la nota de cada criterio (media de las tareas que lo evalúan)

2. Calcula la nota de cada Competencia Específica (media de sus criterios)

3. Pondera las competencias según los pesos configurados

4. Obtiene la nota final de la evaluación


## 7. Exportación e impresión de informes

Desde **Cuaderno → Informes**:

1. Selecciona la clase, el tipo de informe y el periodo

2. Haz clic en el botón de exportación (📥)

3. Elige el formato deseado y los alumnos a incluir

4. Se generará un archivo descargable

También puedes exportar los informes para "Curso Completo", lo que genera un acta única con todos los criterios y competencias de todo el año (útil para la evaluación final).


## 8. Consejos y buenas prácticas

### Al inicio de curso

1. ✅ Configura todo en Ajustes **antes** de empezar a poner notas

2. ✅ Haz una copia de seguridad tras la configuración inicial

3. ✅ Importa el currículo completo desde CSV (usa IA generativa para crearlo)

4. ✅ Crea tus instrumentos de evaluación (rúbricas, escalas) antes de necesitarlos

### En el día a día

1. ✅ Añade las tareas calificables desde el Calendario (así quedan fechadas)

2. ✅ Usa el Diario de Clase para registrar incidencias (adaptaciones, faltas de material...)

3. ✅ Revisa los informes competenciales periódicamente para detectar desfases

### Al final de trimestre

1. ✅ Configura las recuperaciones antes de la evaluación

2. ✅ Exporta los informes para las actas

3. ✅ Descarga una copia de seguridad (.db)

4. ✅ Si empiezas un nuevo curso, usa "Iniciar Nuevo Curso" en vez de borrar manualmente


## 9. Resolución de problemas

### La aplicación se queda en blanco

Esto puede ocurrir cuando React pierde la hidratación del estado tras muchas operaciones seguidas.

**Solución**: haz clic en **Cuaderno → Informes**. Esto fuerza a la base de datos SQLite a regenerar el estado completo de la aplicación. Luego vuelve a Calificaciones.

### No veo mis datos al cambiar de ordenador

Los datos se almacenan en el navegador local. Para moverlos entre dispositivos:

1. En el ordenador origen: **Ajustes → Copia de Seguridad → Descargar Copia (.db)**

2. Transfiere el archivo `.db` al nuevo ordenador (USB, email, Drive...)

3. En el ordenador destino: **Ajustes → Copia de Seguridad → Cargar Copia (.db)**

### El calendario no muestra mis clases

Verifica:

1. Que has configurado el **Horario Semanal** en Ajustes

2. Que has creado **Unidades Didácticas** con sesiones asignadas

3. Que las fechas del curso y los periodos de evaluación están bien definidos

4. Que no has marcado todos los días como festivos

### Los criterios no se vinculan a las competencias al importar CSV

El sistema vincula los criterios a las competencias por **numeración**:

- El criterio `1.1` se vincula a la competencia con código `CEs 1`

- El criterio `3.2` se vincula a `CEs 3`

Asegúrate de que:

1. Las competencias específicas tienen el código en formato `CEs N` (ej. `CEs 1`, `CEs 2`)

2. Los criterios empiezan por el número de su competencia (ej. `1.1`, `1.2` para CE1)

3. Las competencias y los criterios están en el **mismo archivo CSV**

### No puedo eliminar una Competencia Específica

El sistema bloquea el borrado si hay criterios de evaluación vinculados a esa competencia. Elimina primero los criterios dependientes o reasígnelos a otra competencia.


## 📄 Licencia

[![](data:image/png;base64,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 "CC BY-NC 4.0")](http://creativecommons.org/licenses/by-nc/4.0/)[ ](http://creativecommons.org/licenses/by-nc/4.0/)

Esta aplicación es gratuita para uso educativo. Puedes compartirla y modificarla, pero no venderla. 
<p align="center">
  <a href="http://creativecommons.org/licenses/by-nc/4.0/"><img src="https://licensebuttons.net/l/by-nc/4.0/88x31.png" alt="CC BY-NC 4.0"></a>
</p>


