# FastAPI Backend Setup Instructions

## Quick Start

1. **Navigate to the FastAPI backend directory:**
   ```bash
   cd fastapi-backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Activate on Windows
   venv\Scripts\activate
   
   # Activate on macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

5. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **In a separate terminal, run the React frontend:**
   ```bash
   # From the root directory
   npm run dev
   ```

## API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/health

## Key Differences from Node.js Backend

1. **Port**: FastAPI runs on port 8000 (instead of 3001)
2. **Documentation**: Automatic OpenAPI/Swagger documentation
3. **Type Safety**: Pydantic models for request/response validation
4. **Performance**: Generally faster for AI/ML workloads
5. **Python Ecosystem**: Better integration with AI libraries

## Frontend Changes Made

The frontend has been updated to use the new FastAPI backend:
- API base URL changed to `http://localhost:8000/api`
- All existing functionality remains the same
- No changes needed to React components

## Testing the API

You can test the API endpoints using the interactive documentation at `/docs` or with curl:

```bash
# Health check
curl http://localhost:8000/api/health

# Upload image for analysis
curl -X POST "http://localhost:8000/api/images/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@your_image.jpg"
```

The FastAPI backend provides the same functionality as the Node.js version but with better performance, automatic documentation, and stronger type safety.