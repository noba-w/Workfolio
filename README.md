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

Todavía no — por ahora el proyecto se ejecuta en local siguiendo los pasos anteriores.

**Plan de despliegue (pendiente, próxima sesión):** frontend en **Vercel** y backend en **Render**, manteniendo Supabase como base de datos/auth (ya está en la nube). Pasos a seguir cuando se haga:

1. Backend en Render: nuevo *Web Service* apuntando a `backend/`, build con `pip install -r requirements.txt`, start command `uvicorn main:app --host 0.0.0.0 --port $PORT`, y variables de entorno `SUPABASE_URL` / `SUPABASE_ANON_KEY` configuradas en el panel de Render (no en el repo).
2. Frontend en Vercel: importar `frontend/` como proyecto Vite, y apuntar las llamadas a `/api` a la URL pública de Render (hoy se resuelven vía el proxy de Vite, que solo existe en local — habrá que sustituirlo por una variable de entorno con la URL del backend, p. ej. `VITE_API_URL`, usada en `frontend/src/lib/api.js`).
3. Actualizar `CORSMiddleware` en `backend/main.py` (hoy solo permite `http://localhost:5173`) para aceptar el dominio de Vercel.
4. Enlazar la URL final aquí, en esta sección.

## Posibles mejoras

Algunas ideas para seguir puliendo el proyecto, pensando en que es una pieza de portfolio:

- **Desplegar la demo pública** (ver plan arriba) con un usuario de prueba — es lo que más valor da de cara a un reclutador: poder probarlo sin clonar nada.
- **Capturas o un GIF corto** del dashboard y del flujo de registrar horas, insertados aquí arriba en el README. Es lo primero que se ve al abrir el repo y vende mucho mejor que el texto.
- **Tests automáticos** (pytest en el backend, Vitest/React Testing Library en el frontend) — todavía no hay ninguno; aunque sean pocos, demuestran hábitos profesionales.
- **CI en GitHub Actions** que corra build/lint (y los tests, cuando existan) en cada push — badge verde en el README incluido.
- **LICENSE real** en el repo (ver sección siguiente) — un repo sin licencia técnicamente no es reutilizable por nadie, y un reclutador que mire el repo lo nota.
- **Historial de commits cuidado**: ya usas un formato `[keyword] descripción` consistente — mantenlo, queda muy bien en el log de un repo de portfolio.
- **Exportar informes** (PDF/CSV) de horas e ingresos por cliente o proyecto.
- **Paginación/filtrado por fechas** en listados largos de horas.
- Mencionar en el propio README (o en tu perfil de GitHub/LinkedIn) que el proyecto es tu TFG/proyecto final de DAM si aplica — da contexto y muestra progresión.

## Licencia

Pendiente de definir — si quieres que cualquiera pueda reutilizar el código libremente, [MIT](https://choosealicense.com/licenses/mit/) es la opción más habitual para proyectos de portfolio.
