# 🍸 CRM Coctelería & Eventos — Backend API

[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge&logo=git)](https://github.com/DregoZ/crm-back)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.x-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure%20Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **API RESTful orientada al dominio de gestión de catering de coctelería y eventos.**  
> Este repositorio contiene el servicio backend encargado del modelado de datos, reglas de negocio, autenticación segura y persistencia en MongoDB Atlas.
>
> 🌐 **Frontend del proyecto:** [Repositorio Angular SPA (`crm-front`)](https://github.com/DregoZ/crm-front)

---

## 🛠️ Stack Tecnológico Backend

- **Runtime:** Node.js (v18+)
- **Framework Web:** Express.js (v5.x)
- **Base de Datos & ODM:** MongoDB Atlas + Mongoose 9.x
- **Autenticación & Hashing:** JWT (`jsonwebtoken`) y `bcrypt` (12 rondas de salting)
- **Seguridad HTTP:**
  - `helmet`: Protección integral de cabeceras HTTP.
  - `express-rate-limit`: Prevención de ataques de fuerza bruta en el endpoint de login (5 intentos por cada 15 min).
  - `cors`: Configuración dinámica con validación estricta de orígenes (local, producción y entornos preview de Vercel).
  - `trust proxy`: Habilitado para compatibilidad con balanceadores de carga y proxies inversos (Render / Vercel).
- **Validación de Datos:** `express-validator`

---

## 📐 Modelado de Datos (Mongoose Schemas)

El diseño de datos combina esquemas embebidos (`sub-documents`) para optimizar rendimiento y consistencia, junto con referencias relacionales (`populate`):

- **`Usuario`:** Gestión de usuarios con roles (`admin`, `colaborador`), campo `password` protegido con `select: false` y hook `pre('save')` para hashing automático con `bcrypt`.
- **`Cliente`:** Directorio comercial con datos de contacto, notas sobre gustos/preferencias en cócteles e historial.
- **`Evento`:** Registro central del servicio: fecha, número de asistentes, dirección, estado (`Pendiente`, `Confirmado`, `Finalizado`, `Cancelado`), precio acordado, notas logísticas y referencias a cliente y paquete de barra.
- **`Coctel`:** Recetario con ingredientes embebidos (`nombre_insumo`, `cantidad_por_persona`, `unidad_medida`: ml, gramos, piezas, hojas) y tipo de cristalería.
- **`TipoBarra`:** Paquetes de barra comercial (precio por persona, descripción y lista de cócteles incluidos).
- **`Contabilidad`:** Registro granular de ingresos y egresos vinculados a cada evento.
- **`Material`:** Inventario de material e instrumental para montaje de barras móviles.

---

## 🔌 Endpoints Principales de la API

| Método | Endpoint | Descripción | Autenticado |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Healthcheck y estado de conexión a la base de datos | No |
| `POST` | `/api/auth/login` | Inicio de sesión con rate limit y emisión de token JWT | No |
| `GET` | `/api/auth/perfil` | Información del usuario autenticado | Sí |
| `GET` / `POST` | `/api/eventos` | Listado paginado y creación de nuevos eventos | Sí |
| `GET` / `PUT` / `DELETE` | `/api/eventos/:id` | Detalle, edición y cancelación de evento | Sí |
| `GET` / `POST` | `/api/clientes` | Listado y registro de clientes | Sí |
| `GET` / `PUT` / `DELETE` | `/api/clientes/:id` | Gestión y ficha del cliente | Sí |
| `GET` / `POST` | `/api/barras` | Catálogo de tipos de barra y paquetes | Sí |
| `GET` / `POST` | `/api/contabilidad` | Registro financiero (ingresos y gastos) | Sí |
| `GET` / `POST` | `/api/material` | Control de inventario logístico y material | Sí |

---

## 🚀 Instalación y Puesta en Marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a `.env` y completa tus credenciales:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/crm_cocteleria?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:4200
   NODE_ENV=development
   JWT_SECRET=tu_clave_secreta_super_segura
   JWT_EXPIRES_IN=2h
   ```

3. **Crear usuario administrador:**
   ```bash
   node create-admin.js
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

---

## 👤 Autor

Desarrollado por **[DregoZ](https://github.com/DregoZ)**  
Parte del portfolio personal de proyectos Full-Stack.
