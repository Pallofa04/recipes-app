# FastAPI Backend for AI Recipe Generator

This is the FastAPI backend for the AI Recipe Generator application that uses Google's Gemini Pro Vision to analyze ingredient photos and generate personalized recipes.

## Features

- **Image Analysis**: Upload photos of ingredients and get AI-powered identification using Gemini Pro Vision
- **Recipe Generation**: Create custom recipes based on detected ingredients using Gemini Pro
- **RESTful API**: Clean, documented API endpoints with automatic OpenAPI documentation
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Configured for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 4. Run the Application

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Image Analysis

**POST** `/api/images/analyze`
- **Description**: Analyzes an uploaded image to extract ingredients
- **Content-Type**: `multipart/form-data`
- **Parameters**: 
  - `image` (file): Image file (PNG, JPG, GIF, max 10MB)
- **Response**: 
```json
{
  "ingredients": ["tomato", "onion", "garlic"],
  "success": true,
  "count": 3
}
```

### Recipe Generation

**POST** `/api/recipes/generate`
- **Description**: Generates a recipe based on ingredients and constraints
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "ingredients": ["tomato", "onion", "garlic"],
  "calories": 500,
  "servings": 2,
  "dietaryPreferences": "vegetarian"
}
```
- **Response**:
```json
{
  "name": "Garlic Tomato Pasta",
  "description": "A simple and delicious pasta dish",
  "prepTime": "20 minutes",
  "servings": 2,
  "calories": "250 calories per serving",
  "ingredients": [
    "2 large tomatoes, diced",
    "1 medium onion, sliced",
    "3 cloves garlic, minced"
  ],
  "instructions": [
    "Heat oil in a large pan over medium heat",
    "Add onion and cook until translucent",
    "Add garlic and cook for 1 minute"
  ]
}
```

### Health Check

**GET** `/api/health`
- **Description**: Check API health and configuration status
- **Response**:
```json
{
  "status": "OK",
  "message": "AI Recipe Generator API is running",
  "gemini_configured": true
}
```

## Project Structure

```
fastapi-backend/
├── main.py                 # FastAPI application setup
├── routers/
│   ├── __init__.py        # Package initialization
│   ├── images.py          # Image analysis endpoints
│   └── recipes.py         # Recipe generation endpoints
├── uploads/               # Temporary image storage
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data or file format
- **500 Internal Server Error**: API key issues or processing errors
- **422 Unprocessable Entity**: Validation errors

All errors return JSON responses with descriptive messages.

## Development Notes

- Images are processed in memory and not stored permanently
- The API uses Pydantic models for request/response validation
- CORS is configured for development (adjust for production)
- Automatic API documentation is available at `/docs`

## Security Considerations

- API keys are stored in environment variables
- File uploads are validated and size-limited
- Input validation using Pydantic models
- CORS configuration should be adjusted for production

## Frontend Integration

Update your frontend API client to use the FastAPI endpoints:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

The API is compatible with the existing React frontend with minimal changes to the API client configuration.