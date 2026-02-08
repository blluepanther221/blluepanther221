# Comic Book API Server

Node.js/Express API server for managing comic books, chapters, and pages.

## Features

- RESTful API endpoints for CRUD operations
- Supabase database integration
- CORS enabled for frontend integration
- Comprehensive error handling
- Statistics and analytics endpoints

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run server
```

The server will start on http://localhost:3001

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### Comics
- **GET** `/api/comics` - Get all comics
  - Query params: `search` (filter by title), `limit` (default: 50)
- **GET** `/api/comics/:id` - Get comic by ID with chapters
- **POST** `/api/comics` - Create new comic
- **PUT** `/api/comics/:id` - Update comic
- **DELETE** `/api/comics/:id` - Delete comic

### Chapters
- **POST** `/api/comics/:comicId/chapters` - Create chapter for a comic

### Pages
- **GET** `/api/chapters/:chapterId/pages` - Get all pages for a chapter
- **POST** `/api/chapters/:chapterId/pages` - Add pages to a chapter (batch)

### Statistics
- **GET** `/api/stats` - Get platform statistics

## Example Requests

### Create a Comic
```bash
curl -X POST http://localhost:3001/api/comics \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Comic",
    "author": "John Doe",
    "description": "An amazing story",
    "status": "Ongoing"
  }'
```

### Search Comics
```bash
curl "http://localhost:3001/api/comics?search=crimson"
```

### Create a Chapter
```bash
curl -X POST http://localhost:3001/api/comics/:comicId/chapters \
  -H "Content-Type: application/json" \
  -d '{
    "chapter_number": 1,
    "title": "The Beginning",
    "pages_count": 10
  }'
```

### Add Pages to Chapter
```bash
curl -X POST http://localhost:3001/api/chapters/:chapterId/pages \
  -H "Content-Type: application/json" \
  -d '{
    "pages": [
      {"page_number": 1, "image_url": "https://example.com/page1.jpg"},
      {"page_number": 2, "image_url": "https://example.com/page2.jpg"}
    ]
  }'
```

## Environment Variables

Set these in your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```
