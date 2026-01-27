# 🔐 Sistema de Registro de Usuarios con Roles e Inicio de Sesión

## 📋 Descripción General

Este es un sistema completo de **autenticación y autorización** que implementa:

- ✅ **Registro de usuarios** con selección de roles
- ✅ **Inicio de sesión** con credenciales
- ✅ **Control de acceso** basado en roles (RBAC)
- ✅ **Autenticación JWT** para tokens seguros
- ✅ **Base de datos relacional** con MySQL
- ✅ **API RESTful** con Node.js y Express
- ✅ **App móvil** con React Native/Expo

---

## 🏗️ Estructura del Proyecto

```
Implementación-de-Registro-con-Roles-e-Inicio-de-Sesión/
│
├── server/                          # Backend Node.js + Express
│   ├── config/
│   │   └── database.js             # Conexión a MySQL
│   │
│   ├── controllers/
│   │   └── authController.js       # Lógica de autenticación
│   │
│   ├── middleware/
│   │   └── auth.js                 # Middleware JWT y roles
│   │
│   ├── routes/
│   │   └── authRoutes.js           # Rutas de autenticación
│   │
│   ├── database/
│   │   └── schema.sql              # Script de creación de BD
│   │
│   ├── .env                        # Variables de entorno
│   ├── package.json                # Dependencias Node.js
│   └── server.js                   # Punto de entrada del servidor
│
└── maguiber/                        # App Expo (Frontend)
    ├── services/
    │   └── authService.js          # Llamadas a la API
    │
    ├── screens/
    │   ├── LoginScreen.js          # Pantalla de login
    │   ├── RegisterScreen.js        # Pantalla de registro
    │   └── HomeScreen.js            # Pantalla protegida (home)
    │
    └── app.json                    # Configuración de Expo
```

---

## 🛠️ Instalación y Configuración

### 1️⃣ BACKEND (Node.js + Express)

#### Paso 1: Crear carpeta del servidor

```bash
cd "C:\Implementación-de-Registro-con-Roles-e-Inicio-de-Sesión"
mkdir server
cd server
```

#### Paso 2: Inicializar proyecto Node.js

```bash
npm init -y
```

#### Paso 3: Instalar dependencias

```bash
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

#### Paso 4: Crear la estructura de carpetas

```bash
mkdir config controllers middleware routes database
```

#### Paso 5: Crear archivos principales

Copia los siguientes archivos a sus respectivas carpetas:

- `config/database.js` - Configuración de MySQL
- `controllers/authController.js` - Lógica de autenticación
- `middleware/auth.js` - Middleware JWT
- `routes/authRoutes.js` - Rutas de API
- `.env` - Variables de entorno
- `server.js` - Servidor principal

#### Paso 6: Configurar variables de entorno

Edita el archivo `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=sistema_registro
SERVER_PORT=5000
JWT_SECRET=tu_clave_secreta_super_segura
FRONTEND_URL=http://localhost:8081
```

#### Paso 7: Crear la base de datos

1. Abre **MySQL Workbench** o **phpMyAdmin**
2. Ejecuta el contenido del archivo `database/schema.sql`
3. Verifica que se hayan creado las tablas:

```sql
USE sistema_registro;
SHOW TABLES;
SELECT * FROM roles;
SELECT * FROM usuarios;
```

#### Paso 8: Iniciar el servidor

```bash
npm start
# O en modo desarrollo con nodemon:
npm run dev
```

✅ Deberías ver: `🚀 Servidor de autenticación corriendo en http://localhost:5000`

---

### 2️⃣ FRONTEND (Expo)

#### Paso 1: Instalar dependencias de Expo

Ya tienes el proyecto, ahora agrega las librerías necesarias:

```bash
cd maguiber

# Instalar axios para llamadas HTTP
npm install axios

# Instalar react-native-async-storage para guardar token
npx expo install @react-native-async-storage/async-storage

# Instalar expo-router si no lo tienes
npx expo install expo-router expo-constants expo-linking
```

#### Paso 2: Copiar archivos de pantallas

Copia estos archivos a la carpeta `screens/`:

- `LoginScreen.js` - Pantalla de inicio de sesión
- `RegisterScreen.js` - Pantalla de registro
- `HomeScreen.js` - Pantalla de inicio (protegida)

#### Paso 3: Crear el servicio de autenticación

Crea la carpeta `services/` (si no existe) y copia:

- `authService.js` - Servicio para conectar con la API

#### Paso 4: Configurar navegación (usando Expo Router)

Actualiza tu estructura de rutas en `app/`:

```javascript
// app/_layout.js o app/index.js
import { useEffect, useState } from 'react';
import { getToken } from '../services/authService';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';

export default function RootLayout() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkToken();
    }, []);

    const checkToken = async () => {
        const savedToken = await getToken();
        setToken(savedToken);
        setLoading(false);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    // Si hay token, muestra Home; si no, muestra Login
    return token ? <HomeScreen /> : <LoginScreen />;
}
```

#### Paso 5: Actualizar la URL de la API

