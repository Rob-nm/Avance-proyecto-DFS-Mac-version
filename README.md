
# 💎 TOM FORD - E-COMMERCE (Mac Edition)

Una aplicación web Full Stack que replica la experiencia de compra de lujo de Tom Ford. Este proyecto simula un entorno de comercio electrónico completo con gestión de inventario en tiempo real, autenticación de usuarios segura y una interfaz de usuario premium y responsiva.

---

## 🚀 Características Principales
* **Experiencia de Usuario:** Diseño minimalista y elegante fiel a la marca.
* **Catálogo Dinámico:** Visualización de productos con precios y stock actualizados desde la base de datos.
* **Gestión de Inventario Real:** El sistema descuenta el stock (50ml o 100ml) automáticamente al confirmar una compra.
* **Carrito de Compras Inteligente:** Lógica completa para añadir, eliminar y calcular totales en tiempo real.
* **Seguridad:** Registro e inicio de sesión con encriptación de contraseñas (bcrypt).
* **Responsive Design:** Menú de navegación adaptativo (Menú Hamburguesa) para móviles y tablets.

---

## 🛠️ Stack Tecnológico
* **Frontend:** React.js, Vite, CSS3 (Diseño Personalizado).
* **Backend:** Node.js, Express.js.
* **Base de Datos:** MySQL.
* **Seguridad:** BCrypt (Encriptación), CORS (Seguridad de red).

---

## 📖 Manual de Instalación en macOS

Sigue estos pasos para levantar el proyecto en tu entorno local (MacBook / iMac).

### 1. Prerrequisitos
Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (Versión LTS recomendada para macOS).
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) (DMG Archive) y MySQL Workbench.
* Git.

### 2. Configuración de la Base de Datos
1.  Abre **MySQL Workbench**.
2.  Crea una nueva base de datos llamada `tomford_db`.
3.  Ejecuta el script SQL proporcionado en el archivo `database.sql` para crear las tablas `productos` y `usuarios`.

    

### 3. Configuración del Backend (Servidor)
⚠️ **Paso Crítico para Mac:** macOS utiliza el puerto 5000 para "AirPlay Receiver". Debemos usar el **4000**.

1.  Crea un archivo llamado `.env` en la raíz de la carpeta `backend` con el siguiente contenido exacto:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL
    DB_NAME=tomford_db
    PORT=4000
    ```
2.  Abre la **Terminal** y navega a la carpeta del servidor:
    ```bash
    cd backend
    ```
3.  Instala todas las dependencias necesarias de una sola vez:
    ```bash
    npm install express mysql2 cors bcrypt dotenv jsonwebtoken
    ```
4.  Inicia el servidor:
    ```bash
    node server.js
    ```
    *Deberás ver el mensaje: "Servidor Luxury corriendo en puerto 4000".*

### 4. Configuración del Frontend (Cliente)
1.  Abre una **nueva pestaña en la Terminal** (Cmd + T) y navega a la carpeta del cliente:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia la aplicación web:
    ```bash
    npm run dev
    ```
4.  Mantén presionado `Cmd` y haz clic en el enlace que aparece (ej. `http://localhost:5173`).

---

## 🧪 Guía de Uso Rápido

### Registrarse e Iniciar Sesión
1.  Haz clic en el botón **"CUENTA"** en el menú superior.
2.  Selecciona la pestaña **"CREAR CUENTA"**.
3.  Ingresa tu nombre, correo y contraseña. El sistema te logueará automáticamente.

### Realizar una Compra
1.  Navega por el catálogo de fragancias.
2.  Selecciona un tamaño (**50ML** o **100ML**) en la tarjeta del producto.
3.  Haz clic en **"AÑADIR AL CARRITO"**.
4.  Abre el ícono de la **Bolsa de Compras** (esquina superior derecha).
5.  Revisa tu pedido y haz clic en **"FINALIZAR COMPRA"**.
6.  *Verificación:* Si revisas la base de datos, verás que el stock del producto ha disminuido.

---

## 🐛 Solución de Problemas (Mac)

| Problema | Solución |
| :--- | :--- |
| **Error "Failed to fetch"** | El backend no está corriendo o el puerto es incorrecto. Asegúrate de que tu `.env` tenga `PORT=4000`. |
| **Conflicto de Puertos** | Si intentas usar el puerto 5000, macOS lo bloqueará (servicio AirPlay). Usa siempre el 4000. |
| **Error de conexión a BD** | Revisa que la contraseña en tu archivo `.env` sea la misma que configuraste al instalar el DMG de MySQL. |
| **Permisos de Terminal** | Si tienes errores de permisos (`EACCES`), intenta usar `sudo npm install` (te pedirá la contraseña de tu Mac). |

---

**Desarrollado por:** [HTMLovers]


