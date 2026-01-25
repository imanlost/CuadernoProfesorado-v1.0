## 1. Descarga del proyecto

Antes de ir a las instrucciones específicas, todos los usuarios deben realizar este paso:

1. Pulse el botón verde Code en la parte superior derecha de esta página.
2. Seleccione Download ZIP.
3. Guarde el archivo en su ordenador y descomprímalo. Se creará una carpeta llamada Cuaderno-Profesorado (o similar). **Es fundamental que recuerde dónde ha guardado esta carpeta.**

---

## 2. Instrucciones según su Sistema Operativo

Elija su sistema operativo y siga los pasos enumerados:

### Windows

#### Paso A: Instalar el motor (Node.js)

1. Vaya a [nodejs.org](https://nodejs.org/) y descargue la versión que dice **LTS** (es la más estable).
2. Ejecute el archivo descargado y pulse Siguiente en todas las ventanas hasta finalizar.

#### Paso B: Abrir la consola en la carpeta correcta

Para que la aplicación funcione, la consola debe "estar" dentro de la carpeta del cuaderno:

1. Abra la carpeta donde descomprimió el proyecto.
2. En la parte superior de la ventana (en la barra de direcciones donde aparece la ruta de la carpeta), haga clic en un espacio vacío, escriba la palabra `cmd` y pulse **Intro**.
3. Se abrirá una ventana negra. Si ve que la ruta que aparece escrita coincide con la ubicación de su carpeta, lo ha hecho correctamente.

#### Paso C: Instalación y arranque

1. En esa ventana negra, escriba el siguiente comando y pulse Intro:
`npm install`
2. Espere a que terminen de aparecer líneas de texto. Una vez que se detenga, escriba:
`npm run dev`

---

### macOS

#### Paso A: Instalar el motor (Node.js)

1. Vaya a [nodejs.org](https://nodejs.org/) y descargue el instalador **LTS** (archivo .pkg).
2. Ábralo y siga los pasos de instalación habituales de Mac.

#### Paso B: Abrir la consola en la carpeta correcta

1. Busque su carpeta del cuaderno en el **Finder**.
2. Haga clic derecho sobre la carpeta del cuaderno.
3. Seleccione **Nuevo terminal en la carpeta** (o "Servicios" > "Nuevo terminal en la carpeta").
4. Se abrirá una ventana blanca o negra. Verá el nombre de su carpeta justo antes del cursor.

#### Paso C: Instalación y arranque

1. En el terminal, escriba este comando y pulse Intro:
`npm install`
2. Cuando finalice el proceso, escriba el comando de arranque:
`npm run dev`

---

### Linux

#### Paso A: Instalar el motor (Node.js)

Abra su terminal y escriba los siguientes comandos:
`sudo apt update`
`sudo apt install nodejs npm`

#### Paso B: Navegar a la carpeta

1. Localice la carpeta descomprimida.
2. Haga clic derecho en un espacio vacío dentro de esa carpeta y seleccione **Abrir en una terminal**.

#### Paso C: Instalación y arranque

1. Ejecute la instalación de dependencias:
`npm install`
2. Inicie la aplicación:
`npm run dev`

---

## 3. Acceso a la aplicación

Una vez que haya ejecutado el comando `npm run dev`, fíjese en los mensajes que aparecen en la consola. Verá una línea similar a esta:

`> Local: http://localhost:3000/`

El número (3000, 3001, etc.) es el **puerto**. Aunque normalmente es el 3000, si ese está ocupado, el sistema abrirá otro automáticamente.

1. No cierre la ventana de la consola (si la cierra, la aplicación dejará de funcionar).
2. Abra su navegador (Chrome, Firefox, etc.).
3. En la barra de direcciones superior, escriba la dirección que le indicó la consola (normalmente `http://localhost:3000/`) y pulse Intro.

---

## 4. Pantallazos

### Calendario mensual

### Ajustes del curso

### Diario de clase