En el archivo `services/authService.js`, asegúrate de que la URL sea correcta:

```javascript
// Para desarrollo en la misma máquina:
const API_URL = 'http://localhost:5000/api/auth';

// Para desarrollo en red:
// const API_URL = 'http://TU_IP_LOCAL:5000/api/auth';
```

---

## 🚀 Ejecutar el Proyecto Completo

### Terminal 1: Backend

```bash
cd server
npm run dev
```

Verás:
```
🚀 Servidor de autenticación corriendo en http://localhost:5000
✨ Sistema de Registro con Roles iniciado
```

### Terminal 2: Frontend

```bash
cd maguiber
npx expo start
```

Verás:
```
Metro waiting on exp://192.168.1.XXX:8081
Web is waiting on http://localhost:8081
```

### Acceder a la app:

- **Web**: http://localhost:8081
- **Android**: Escanea el QR con Expo Go
- **iOS**: Escanea el QR con Expo Go

---

## 🧪 Datos de Prueba

La base de datos viene con un usuario de prueba:

```
Email: admin@test.com
Contraseña: 123456
Rol: Admin
```

O crea tu propio usuario registrándote desde la app.

---

## 📡 Endpoints de la API

### Públicos (sin autenticación)

```
POST   /api/auth/registro      - Registrar nuevo usuario
POST   /api/auth/login         - Iniciar sesión
GET    /api/auth/roles         - Obtener lista de roles
```

### Protegidos (requieren JWT)

```
GET    /api/auth/perfil        - Obtener datos del usuario autenticado
GET    /api/auth/admin-only    - Solo para administradores
```

---

## 🔒 Flujo de Autenticación

```
1. Usuario abre la app
   ↓
2. Si NO tiene token → Pantalla de Login
   ├─ Si elige Registro → RegisterScreen
   │  └─ Crear cuenta + Seleccionar rol → Back to Login
   └─ Si elige Login → Ingresar email/contraseña
      ├─ Credenciales válidas → Recibe JWT
      └─ Token guardado en AsyncStorage
   ↓
3. Si tiene token válido → HomeScreen (protegida)
   ├─ Mostrar datos del usuario
   ├─ Mostrar opciones según rol
   └─ Botón para cerrar sesión
   ↓
4. Logout → Eliminar token → Volver a Login
```

---

## 🛡️ Seguridad Implementada

- ✅ **Contraseñas encriptadas** con bcryptjs
- ✅ **Tokens JWT** con expiración
- ✅ **CORS configurado** para frontend
- ✅ **Middleware de autenticación** en rutas protegidas
- ✅ **Control de roles** (RBAC)
- ✅ **Token guardado seguramente** en AsyncStorage

---

## 📚 Tecnologías Utilizadas

### Backend

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MySQL2** - Driver de base de datos
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Tokens JWT
- **cors** - Control de acceso
- **dotenv** - Variables de entorno

### Frontend

- **React Native** - Framework móvil
- **Expo** - Herramienta de desarrollo
- **axios** - Cliente HTTP
- **AsyncStorage** - Almacenamiento local
- **Expo Router** - Navegación

### Base de Datos

- **MySQL** - Base de datos relacional

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to database"

- Verifica que MySQL esté corriendo
- Comprueba las credenciales en `.env`
- Asegúrate de que la BD `sistema_registro` existe

### Error: "CORS error"

- Verifica que `FRONTEND_URL` en `.env` sea correcto
- Asegúrate de que el backend está corriendo en el puerto 5000

### Token inválido en la app

- Limpia AsyncStorage: Settings → Clear app cache
- Vuelve a iniciar sesión

### La app no conecta al backend

- Verifica que ambos estén en la misma red
- Usa tu IP local en lugar de localhost:

```javascript
// En authService.js, cambia:
const API_URL = 'http://192.168.X.X:5000/api/auth'; // Tu IP local
```

---

## 📝 Notas Importantes

1. **Seguridad en producción**: Cambia `JWT_SECRET` por algo más seguro
2. **HTTPS**: En producción, usa HTTPS en lugar de HTTP
3. **Rate Limiting**: Considera agregar límite de intentos de login
4. **Validación**: Agrega más validaciones en el backend si es necesario
5. **Logs**: Implementa un sistema de logs para mejor debugging

---

## ✅ Checklist de Desarrollo

- [ ] Backend creado y funcionando
- [ ] Base de datos creada con tablas
- [ ] Variables de entorno configuradas
- [ ] Frontend Expo inicializado
- [ ] Pantalla de Login implementada
- [ ] Pantalla de Registro implementada
- [ ] Pantalla de Home (protegida) implementada
- [ ] Rutas de navegación configuradas
- [ ] Datos de prueba generados
- [ ] Conexión frontend-backend probada
- [ ] Control de acceso por roles implementado

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del servidor en la terminal
2. Abre la consola del navegador (F12) para errores de cliente
3. Verifica la sección de "Solución de Problemas" arriba

---

## 📄 Licencia

Proyecto educativo para demostración de autenticación con roles.

**¡Éxito en tu proyecto! 🎉**