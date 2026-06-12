# 🖥️ Manual de Usuario — Cuaderno del Profesorado (Escritorio)

Guía para la versión de escritorio del Cuaderno del Profesorado, distribuida como aplicación nativa para **Windows**, **macOS** y **Linux** mediante Tauri.

---

## Índice

1. [Instalación](#1-instalación)
   - [1.1 Linux (.deb)](#11-linux-deb)
   - [1.2 Windows (.msi / .exe)](#12-windows-msi--exe)
   - [1.3 macOS (.dmg)](#13-macos-dmg)
2. [Diferencias con la versión web](#2-diferencias-con-la-versión-web)
3. [Primer arranque y configuración](#3-primer-arranque-y-configuración)
4. [Dónde se guardan tus datos](#4-dónde-se-guardan-tus-datos)
5. [Copias de seguridad en escritorio](#5-copias-de-seguridad-en-escritorio)
6. [Actualización de la aplicación](#6-actualización-de-la-aplicación)
7. [Uso diario (mismas funcionalidades que la web)](#7-uso-diario)
8. [Resolución de problemas](#8-resolución-de-problemas)

---

## 1. Instalación

### 1.1 Linux (.deb)

Para distribuciones basadas en Debian/Ubuntu (Ubuntu, Linux Mint, Pop!_OS, etc.):

```bash
# Descarga el archivo .deb desde la página de releases
# https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases

# Instala con el gestor de paquetes
sudo dpkg -i cuaderno-profesorado_*.deb

# Si hay dependencias faltantes
sudo apt-get install -f
```

La aplicación se instalará en el menú de aplicaciones como **Cuaderno Profesorado**.

**AppImage (todas las distribuciones):**
```bash
chmod +x cuaderno-profesorado_*.AppImage
./cuaderno-profesorado_*.AppImage
```

### 1.2 Windows (.msi / .exe)

1. Descarga el instalador `.msi` o `.exe` desde la [página de releases](https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases)
2. Ejecuta el instalador (doble clic)
3. Windows SmartScreen puede mostrar una advertencia por ser una aplicación no firmada. Haz clic en **Más información → Ejecutar de todas formas**
4. Sigue el asistente de instalación

La aplicación aparecerá en el menú Inicio como **Cuaderno Profesorado**.

### 1.3 macOS (.dmg)

1. Descarga el archivo `.dmg` desde la [página de releases](https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases)
2. Abre el `.dmg` y arrastra la aplicación a la carpeta `Applications`
3. La primera vez que la abras, haz clic derecho → **Abrir** (para evitar el bloqueo de Gatekeeper)
4. Confirma en el diálogo de seguridad

---

## 2. Diferencias con la versión web

La versión de escritorio es **idéntica en funcionalidades** a la versión web. Las únicas diferencias son:

| Característica | Versión Web | Versión Escritorio |
|---|---|---|
| **Almacenamiento** | IndexedDB del navegador | Archivo `.db` en el sistema de archivos |
| **Acceso a archivos** | File System Access API (requiere permisos) | Acceso nativo directo |
| **Instalación** | No requiere (navegador) | Instalador .deb/.msi/.dmg |
| **Actualizaciones** | Automáticas al recargar | Descargar nueva versión manualmente |
| **Conexión a Internet** | Necesaria para cargar la app | No necesaria (la app es local) |
| **Persistencia** | Depende del navegador (riesgo al borrar caché) | Archivo físico en disco |
| **Varios cursos** | Entornos locales (IndexedDB) | Archivos `.db` independientes |

**Ventajas de la versión de escritorio:**
- ✅ Tus datos están en un archivo físico que tú controlas
- ✅ No dependes del navegador ni de su caché
- ✅ Funciona sin conexión a Internet
- ✅ Acceso directo al sistema de archivos
- ✅ Mayor privacidad (sin cookies, sin historial)

---

## 3. Primer arranque y configuración

Al abrir la aplicación por primera vez:

1. Se crea automáticamente una base de datos SQLite en la carpeta de datos de la aplicación
2. Verás la interfaz con datos de demostración (puedes empezar a trabajar directamente o limpiarlos)
3. Sigue el mismo flujo de configuración descrito en el [Manual de Usuario Web](MANUAL_USUARIO_WEB.md#2-configuración-inicial-ajustes)

> 💡 **Consejo para docentes con varias materias**: Crea un archivo `.db` independiente para cada asignatura. Así mantienes los datos separados y evitas confusiones.

---

## 4. Dónde se guardan tus datos

### Linux
```
~/.local/share/com.cuaderno-profesorado.app/
```

### Windows
```
C:\Users\<TU_USUARIO>\AppData\Roaming\com.cuaderno-profesorado.app\
```

### macOS
```
~/Library/Application Support/com.cuaderno-profesorado.app/
```

Dentro de esa carpeta encontrarás:
```
cuaderno-profesorado/
├── cuaderno.db          ← Base de datos principal
└── ...
```

Puedes copiar este archivo `.db` para hacer copias de seguridad manuales o transferirlo a otro ordenador.

> ⚠️ No modifiques el archivo `.db` manualmente con otras herramientas mientras la aplicación está abierta. Podrías corromper los datos.

---

## 5. Copias de seguridad en escritorio

En la versión de escritorio tienes **dos niveles** de copia de seguridad:

### Nivel 1: Desde la aplicación (recomendado)

Ve a **Ajustes ⚙️ → Copia de Seguridad**:
- **Descargar Copia (.db)**: guarda una copia de tu base de datos donde quieras
- **Cargar Copia (.db)**: restaura una copia anterior

### Nivel 2: Copia manual del archivo

Simplemente copia el archivo `cuaderno.db` de la [carpeta de datos](#4-dónde-se-guardan-tus-datos) a una ubicación segura (USB, Drive, Dropbox...).

### Múltiples cursos (archivos independientes)

Puedes gestionar varios archivos `.db` para separar cursos académicos:

1. En Ajustes → Copia de Seguridad, usa **Iniciar Nuevo Curso** (conserva currículo, vacía alumnado y notas)
2. O bien, guarda el `.db` actual con otro nombre y empieza desde cero

---

## 6. Actualización de la aplicación

La versión de escritorio **no se actualiza automáticamente**. Para actualizar:

1. Visita la [página de releases](https://github.com/imanlost/CuadernoProfesorado-v0.1.0/releases)
2. Descarga la nueva versión para tu sistema operativo
3. Instálala normalmente (sobrescribirá la versión anterior)

**Tus datos no se pierden** al actualizar, ya que la base de datos está en una carpeta separada del programa.

> 💡 **Consejo**: Antes de actualizar, haz una copia de seguridad de tu base de datos por precaución.

---

## 7. Uso diario

A partir de aquí, el funcionamiento es **exactamente igual** que la versión web. Consulta el [Manual de Usuario Web](MANUAL_USUARIO_WEB.md) para:

- [Configuración inicial](MANUAL_USUARIO_WEB.md#2-configuración-inicial-ajustes)
- [Gestión del Currículo](MANUAL_USUARIO_WEB.md#25-gestionar-currículo)
- [Calendario y planificación](MANUAL_USUARIO_WEB.md#3-el-calendario)
- [Calificaciones y evaluación](MANUAL_USUARIO_WEB.md#4-el-cuaderno-de-notas)
- [Informes competenciales](MANUAL_USUARIO_WEB.md#42-informes-competenciales)
- [Modo LOMLOE Puro](MANUAL_USUARIO_WEB.md#6-evaluación-lomloe-puro)
- [Instrumentos de evaluación](MANUAL_USUARIO_WEB.md#27-instrumentos-de-evaluación)
- [Diario de Clase](MANUAL_USUARIO_WEB.md#5-el-diario-de-clase)

---

## 8. Resolución de problemas

### La aplicación no abre en Linux

```bash
# Verifica que tienes las dependencias de WebKit
sudo apt-get install libwebkit2gtk-4.1-0 libjavascriptcoregtk-4.1-0

# Si usas Wayland, puede que necesites
export WEBKIT_DISABLE_COMPOSITING_MODE=1
```

### Windows SmartScreen bloquea la aplicación

Es normal: la aplicación no está firmada con un certificado de Microsoft (cuestan cientos de euros al año). Haz clic en **Más información → Ejecutar de todas formas**.

### macOS dice "aplicación dañada"

No está dañada; es Gatekeeper bloqueando aplicaciones no notarizadas. Solución:
```bash
# En Terminal, después de mover la app a Applications:
xattr -cr /Applications/Cuaderno\ Profesorado.app
```

### La aplicación se ve "rara" o con la interfaz descuadrada

La versión de escritorio usa WebKit (Linux/macOS) o WebView2 (Windows) para renderizar. Si tienes una versión antigua, la interfaz puede no mostrarse correctamente:
- **Windows**: asegúrate de tener Microsoft Edge WebView2 instalado
- **Linux**: actualiza `libwebkit2gtk` a la versión más reciente

### He perdido mis datos

1. Revisa la [carpeta de datos](#4-dónde-se-guardan-tus-datos). El archivo `.db` debería seguir allí
2. Si hiciste copia de seguridad, restáurala desde Ajustes → Copia de Seguridad → Cargar Copia
3. Si no tienes copia, lamentablemente los datos se pierden al desinstalar. **Haz copias de seguridad periódicas**

---

## 📄 Licencia

[CC BY-NC 4.0](http://creativecommons.org/licenses/by-nc/4.0/) — Uso educativo no comercial.

---

*¿Dudas, sugerencias o errores? Abre un issue en [GitHub](https://github.com/imanlost/CuadernoProfesorado-v1.0/issues).*
