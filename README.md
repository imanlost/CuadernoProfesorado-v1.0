# 🚀 Instalación Paso a Paso

## 📥 1. Descarga del proyecto (TODOS los sistemas)

1. Pulse **"Code"** (verde) → **"Download ZIP"**  
2. Ubíque el zip en la carpeta donde vaya a utilizarlo en adelante.  
3. Descomprima y **recuerde la carpeta**  

***

## 🖥️ WINDOWS

### Instalar Node.js
1. Vaya a [nodejs.org](https://nodejs.org/) y descargue la versión que dice **LTS** (es la más estable).  
2. Ejecute el archivo descargado y pulse **Siguiente** en todas las ventanas hasta finalizar.  

### Abrir terminal en carpeta
Para que la aplicación funcione, la consola debe "estar" dentro de la carpeta del cuaderno:

1. Abra la carpeta donde descomprimió el proyecto.  
2. En la parte superior de la ventana (en la barra de direcciones donde aparece la ruta de la carpeta), haga clic en un espacio vacío, escriba la palabra `cmd` y pulse **Intro**.  
3. Se abrirá una ventana negra. Si ve que la ruta que aparece escrita coincide con la ubicación de su carpeta, lo ha hecho correctamente.  

### Instalación y arranque
1. En esa ventana negra, escriba el siguiente comando y pulse Intro:  

```bash
npm install
```  

2. Espere a que terminen de aparecer líneas de texto. Una vez que se detenga, escriba:  

```bash
npm run dev
```  

***

## 🍎 macOS

### Instalar Node.js
1. Vaya a [nodejs.org](https://nodejs.org/) y descargue la versión que dice **LTS** (es la más estable).  
2. Ejecute el archivo descargado y pulse **Siguiente** en todas las ventanas hasta finalizar.  

### Abrir terminal en carpeta
1. Busque su carpeta del cuaderno en el **Finder**.  
2. Haga clic derecho sobre la carpeta del cuaderno.  
3. Seleccione **Nuevo terminal en la carpeta** (o «Servicios» → «Nuevo terminal en la carpeta»).  
4. Se abrirá una ventana blanca o negra. Verá el nombre de su carpeta justo antes del cursor.  

### Instalación y arranque
1. En el terminal, escriba este comando y pulse Intro:  

```bash
npm install
```  

2. Cuando finalice el proceso, escriba el comando de arranque:  

```bash
npm run dev
```  

***

## 🐧 Linux

### Instalar Node.js

```bash
sudo apt update && sudo apt install nodejs npm
```  

### Abrir terminal en carpeta
1. Localice la carpeta descomprimida.  
2. Haga clic derecho en un espacio vacío dentro de esa carpeta y seleccione **Abrir en una terminal**.  

### Instalación y arranque
1. En el terminal, escriba este comando y pulse Intro:  

```bash
npm install
```  

2. Cuando finalice el proceso, escriba el comando de arranque:  

```bash
npm run dev
```  

***

## 💻 ChromeOS (Chromebook)

> Para usar la aplicación en un Chromebook, necesita tener activado **Linux (Beta)** (también llamado «Entorno de desarrollo de Linux»).

### Activar Linux (Beta)
1. Abra **Configuración** del Chromebook.  
2. En el menú de la izquierda, vaya a **Avanzado** → **Desarrolladores**.  
3. Busque **Linux (Beta)** o **Entorno de desarrollo de Linux** y pulse **Activar**.  
4. Siga el asistente hasta que se abra una **ventana de Terminal** de Linux.  

### Instalar Node.js en Linux del Chromebook

```bash
sudo apt update && sudo apt install nodejs npm
```  

### Copiar el proyecto al entorno Linux
1. Descargue el archivo ZIP del cuaderno y descomprímalo en su carpeta **Archivos**.  
2. En el gestor de archivos del Chromebook, arrastre la carpeta descomprimida a la sección **Archivos de Linux**.  

### Abrir terminal en carpeta
1. En la ventana de Terminal de Linux, escriba `ls` para ver las carpetas disponibles.  
2. Entre en la carpeta del cuaderno con:  

```bash
cd Nombre-de-su-carpeta
```  

(sustituya `Nombre-de-su-carpeta` por el nombre real de la carpeta).  

### Instalación y arranque
1. Instale las dependencias:  

```bash
npm install
```  

2. Inicie la aplicación:  

```bash
npm run dev
```  

***

## 🌐 Acceder 

Una vez que haya ejecutado el comando `npm run dev`, fíjese en los mensajes que aparecen en la consola. Verá una línea similar a esta:

```text
> Local: http://localhost:3000/
```

El número (3000, 3001, etc.) es el **puerto**. Aunque normalmente es el 3000, si ese está ocupado, el sistema abrirá otro automáticamente.

1. No cierre la ventana de la consola (si la cierra, la aplicación dejará de funcionar).  
2. Abra su navegador (Chrome, Firefox, Edge, etc.).  
3. En la barra de direcciones superior, escriba la dirección que le indicó la consola (normalmente `http://localhost:3000/`) y pulse Intro.  

**¡Ya puede empezar a usar su Cuaderno del Profesorado!**
