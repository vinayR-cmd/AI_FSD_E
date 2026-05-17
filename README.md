# Candidate Shortlisting System

## Tech Stack
- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB Atlas
- AI: OpenRouter API (GPT-4o-mini)

## How to Run

### Backend
cd backend
npm install
node server.js

### Frontend
cd frontend
npm install
npm start

## Features
- Add, view, delete candidates
- Basic skill-based matching with score
- AI-powered ranking with strengths, gaps and interview questions
- Search and filter candidates

## API Endpoints
- POST /api/candidates - Add candidate
- GET /api/candidates - Get all candidates
- DELETE /api/candidates/:id - Delete candidate
- POST /api/match - Basic skill matching
- POST /api/ai/shortlist - AI-powered matching
