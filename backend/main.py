from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, clients, projects

app = FastAPI(title="Workfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(projects.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "Workfolio"}
