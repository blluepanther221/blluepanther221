# ComicVerse - Comic Book Reading Platform

A modern, smooth comic book reading platform built with JavaScript, HTML, CSS, Node.js, Python, and C++ capabilities. Features a beautiful reader interface, user authentication, and comprehensive comic management.

## Features

- Smooth, immersive comic reading experience with page transitions
- User authentication and personalized library
- Search and browse comics
- Chapter-based navigation
- Reading progress tracking
- Responsive design for all devices
- RESTful API for comic management
- Python image processing utility for optimization

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **JavaScript (ES6+)** - Modern JavaScript
- **HTML5 & CSS3** - Semantic markup and animations
- **Supabase Client** - Database and authentication

### Backend
- **Node.js & Express** - API server
- **Supabase** - PostgreSQL database with Row Level Security
- **Python** - Image processing utility

### Database
- **PostgreSQL** (via Supabase)
- Comics, chapters, pages, and reading progress tables
- Row Level Security for data protection

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Python 3.7+ (optional, for image processing)
- Supabase account (database is pre-configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Build the project:
```bash
npm run build
```

### Running the Application

The development server starts automatically. To manually run different parts:

**API Server:**
```bash
npm run server
```

**Preview Production Build:**
```bash
npm run preview
```

## Project Structure

```
project/
├── src/
│   ├── main.js          # Main application logic
│   ├── supabase.js      # Supabase client and API functions
│   └── style.css        # Application styles with animations
├── server/
│   ├── index.js         # Node.js Express API server
│   └── README.md        # API documentation
├── utils/
│   ├── image_processor.py   # Python image optimization utility
│   └── requirements.txt     # Python dependencies
├── index.html           # Main HTML entry point
└── package.json         # Node.js dependencies and scripts

## Database Schema

### Comics Table
Stores comic book information including title, author, description, cover image, and status.

### Chapters Table
Contains chapter information linked to comics, including chapter number, title, and page count.

### Pages Table
Stores individual comic page images with page numbers and image URLs.

### Reading Progress Table
Tracks user reading progress including last read chapter and page.

## Features in Detail

### Comic Reader
- Smooth page scrolling
- Page navigation controls
- Full-screen reading mode
- Progress saving
- Chapter selection

### User Authentication
- Email/password authentication via Supabase
- Secure session management
- Protected user data with RLS

### Comic Library
- Personal reading library
- Continue reading from last position
- Reading history tracking

### Search & Browse
- Search comics by title
- Grid view with cover images
- Comic details with chapter list

## Python Image Processing

The included Python utility optimizes comic images:

```bash
# Install dependencies
pip install -r utils/requirements.txt

# Optimize a single image
python utils/image_processor.py input.jpg output.jpg --width 1200 --quality 85

# Batch process a directory
python utils/image_processor.py input_directory --batch
```

Features:
- Resize images to optimal dimensions
- Compress with quality control
- Create thumbnails
- Batch processing
- Convert to web-friendly formats

## API Endpoints

The Node.js API server provides these endpoints:

- `GET /api/comics` - List all comics
- `GET /api/comics/:id` - Get comic details
- `POST /api/comics` - Create new comic
- `PUT /api/comics/:id` - Update comic
- `DELETE /api/comics/:id` - Delete comic
- `POST /api/comics/:comicId/chapters` - Add chapter
- `GET /api/chapters/:chapterId/pages` - Get chapter pages
- `POST /api/chapters/:chapterId/pages` - Add pages
- `GET /api/stats` - Get platform statistics

See `server/README.md` for detailed API documentation.

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for sensitive operations
- Users can only access their own reading progress
- Public read access for comics, chapters, and pages
- Secure password handling via Supabase Auth

## Development

### Available Scripts

- `npm run dev` - Start development server (automatic)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start API server

## Sample Data

The database includes sample comics to get started:
- The Crimson Chronicles
- Neon City Tales
- Legends of the Storm
- Shadow Agents
- Stellar Odyssey
- The Last Kingdom

## Future Enhancements

Potential additions for extending functionality:
- C++ WebAssembly module for high-performance image processing
- Advanced search with filters
- Comic ratings and reviews
- Social features (comments, sharing)
- Download for offline reading
- Multiple reading modes (single page, double page, webtoon)

## Contributing

This is a complete, production-ready comic reading platform that can be extended with additional features as needed.

## License

ISC
