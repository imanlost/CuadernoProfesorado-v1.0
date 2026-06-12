# 📓 Cuaderno del Profesorado v1.0

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](http://creativecommons.org/licenses/by-nc/4.0/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://cuadernodocentev2.vercel.app/)
[![Tauri](https://img.shields.io/badge/Desktop-Tauri-FFC131?logo=tauri)](https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases)

**Aplicación web y de escritorio para la gestión académica docente con soberanía de datos y evaluación competencial LOMLOE.**

Desarrollada con React + Vite + TypeScript + SQLite (sql.js). Toda la información del alumnado permanece en local: en el navegador (IndexedDB), en un archivo `.db` de tu disco, o en la base de datos nativa de la versión de escritorio (Tauri). **Tus datos nunca abandonan tu dispositivo.**

---

## 🎯 ¿Por qué este Cuaderno?

A diferencia de las plataformas comerciales en la nube, este cuaderno:

- 🔒 **Garantiza tu soberanía de datos**: nada se envía a servidores externos. La base de datos SQLite vive en tu navegador u ordenador.
- 🧮 **Aplica la LOMLOE de verdad**: el motor de evaluación sigue la cascada curricular completa: Criterio → Competencia Específica → Descriptor Operativo → Perfil de Salida.
- 🆓 **Es gratuito y abierto**: sin suscripciones, sin límites de alumnado, sin publicidad. Licencia CC BY-NC 4.0.
- 🖥️ **Funciona en cualquier sitio**: navegador web, aplicación de escritorio (Windows, macOS, Linux) y Chromebooks.

---

## ✨ Características Principales

### 📅 Planificación y Calendario
- **Calendario académico** con vistas de mes, semana y día
- **Festivos y vacaciones** personalizables que el calendario respeta automáticamente
- **Horario semanal** configurable con recreos y franjas horarias
- **Unidades Didácticas (UD)** arrastrables con número de sesiones y vinculación a saberes básicos
- **Colocación automática** de sesiones en días lectivos, esquivando fines de semana y festivos
- **Sesiones coloreables** para identificar visualmente tipos de clase

### 🧮 Evaluación Competencial LOMLOE
- **Dos modos de cálculo de nota final**:
  - *Clásico*: media ponderada por categorías (exámenes, trabajos, actitud...)
  - *LOMLOE Puro*: media ponderada de Competencias Específicas con pesos configurables
- **Cascada curricular completa**: cada tarea se vincula a criterios de evaluación, que alimentan competencias específicas, que nutren descriptores operativos del Perfil de Salida
- **Ponderación personalizable**: pesos configurables para cada Competencia Específica (%), cada categoría de tareas y cada periodo de evaluación
- **Umbral de aprobado** configurable (por defecto 5 sobre 10)

### 📝 Instrumentos de Evaluación
- **Listas de Cotejo**: evaluación binaria (Sí/No) con pesos por ítem
- **Escalas de Valoración**: niveles numéricos personalizables (ej. 1-5)
- **Rúbricas**: matrices con niveles y descriptores textuales por criterio
- **Importación/exportación CSV** de instrumentos
- Todos los instrumentos normalizan automáticamente a escala 0-10

### 🔄 Sistema de Recuperaciones
- **Recuperación de tarea**: una tarea de recuperación sobrescribe automáticamente la nota de la tarea original suspendida
- **Recuperación de evaluación**: categorías tipo "Recuperación de Evaluación" que reemplazan la media del trimestre si el alumno estaba suspenso
- **Inyección en cascada**: la nota de recuperación se proyecta hacia abajo en todos los criterios de evaluación del periodo

### 📊 Informes y Estadísticas
- **Informes competenciales** por alumno y grupo:
  - Criterios de Evaluación
  - Competencias Específicas
  - Competencias Clave
  - Descriptores Operativos (Perfil de Salida)
- **Filtro por periodo**: 1ª, 2ª, 3ª Evaluación o Curso Completo
- **Estadísticas gráficas** del grupo (Recharts): distribución de notas, porcentaje de aprobados, medias
- **Exportación de informes** para actas de evaluación

### 👥 Gestión de Alumnado
- **Carga masiva** de alumnado: pega una columna de nombres desde Excel, Séneca o Raíces
- **Etiquetas ACNEAE**: anota necesidades educativas (RE, ACS, etc.) con contador por alumno
- **Vista de resumen** por alumno con todas sus calificaciones
- **Desglose de nota** clicable: muestra la fórmula matemática exacta de cada calificación

### 📚 Gestión Curricular
- **Importación CSV** del currículo LOMLOE con fusión inteligente de descriptores (evita duplicados)
- **Exportación CSV** para respaldo o edición externa
- **Gestor visual** de Competencias Clave, Descriptores Operativos, Competencias Específicas, Criterios de Evaluación y Saberes Básicos
- **Editor in-situ** de todos los elementos curriculares con vinculación cruzada

### 💾 Persistencia y Copias de Seguridad
- **Almacenamiento automático** en IndexedDB del navegador (cada 1.5 segundos)
- **Modo Archivo Local**: sincronización bidireccional con un archivo `.db` en tu disco (File System Access API)
- **Múltiples espacios de trabajo**: bases de datos independientes para distintos cursos o especialidades
- **Copia de seguridad**: descarga y restauración de la base de datos completa
- **Transición de curso**: botón "Nuevo Curso" que vacía alumnado y notas pero conserva currículo, instrumentos y configuración, avanzando las fechas un año

### 📖 Diario de Clase
- Registro diario por clase con notas de texto
- Sincronización bidireccional con el Calendario
- Colores por sesión para categorización visual

---

## 🚀 Instalación y Ejecución

### 🌐 Versión Web (Navegador)

**Opción A — Usar la versión desplegada (recomendado para la mayoría):**
Accede a **[https://cuadernodocentev2.vercel.app/](https://cuadernodocentev2.vercel.app/)** y empieza a trabajar. Tus datos se guardan automáticamente en el navegador.

**Opción B — Ejecutar en local:**
```bash
# Requisito: Node.js LTS (v18 o superior)
git clone https://github.com/imanlost/CuadernoProfesorado-v1.0.git
cd CuadernoProfesorado-v1.0
npm install
npm run dev
```
Abre `http://localhost:5173` en tu navegador (la terminal debe permanecer abierta).

### 🖥️ Versión de Escritorio (Windows, macOS, Linux)

Descarga el instalador desde la [página de releases](https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases):
- **Linux**: `.deb` (Debian/Ubuntu) o AppImage
- **Windows**: `.msi` o `.exe`
- **macOS**: `.dmg`

La versión de escritorio usa acceso nativo al sistema de archivos (no depende del navegador) y ofrece máxima privacidad.

### 💻 Chromebooks

Usa la [versión web desplegada](https://cuadernodocentev2.vercel.app/). Funciona perfectamente en el navegador Chrome de los Chromebooks de centros educativos.

---

## 🗺️ Flujo de Trabajo Recomendado

### 1. Primer arranque: Configuración Inicial

1. Abre **Ajustes ⚙️** (icono de engranaje)
2. **Configuración del Curso**: establece fechas de inicio/fin, periodos de evaluación, festivos y umbral de aprobado
3. **Cursos y Materias**: crea tus cursos (ej. "3º ESO - Biología y Geología")
4. **Clases y Alumnado**: crea tus grupos y carga el alumnado
5. **Horario Semanal**: configura las franjas horarias y asigna tus clases
6. **Gestionar Currículo**: importa el currículo LOMLOE desde CSV
7. **Planificación UD**: crea tus Unidades Didácticas con sus sesiones y saberes
8. **Instrumentos Evaluación**: crea tus rúbricas, escalas y listas de cotejo

### 2. Día a día

1. **Calendario**: consulta tu planificación, añade tareas calificables desde el día correspondiente
2. **Cuaderno → Calificaciones**: introduce notas en las tareas creadas
3. **Diario de Clase**: registra incidencias, observaciones o el desarrollo de la sesión

### 3. Final de evaluación

1. **Cuaderno → Informes**: revisa los informes competenciales de tu alumnado
2. **Cuaderno → Estadísticas**: analiza los gráficos de rendimiento del grupo
3. **Ajustes → Copia de Seguridad**: descarga una copia de seguridad de tu base de datos

---

## 🧠 Modo LOMLOE Puro

El cuaderno ofrece dos modos de cálculo para la nota final:

| Modo | Cálculo | Cuándo usarlo |
|---|---|---|
| **Clásico** | Media ponderada de categorías de tareas (exámenes 60%, trabajos 30%, actitud 10%) | Evaluación tradicional por instrumentos |
| **LOMLOE Puro** | Media ponderada de Competencias Específicas (CE1 25%, CE2 30%, CE3 20%, CE4 25%) | Evaluación competencial estricta |

Para activar el modo LOMLOE Puro:
1. Ve a **Ajustes ⚙️** y activa el radio button "LOMLOE Puro"
2. En **Gestionar Currículo**, edita cada Competencia Específica y asígnale un peso (%)
3. Al calificar tareas, vincula cada una a sus criterios de evaluación

El sistema calcula automáticamente la nota de cada competencia como la media de los criterios vinculados, y la nota final como la media ponderada de las competencias.

---

## 📋 Formato del CSV Curricular

Para importar el currículo, prepara un archivo CSV con esta estructura:

```csv
type,id,code,description,links
KC,kc-ccl,"CCL","Competencia en comunicación lingüística"
OD,od-cc1-eso,"CCL1","Se expresa de forma oral, escrita...",kc-ccl
SC,sc-bg3-1,"CEs 1","Interpretar y transmitir información...",od-cc1-eso
EC,ec-bg3-1.1,"1.1","Analizar conceptos y procesos biológicos..."
SB,sb-bg3-1,"A.1","La célula como unidad estructural y funcional..."
```

| Columna | Descripción |
|---|---|
| `type` | `KC` (Competencia Clave), `OD` (Descriptor Operativo), `SC` (Competencia Específica), `EC` (Criterio de Evaluación), `SB` (Saber Básico) |
| `id` | Identificador único (ej. `sc-bg3-1`) |
| `code` | Código oficial (ej. `CEs 1`, `1.1`, `CCL1`) |
| `description` | Enunciado completo del elemento curricular |
| `links` | IDs de los elementos padre (OD → KC, SC → OD, EC → SC). El criterio se vincula automáticamente a la CE por su numeración |

---

## 🛡️ Soberanía de Datos y RGPD

- **Todos los datos se almacenan en local**: IndexedDB del navegador, archivo `.db` en disco, o base de datos nativa en la versión Tauri.
- **No hay servidor backend**: la aplicación es 100% cliente (React + SQLite en WASM).
- **No se envían datos a terceros**: ni analíticas, ni telemetría, ni cookies de seguimiento.
- **Cumplimiento RGPD**: al no tratar datos en servidores externos, minimizas los riesgos legales.

---

## 🔧 Tecnologías

| Tecnología | Uso |
|---|---|
| [React 18](https://react.dev/) | Interfaz de usuario |
| [Vite](https://vitejs.dev/) | Bundler y servidor de desarrollo |
| [TypeScript](https://www.typescriptlang.org/) | Lenguaje |
| [sql.js](https://sql.js.org/) | SQLite compilado a WebAssembly |
| [Tauri 2](https://tauri.app/) | Empaquetado como aplicación de escritorio |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos |
| [Recharts](https://recharts.org/) | Gráficos de estadísticas |
| [hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Drag & drop de Unidades Didácticas |

---

## 📚 Documentación

- 📖 **[Manual de Usuario (Web)](MANUAL_USUARIO_WEB.md)** — Guía completa para la versión de navegador
- 🖥️ **[Manual de Usuario (Escritorio)](MANUAL_USUARIO_ESCRITORIO.md)** — Guía para la versión Tauri (.deb/.msi/.dmg)
- 📋 **[CHANGELOG.md](CHANGELOG.md)** — Historial de cambios y mejoras

---

## 📄 Licencia

[Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](http://creativecommons.org/licenses/by-nc/4.0/)

Esto significa que puedes:
- ✅ Usar la aplicación gratuitamente con fines educativos
- ✅ Compartirla con compañeros docentes
- ✅ Modificar el código para adaptarlo a tus necesidades
- ❌ Usarla con fines comerciales sin permiso

---

## 🤝 Contribuciones

¿Eres docente y has detectado un error o tienes una idea de mejora? Abre un [issue](https://github.com/imanlost/CuadernoProfesorado-v1.0/issues) o envía un pull request.

---

**Hecho por un docente, para docentes.**
