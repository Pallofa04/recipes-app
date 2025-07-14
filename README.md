# AI Recipe Generator

A full-stack web application that uses Google's Gemini Pro Vision to analyze ingredient photos and generate personalized recipes.

## Features

- **Image Analysis**: Upload photos of ingredients and get AI-powered identification
- **Recipe Generation**: Create custom recipes based on detected ingredients
- **Flexible Constraints**: Set calorie limits, serving sizes, and dietary preferences
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Live feedback during image analysis and recipe generation

## Tech Stack

### Frontend
- React 18 with functional components and hooks
- Tailwind CSS for styling
- Axios for API communication
- Lucide React for icons

### Backend
- Node.js with Express
- Google Generative AI (Gemini Pro Vision)
- Multer for file uploads
- CORS for cross-origin requests

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to `.env`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

4. Start the backend server:
   ```bash
   npm start
   ```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Endpoints

### POST `/api/images/analyze`
- **Description**: Analyzes an uploaded image to extract ingredients
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `image` field
- **Response**: `{ ingredients: string[], success: boolean }`

### POST `/api/recipes/generate`
- **Description**: Generates a recipe based on ingredients and constraints
- **Content-Type**: `application/json`
- **Body**: 
  ```json
  {
    "ingredients": ["tomato", "onion", "garlic"],
    "calories": 500,
    "servings": 2,
    "dietaryPreferences": "vegetarian"
  }
  ```
- **Response**: Recipe object with name, ingredients, instructions, etc.

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

## Project Structure

```
├── backend/
│   ├── routes/
│   │   ├── images.js      # Image analysis endpoints
│   │   └── recipes.js     # Recipe generation endpoints
│   ├── uploads/           # Temporary image storage
│   ├── server.js          # Express server setup
│   └── package.json
├── src/
│   ├── components/
│   │   ├── UploadImage.jsx    # Image upload component
│   │   ├── RecipeForm.jsx     # Recipe configuration form
│   │   └── RecipeDisplay.jsx  # Recipe display component
│   ├── api/
│   │   └── client.js          # API client with Axios
│   └── App.jsx
├── .env                       # Environment variables
└── README.md
```

## Usage Flow

1. **Upload Image**: User uploads a photo of ingredients
2. **Image Analysis**: Backend sends image to Gemini Vision API
3. **Ingredient Detection**: AI identifies ingredients and returns list
4. **Recipe Configuration**: User sets calories, servings, dietary preferences
5. **Recipe Generation**: Backend uses Gemini to create personalized recipe
6. **Display Results**: Frontend shows formatted recipe with ingredients and instructions

## Error Handling

- Frontend displays user-friendly error messages
- Backend validates inputs and provides detailed error responses
- File upload errors are handled gracefully
- API rate limits and failures are caught and reported

## Development Notes

- Images are temporarily stored during analysis and immediately deleted
- All API calls use proper error handling and loading states
- The UI is fully responsive and works on mobile devices
- Environment variables are used for sensitive configuration

## Security Considerations

- API keys are stored in environment variables
- File uploads are validated and limited in size
- CORS is configured for development (adjust for production)
- Temporary files are cleaned up after processing