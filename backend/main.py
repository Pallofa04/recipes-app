from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routers import images, recipes

app = FastAPI(
    title="AI Recipe Generator API",
    description="Backend API for AI Recipe Generator using Gemini Pro Vision",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Include routers
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "message": "AI Recipe Generator API is running",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.get("/")
async def root():
    return {"message": "AI Recipe Generator API - Visit /docs for API documentation"}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "success": False
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)