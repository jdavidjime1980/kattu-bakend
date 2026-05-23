# MiApp Cúcuta — Semana 1

PWA de citas construida con Vite + React + Supabase.

## Pasos para arrancar desde cero

### 1. Requisitos
- Node.js 18+ instalado (descárgalo en nodejs.org)
- Una cuenta gratuita en supabase.com

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase
1. Entra a supabase.com → crea un proyecto nuevo
2. Ve a Settings → API
3. Copia "Project URL" y "anon public key"
4. Crea el archivo `.env.local` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Crear la tabla en Supabase
1. En tu proyecto de Supabase ve a SQL Editor → New query
2. Copia y pega todo el contenido de `supabase_setup.sql`
3. Click en "Run"

### 5. Correr en desarrollo
```bash
npm run dev
```
Abre http://localhost:5173 en el navegador.

### 6. Para probar la instalación como PWA
```bash
npm run build
npm run preview
```
Abre http://localhost:4173 — verás el botón "Instalar app" en el navegador.

### 7. Desplegar en Vercel (gratis)
1. Sube el proyecto a GitHub
2. Entra a vercel.com → New Project → importa tu repo
3. En "Environment Variables" agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
4. Click Deploy

## Estructura del proyecto
```
src/
  pages/
    Login.jsx       ← pantalla de inicio de sesión
    Registro.jsx    ← registro en 3 pasos
    Feed.jsx        ← feed principal (se construye semana 3)
  components/
    ui/index.jsx    ← Button, Input, Select, Spinner, ErrorMsg
    RutaProtegida.jsx
  hooks/
    useAuth.jsx     ← contexto de autenticación global
  lib/
    supabase.js     ← cliente de Supabase
    barrios.js      ← lista de barrios de Cúcuta
  App.jsx           ← rutas principales
  main.jsx
```

## Lo que se construye cada semana
- Semana 1 ✅ Setup, auth, PWA instalable
- Semana 2 → Foto de perfil con Cloudinary
- Semana 3 → Feed y filtros por barrio
- Semana 4 → Megusta y matches
- Semana 5 → Chat con Socket.io
- Semana 6 → Coins y pagos con Wompi
- Semana 7 → Contenido exclusivo
- Semana 8 → Verificación KYC
- Semana 9 → Panel admin
- Semana 10 → Pruebas y lanzamiento beta
