# Workfolio

**Gestión de trabajo para freelancers**: entra a la app, ve tus ingresos de un vistazo y registra horas en 10 segundos.

Workfolio nace para resolver un problema muy concreto de quien trabaja por proyectos: perder de vista cuántas horas se han dedicado a cada cliente, qué tarifa aplicar, y qué tareas quedan abiertas. La app centraliza clientes, proyectos, horas trabajadas e ingresos estimados en un único lugar.

## ¿Qué hace el proyecto?

- **Dashboard**: resumen del estado general — clientes y proyectos más recientes, sugerencias ("no has registrado horas en X esta semana"), comparativa de ingresos mes a mes, horas de la semana en curso, actividad reciente y un acceso rápido para registrar horas sin salir de la pantalla. Incluye frases motivadoras que rotan automáticamente.
- **Clientes**: alta, edición y ficha de cada cliente (foto, contacto, proyectos asociados, ingresos mensuales).
- **Proyectos**: alta, edición y ficha de cada proyecto (estado activo/pausado/finalizado, tarifa por hora, calendario de horas trabajadas con detalle por día, gráfico de evolución de ingresos navegable mes a mes).
- **Registro de horas**: cada entrada puede introducirse como una **franja horaria** (hora de entrada/salida, calcula las horas automáticamente) o como **horas totales** directas, a elección del usuario.
- **Ingresos**: desglose de ingresos por proyecto y cliente, navegable mes a mes.
- **Autenticación** con email/contraseña (JWT vía Supabase Auth).
- **Internacionalización** (ES/EN) y **modo oscuro**, con diseño responsive desde 320px.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite, React Router, TanStack Query |
| Backend | Python + FastAPI |
| Autenticación | Supabase Auth (JWT) |
| Base de datos | Supabase (PostgreSQL) |
| Estilos | CSS Modules (sin librería de UI, diseño propio) |

La API es un backend REST stateless: valida el JWT de Supabase en cada request y delega en PostgreSQL (con RLS) el filtrado por usuario.

## ¿Cómo lo ejecuto?

Necesitas un proyecto de [Supabase](https://supabase.com) (gratuito) con las tablas `clients`, `projects` y `time_entries`, y Python 3.9+ y Node 18+ instalados.

### Backend

```bash
cd backend
py -m venv .venv
.venv\Scripts\activate          # en Linux/Mac: source .venv/bin/activate
py -m pip install -r requirements.txt
```

Crea un archivo `backend/.env` con tus credenciales de Supabase:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
```

Arranca la API:

```bash
py -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173` (el proxy de Vite reenvía `/api` al backend en el puerto 8000).

## ¿Hay demo?

Sí — desplegado con backend en **Render** y frontend en **Vercel**, manteniendo Supabase como base de datos/auth:

- Frontend: https://workfolio-taupe.vercel.app
- Backend: https://workfolio-2tx7.onrender.com

> Nota: el backend está en el plan gratuito de Render, así que tras un rato de inactividad se "duerme" y la primera petición tras eso puede tardar unos segundos en responder.

> Nota: el enlace "¿Olvidaste tu contraseña?" de la pantalla de login todavía no está implementado (no dispara ninguna acción) — pendiente de añadir el flujo de recuperación de contraseña vía Supabase Auth.

## Posibles mejoras

Algunas ideas para seguir puliendo el proyecto, pensando en que es una pieza de portfolio:

- **Usuario de prueba en la demo pública** — para que un reclutador pueda probarla sin tener que registrarse.
- **Implementar "¿Olvidaste tu contraseña?"** — el enlace existe en el login pero todavía no dispara el flujo de recuperación de Supabase Auth.
- **Capturas o un GIF corto** del dashboard y del flujo de registrar horas, insertados aquí arriba en el README. Es lo primero que se ve al abrir el repo y vende mucho mejor que el texto.
- **Tests automáticos** (pytest en el backend, Vitest/React Testing Library en el frontend) — todavía no hay ninguno; aunque sean pocos, demuestran hábitos profesionales.
- **CI en GitHub Actions** que corra build/lint (y los tests, cuando existan) en cada push — badge verde en el README incluido.
- **LICENSE real** en el repo (ver sección siguiente) — un repo sin licencia técnicamente no es reutilizable por nadie, y un reclutador que mire el repo lo nota.
- **Exportar informes** (PDF/CSV) de horas e ingresos por cliente o proyecto.
- **Paginación/filtrado por fechas** en listados largos de horas.

## Licencia

Pendiente de definir
