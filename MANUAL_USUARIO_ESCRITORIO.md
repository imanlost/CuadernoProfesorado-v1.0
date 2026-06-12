# 🖥️ Manual de Usuario — Cuaderno del Profesorado (Escritorio)

<p align="center">
  <img src="https://raw.githubusercontent.com/imanlost/CuadernoProfesorado-v1.0/main/public/cuadernoprofesor.svg" alt="Cuaderno Profesorado" width="200">
</p>

Guía completa para la versión de escritorio del Cuaderno del Profesorado, disponible para **Windows**, **macOS** y **Linux**.

<p align="center">
  <a href="http://creativecommons.org/licenses/by-nc/4.0/"><img src="https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg" alt="License: CC BY-NC 4.0"></a>
</p>

---

## Índice

1. [Instalación](#1-instalación)
   - [1.1 Linux](#11-linux)
   - [1.2 Windows](#12-windows)
   - [1.3 macOS](#13-macos)
2. [Primer arranque y configuración](#2-primer-arranque-y-configuración)
3. [Dónde se guardan tus datos](#3-dónde-se-guardan-tus-datos)
4. [La pantalla principal](#4-la-pantalla-principal)
5. [Configuración inicial (Ajustes)](#5-configuración-inicial-ajustes)
6. [El Calendario y la planificación](#6-el-calendario-y-la-planificación)
7. [El Cuaderno de Notas](#7-el-cuaderno-de-notas)
8. [El Diario de Clase](#8-el-diario-de-clase)
9. [Evaluación LOMLOE Puro](#9-evaluación-lomloe-puro)
10. [Copias de seguridad](#10-copias-de-seguridad)
11. [Actualizar la aplicación](#11-actualizar-la-aplicación)
12. [Resolución de problemas](#12-resolución-de-problemas)

---

## 1. Instalación

### 1.1 Linux

Tienes **dos opciones** para instalar en Linux:

#### Archivo .deb (recomendado para Ubuntu, Debian, Linux Mint)

Este archivo instala la aplicación en el sistema, como cualquier otro programa. Aparecerá en el menú de aplicaciones y podrás anclarla a la barra de tareas.

```bash
# Descarga el .deb desde:
# https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases

sudo dpkg -i cuaderno-profesorado_*.deb
sudo apt-get install -f    # solo si faltan dependencias
```

#### Archivo AppImage (cualquier distribución)

El AppImage **no se instala**: es un único archivo ejecutable que contiene todo lo necesario. Ventajas:
- ✅ No necesitas permisos de administrador (sin `sudo`)
- ✅ Funciona en cualquier distribución (Fedora, Arch, openSUSE...)
- ✅ Lo llevas en un USB y lo ejecutas en cualquier ordenador con Linux
- ✅ No modifica el sistema: borras el archivo y desaparece por completo

```bash
chmod +x cuaderno-profesorado_*.AppImage
./cuaderno-profesorado_*.AppImage
```

### 1.2 Windows

Tienes **dos tipos de instalador**. La aplicación funciona igual en ambos, la diferencia es **dónde se instala**:

| Característica | .exe | .msi |
|---|---|---|
| **Dónde se instala** | En tu carpeta personal (`AppData`) | En `C:\Archivos de programa` |
| **¿Necesitas ser administrador?** | ❌ No | ✅ Sí |
| **¿Quién puede usarla?** | Solo tu usuario | Todos los usuarios del equipo |
| **Recomendado para...** | Tu ordenador personal | Ordenador compartido (departamento, sala de profesores) |

En resumen:
- Si el ordenador es **solo tuyo**, el `.exe` es más sencillo (no pide permisos de administrador)
- Si el ordenador lo usan **varios profesores**, el `.msi` instala la aplicación para todos

> ⚠️ Windows puede mostrar un aviso azul de "Windows protegió tu equipo". Esto es normal: nuestro instalador no está firmado digitalmente (los certificados cuestan cientos de euros al año). Haz clic en **"Más información"** y luego en **"Ejecutar de todas formas"**. La aplicación es segura.

### 1.3 macOS

Descarga el archivo `.dmg` y arrastra la aplicación a la carpeta `Aplicaciones`.

> ⚠️ **Aviso importante sobre Gatekeeper**: Apple exige que los desarrolladores paguen 99 USD al año por una "firma de desarrollador" que certifica las aplicaciones. Como este es un proyecto gratuito y sin ánimo de lucro, **no disponemos de esa firma**. Por eso, al abrir la aplicación, macOS te dirá que "no se puede abrir porque el desarrollador no está verificado".

Esto **no significa que la aplicación sea peligrosa**. Solo indica que Apple no ha cobrado por revisarla. Para abrirla:

1. Ve a la carpeta `Aplicaciones` en el Finder
2. Haz **clic derecho** (o Control+clic) sobre "Cuaderno Profesorado"
3. Selecciona **"Abrir"** en el menú
4. En el aviso que aparece, vuelve a hacer clic en **"Abrir"**

Solo necesitas hacer esto la primera vez. Después se abrirá normalmente con doble clic.

---

## 2. Primer arranque y configuración

Al abrir la aplicación por primera vez, verás una pantalla con datos de ejemplo para que explores. Puedes trabajar directamente sobre estos datos o borrarlos.

Te recomendamos seguir este orden para dejarlo todo listo:

1. Abre **Ajustes** (icono ⚙️ arriba a la derecha)
2. Fechas del curso y periodos de evaluación
3. Tus cursos y materias
4. Clases y alumnado
5. Horario semanal
6. Importar el currículo
7. Unidades Didácticas
8. Instrumentos de evaluación

Cada uno de estos pasos se explica en detalle en la [sección 5](#5-configuración-inicial-ajustes).

---

## 3. Dónde se guardan tus datos

A diferencia de la versión web (que guarda los datos dentro del navegador), en la versión de escritorio tus datos están en **un archivo real en tu disco duro**, como un Word o un PDF.

Puedes localizarlo aquí:

| Sistema | Ruta |
|---|---|
| **Linux** | `~/.local/share/com.cuaderno-profesorado.app/` |
| **Windows** | `C:\Users\TU_USUARIO\AppData\Roaming\com.cuaderno-profesorado.app\` |
| **macOS** | `~/Library/Application Support/com.cuaderno-profesorado.app/` |

El archivo importante se llama `cuaderno.db`. Puedes copiarlo para:
- Hacer una copia de seguridad en un USB
- Llevártelo a otro ordenador
- Pasárselo a un compañero

> ⚠️ No borres ni cambies el archivo mientras la aplicación está abierta. Ciérrala antes de manipularlo.

---

## 4. La pantalla principal

Al abrir el programa ves esto:

```
┌──────────────────────────────────────────────────┐
│  Cuaderno Docente   [Calendario] [Cuaderno ▼] [Diario]  ⚙️ │
├──────────────────────────────────────────────────┤
│                                                    │
│              Zona de trabajo                       │
│   (cambia según lo que pulses en la barra)         │
│                                                    │
└──────────────────────────────────────────────────┘
```

- **Calendario**: donde planificas tus clases (es lo que ves al abrir)
- **Cuaderno ▼**: donde pones notas y ves informes (tiene 3 apartados: Calificaciones, Informes y Estadísticas)
- **Diario de Clase**: donde escribes anotaciones de cada día
- **⚙️**: el botón de Ajustes, donde configuras todo

---

## 5. Configuración inicial (Ajustes)

Pulsa en el icono ⚙️ para abrir el panel de Ajustes. En la parte izquierda verás las secciones:

### 5.1 Configuración del Curso

Lo primero que debes rellenar al empezar el año.

- **Fechas del Curso**: día que empiezas y día que acabas
- **Evaluaciones**: define 1ª, 2ª y 3ª evaluación con sus fechas. Puedes añadir más con el botón **+ Añadir Periodo**
- **Nota de aprobado**: la nota mínima para aprobar (normalmente 5)
- **Peso de cada evaluación**: cuánto vale cada trimestre para la nota final (ej. 30% + 30% + 40%)
- **Modo de evaluación**:
  - *Clásico*: haces media de exámenes, trabajos, actitud...
  - *LOMLOE Puro*: haces media de las Competencias Específicas (explicado en la [sección 9](#9-evaluación-lomloe-puro))
- **Vacaciones y festivos**: días sin clase. El calendario no pondrá clase esos días

### 5.2 Cursos y Materias

Aquí pones las asignaturas que das:

1. Elige el nivel (1º ESO, 2º ESO...)
2. Escribe el nombre de la materia (ej. "Biología y Geología")
3. Pulsa **Añadir Curso**

También puedes añadir "Otras Ocupaciones" (guardias, reuniones...) que saldrán en tu horario pero no llevan notas.

### 5.3 Clases y Alumnado

Creas tus grupos y metes a los alumnos.

**Crear una clase:**
1. Pulsa **Añadir Clase**
2. Ponle un nombre (ej. "Biología y Geología 3ºA")
3. Elige de qué curso es

**Meter alumnos:**
- **Uno a uno**: escribe los nombres en la tabla
- **Todos de golpe**: copia una lista de nombres de tu Excel, de Séneca o de Raíces, pulsa **Añadir Alumnado en Lote** y pégalos (un nombre por línea)

**Alumnos con necesidades educativas (ACNEAE):**
Pulsa el botón **ACNEAE** junto a un alumno para anotar sus necesidades (TDAH, adaptación, refuerzo...). El número indica cuántas anotaciones tiene.

### 5.4 Horario Semanal

Indica en qué días y horas das cada clase:

1. Define las horas de tu centro (ej. 8:30-9:25, 9:25-10:20...)
2. Arrastra cada clase a su casilla en la tabla

Cuando pongas sesiones en el calendario, se colocarán automáticamente en los días que tienes clase con ese grupo.

### 5.5 Gestionar Currículo

Esta sección es muy importante: aquí metes los elementos curriculares de la LOMLOE.

**Importar desde CSV (recomendado):**
1. Elige el curso en el desplegable (ej. "3º ESO - Biología y Geología")
2. Prepara un archivo CSV con tus elementos curriculares
3. Pulsa "Seleccionar archivo" y cárgalo
4. Confirma la importación

**¿Qué contiene el gestor curricular?**

- **Competencias Clave**: las 8 comunes de la etapa (CCL, STEM, CD...). Vienen de serie
- **Competencias Específicas**: las de tu materia. Puedes cambiar el código, la descripción y el **peso (%)** para el modo LOMLOE Puro
- **Criterios de Evaluación**: vinculados a cada Competencia Específica
- **Saberes Básicos**: los contenidos de tu materia

**Formato del CSV:**

```
type,id,code,description,links
KC,kc-ccl,"CCL","Competencia en comunicación lingüística"
OD,od-cc1-eso,"CCL1","Se expresa de forma oral...",kc-ccl
SC,sc-bg3-1,"CEs 1","Interpretar y transmitir...",od-cc1-eso
EC,ec-bg3-1.1,"1.1","Analizar conceptos...",sc-bg3-1
SB,sb-bg3-1,"A.1","La célula como unidad...",
```

| Columna | Significado |
|---|---|
| `type` | `KC`=Competencia Clave, `OD`=Descriptor, `SC`=Competencia Específica, `EC`=Criterio, `SB`=Saber |
| `id` | Identificador único (inventa uno para cada fila) |
| `code` | Código oficial (ej. "CEs 1") |
| `description` | El texto completo del elemento curricular |
| `links` | ID del elemento "padre" al que se conecta (ej. un criterio se conecta a su competencia) |

> ⚠️ El botón rojo "Eliminar Currículo" borra TODO. Úsalo solo si vas a volver a importar desde cero.

### 5.6 Unidades Didácticas

Creas tus temas y los programas en el calendario:

1. Pulsa **+ Nueva Unidad Didáctica**
2. Ponle nombre (ej. "Tema 1: La Célula")
3. Indica cuántas sesiones ocupa
4. Elige qué saberes y criterios trabaja

Las unidades se pueden arrastrar para cambiar el orden.

### 5.7 Instrumentos de Evaluación

Plantillas para poner notas. Hay tres tipos:

**Lista de Cotejo (Sí/No):**
Una lista de aspectos que el alumno cumple o no. Ideal para trabajos, exposiciones, prácticas de laboratorio. Ejemplo: "Entrega a tiempo", "Incluye portada", "Cita las fuentes".

**Escala de Valoración (números):**
Niveles del 1 al 5 (o los que quieras) con etiquetas. Ejemplo: 1=Insuficiente, 2=Suficiente, 3=Bien, 4=Notable, 5=Excelente.

**Rúbrica (tabla con descripciones):**
Una tabla donde cada nivel tiene un texto que describe exactamente qué debe cumplir el alumno. La más completa para evaluar trabajos complejos.

---

## 6. El Calendario y la planificación

El Calendario es la pantalla principal y tiene tres vistas:

- **Mes**: ves todos los días del mes con las sesiones programadas
- **Semana**: ves las horas de cada día con tus clases
- **Día**: ves una sola jornada en detalle

Usa los botones **◀ ▶** para moverte entre meses, o pulsa **Hoy** para volver a la fecha actual.

Desde el calendario puedes:
- **Añadir una tarea para nota**: pulsa en cualquier día y crea una tarea calificable
- **Ver una sesión**: pulsa sobre una sesión existente para editarla, cambiarle el color o poner anotaciones

Las sesiones de tus Unidades Didácticas se colocan solas en días de clase (L-V), saltando fines de semana y festivos.

---

## 7. El Cuaderno de Notas

Pulsa **Cuaderno ▼** en la barra superior. Tiene tres apartados:

### 7.1 Calificaciones

Aquí pones las notas. Funciona así:

```
[Biología y Geología 3ºA ▼]     ← Eliges la clase

[1ª Evaluación] [2ª Evaluación] [3ª Evaluación] [Final]

┌────────────┬──────────┬──────────┬──────────┬───────────┐
│  ALUMNO/A  │  1ª EVAL │  2ª EVAL │  3ª EVAL │ NOTA FINAL│
├────────────┼──────────┼──────────┼──────────┼───────────┤
│ Elena G.   │    7,5   │    8,2   │    6,9   │    7,5    │
│ Marcos R.  │    5,4   │    4,8   │    6,1   │    5,4    │
└────────────┴──────────┴──────────┴──────────┴───────────┘
```

**Categorías de notas:**
Agrupan tus tareas por tipo. Por ejemplo:
- "Exámenes" (peso 60%)
- "Trabajos" (peso 30%)
- "Actitud" (peso 10%)

Creas categorías con el botón ➕ y les das un peso. Dentro de cada categoría añades tareas.

**Tipos de tarea:**
- **Nota directa**: escribes un número del 0 al 10
- **Con instrumento**: usas una Lista de Cotejo, Escala o Rúbrica que ya tengas creada

**Recuperaciones:**
- **De una tarea**: creas una tarea de recuperación y le dices qué tarea sustituye. Si el alumno saca mejor nota, reemplaza la antigua
- **De una evaluación entera**: creas una categoría tipo "Recuperación" y eliges qué evaluación(es) recupera. Si el alumno aprueba la recuperación, le sube la nota de aquella evaluación

**Ver desglose de nota:**
Pulsa sobre cualquier nota numérica para ver cómo se ha calculado (la fórmula paso a paso).

### 7.2 Informes

Muestra el nivel del alumnado en cada elemento curricular:

- **Inf. Criterios**: qué criterios de evaluación domina cada alumno
- **Inf. Competencias**: nivel en cada Competencia Específica
- **Inf. Comp. Clave**: aportación a cada Competencia Clave (CCL, STEM, CD...)
- **Inf. Descriptores**: grado de adquisición de cada Descriptor del Perfil de Salida

Puedes filtrar por evaluación (1ª, 2ª, 3ª o Curso Completo).

Los colores indican:
- 🟢 Verde: conseguido
- 🟡 Amarillo: en proceso
- 🔴 Rojo: no conseguido
- ⬜ Gris: sin notas todavía

### 7.3 Estadísticas

Gráficos del rendimiento del grupo:
- Distribución de notas (cuántos sacan sobresaliente, notable, bien...)
- Porcentaje de aprobados (ej. "80% (16 de 20)")
- Media de la clase en cada evaluación

---

## 8. El Diario de Clase

Pulsa **Diario de Clase** en la barra superior. Es un bloc de notas diario:

1. Elige la clase
2. Elige la fecha
3. Escribe lo que pasó en clase: incidencias, si terminaste el temario, faltas de material...

Lo que escribas aquí también se ve en el Calendario (y viceversa). Puedes poner un color a cada sesión para identificar tipos de clase de un vistazo.

---

## 9. Evaluación LOMLOE Puro

El modo LOMLOE Puro calcula la nota a partir de las Competencias Específicas, que es lo que pide la ley.

### Cómo activarlo

1. Ve a **Ajustes ⚙️ → Configuración del Curso**
2. En "Modo de Nota Final", marca **LOMLOE Puro**
3. Ve a **Gestionar Currículo → Competencias Específicas**
4. Para cada competencia, pulsa el lápiz ✏️ y ponle un **peso (%)**
   - Ejemplo: CE1=25%, CE2=30%, CE3=20%, CE4=25%
5. Pulsa Guardar

### Cómo se calcula

1. Cada tarea que pones se vincula a unos criterios de evaluación
2. La nota de cada criterio sale de la media de las tareas que lo evalúan
3. La nota de cada Competencia Específica sale de la media de sus criterios
4. La nota final es la media de las competencias, cada una con el peso que le pusiste

```
Nota final = (CE1 × 25% + CE2 × 30% + CE3 × 20% + CE4 × 25%) / 100
```

### Consejo

Si vas a usar LOMLOE Puro, no te olvides de vincular cada tarea a los criterios de evaluación que correspondan. Si una tarea no tiene criterios vinculados, no cuenta para las competencias.

---

## 10. Copias de seguridad

Tus datos están en un archivo físico (ver [sección 3](#3-dónde-se-guardan-tus-datos)), así que hacer una copia de seguridad es muy fácil:

### Desde la aplicación

En **Ajustes ⚙️ → Copia de Seguridad:**

- **Descargar Copia (.db)**: te guarda una copia donde tú elijas (USB, carpeta de Drive, escritorio...)
- **Cargar Copia (.db)**: restauras una copia anterior

### A mano

Simplemente ve a la carpeta donde se guardan los datos ([ver sección 3](#3-dónde-se-guardan-tus-datos)), copia el archivo `cuaderno.db` y pégalo donde quieras.

### Empezar un curso nuevo

El botón **Iniciar Nuevo Curso** vacía los alumnos, las notas y el diario, pero conserva:
- La configuración (fechas, horarios, periodos)
- El currículo
- Los instrumentos de evaluación
- Las Unidades Didácticas

Las fechas avanzan un año automáticamente. Así no tienes que volver a configurarlo todo.

---

## 11. Actualizar la aplicación

La aplicación no se actualiza sola. Cuando salga una versión nueva:

1. Visita [github.com/imanlost/CuadernoProfesorado-v0.1.0/releases](https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases)
2. Descarga el instalador nuevo para tu sistema
3. Instálalo normalmente (se pone encima de la versión anterior)

Tus datos no se pierden al actualizar, porque están en una carpeta distinta al programa. Aun así, por precaución, haz una copia de seguridad antes de actualizar.

---

## 12. Resolución de problemas

### La aplicación no abre en Linux

Puede faltar una pieza del sistema llamada WebKit. Instálala:

```bash
sudo apt-get install libwebkit2gtk-4.1-0
```

### Windows dice "Windows protegió tu equipo"

Es normal. Nuestro programa no está firmado con Microsoft (cuesta dinero). Pulsa **"Más información"** y luego **"Ejecutar de todas formas"**.

### macOS dice que la aplicación está dañada o no se puede abrir

No está dañada. Apple bloquea las aplicaciones que no pagan su cuota anual de desarrollador (99 USD/año). Solución:

1. Abre la carpeta `Aplicaciones` en el Finder
2. Haz clic derecho sobre "Cuaderno Profesorado"
3. Pulsa "Abrir"
4. En el aviso, pulsa "Abrir" otra vez

Solo necesitas hacer esto la primera vez.

### He cambiado de ordenador y no veo mis datos

Copia el archivo `cuaderno.db` del ordenador antiguo al nuevo (ver [sección 3](#3-dónde-se-guardan-tus-datos)). Luego usa **Ajustes → Copia de Seguridad → Cargar Copia** para restaurarlo.

### El calendario no pone clases en los días que espero

Comprueba:
1. Que has rellenado el Horario Semanal en Ajustes
2. Que tienes Unidades Didácticas creadas con sesiones
3. Que las fechas de curso y evaluaciones están bien puestas
4. Que no has marcado todos los días como festivos

### He perdido mis datos

Si no tienes copia de seguridad, revisa si el archivo `cuaderno.db` sigue en la carpeta de datos ([sección 3](#3-dónde-se-guardan-tus-datos)). Si al desinstalar el programa elegiste "eliminar datos", lamentablemente se habrán borrado. **Haz copias de seguridad con regularidad.**

---

## 📄 Licencia

<p align="center">
  <a href="http://creativecommons.org/licenses/by-nc/4.0/">
    <img src="https://licensebuttons.net/l/by-nc/4.0/88x31.png" alt="CC BY-NC 4.0">
  </a>
</p>

Esta aplicación es gratuita para uso educativo. Puedes compartirla y modificarla, pero no venderla. Más información: [Creative Commons BY-NC 4.0](http://creativecommons.org/licenses/by-nc/4.0/).

---

*¿Tienes dudas o sugerencias? Abre una incidencia en [GitHub](https://github.com/imanlost/CuadernoProfesorado-v1.0/issues).*

*Hecho por un docente, para docentes.*
