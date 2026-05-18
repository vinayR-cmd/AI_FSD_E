# Employee Performance Analytics System

## Tech Stack
- Frontend: React.js (Vercel)
- Backend: Node.js + Express.js (Render)
- Database: MongoDB Atlas
- AI: OpenRouter API (GPT-4o-mini)
- Auth: JWT + bcryptjs

## Local Setup

### Backend
cd backend
npm install
node server.js

### Frontend
cd frontend
npm install
npm start

## API Endpoints
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/employees
- GET /api/employees
- GET /api/employees/search?department=Development
- PUT /api/employees/:id
- DELETE /api/employees/:id
- POST /api/ai/recommend
