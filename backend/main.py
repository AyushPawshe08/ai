from fastapi import FastAPI
from routes.auth_router import router as auth_router
from backend.core.db import Base,engine



app = FastAPI(title="AI")

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

@app.get('/')
def apihealth():
    return{
        "msg" : "hi"
    }