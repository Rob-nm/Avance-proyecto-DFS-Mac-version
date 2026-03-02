# 🌟 Tom Ford E-commerce - Proyecto Full Stack

¡Bienvenido al repositorio oficial del proyecto de Tom Ford! Esta es una aplicación web Full Stack funcional orientada al comercio electrónico, diseñada para ofrecer una experiencia de usuario fluida y segura.

🚀 **Demo en vivo (Vercel):** [Ver Aplicación](https://avance-proyecto-dfs-mac-version.vercel.app/)

---

## 📖 Guía de Usuario (Cómo usar la página)

Si eres nuevo explorando esta plataforma, aquí tienes los pasos básicos para interactuar con ella:

### 1. Explorar el Catálogo
Al entrar a la página principal, verás la "Colección Privada" de fragancias.
* Puedes alternar entre las versiones de **50ML** y **100ML** de cada producto para ver cómo cambia el precio.
* Verás el precio en Pesos Mexicanos (MXN) y un aproximado en Dólares (USD) actualizado en tiempo real.

### 2. Crear una Cuenta e Iniciar Sesión
Haz clic en el botón **"CUENTA"** en el menú superior.
* **Registro Tradicional:** Puedes crear una cuenta ingresando un nombre de usuario, correo electrónico y contraseña. Tus datos se guardan de forma encriptada y segura.
* **Inicio Rápido:** Puedes iniciar sesión con un solo clic usando tu cuenta de **Google o GitHub**.

### 3. Comprar y Usar el Carrito
* Haz clic en **"AÑADIR AL CARRITO"** en cualquier producto que te guste.
* Abre el icono de la bolsa de compras arriba a la derecha. Ahí puedes aumentar o disminuir las cantidades, o eliminar productos.
* **Datos de Envío:** En el carrito, ingresa tu calle, número y tu **Código Postal**. El sistema autocompletará mágicamente tu ciudad y estado.
* Haz clic en **"PAGAR AHORA"**. Serás redirigido a una pasarela segura de **Stripe** donde puedes realizar tu pago con tarjeta.

### 4. Modo Administrador
Si quieres ver cómo se gestiona la tienda por dentro, existe un panel de control exclusivo:
* Inicia sesión usando  la cuenta con el nombre de usuario: **`admin1`** y la contraseña: **`admin123`**.
* Aparecerá un nuevo botón dorado llamado **"ADMIN"** en el menú de navegación.
* Desde ahí podrás agregar nuevos productos, editar precios, cambiar imágenes, modificar el stock actual o eliminar artículos del catálogo.

---

## 🛠️ Arquitectura y Tecnologías (MERN Stack)

Este proyecto sigue una arquitectura Cliente-Servidor desplegada en la nube:

* **Frontend:** Construido con React.js y empaquetado con Vite.
* **Backend:** Servidor RESTful con Node.js y Express.js.
* **Base de Datos:** MongoDB alojado en Atlas, usando Mongoose (optimizado para Serverless).
* **Despliegue:** Vercel (arquitectura unificada de Frontend y Backend).
* **Seguridad:** JSON Web Tokens (JWT) y encriptación con `bcryptjs`. `passport.js` para OAuth.
* **APIs Externas Integradas:**
    * 💳 **Stripe:** Procesamiento de pagos seguros.
    * 💱 **ExchangeRate-API:** Conversión de divisas en tiempo real.
    * 📍 **Zippopotam.us:** Autocompletado geográfico automatizado.
