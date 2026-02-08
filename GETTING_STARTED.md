# Getting Started with ComicVerse

Quick guide to get your comic book platform up and running.

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required Node.js packages including Vite, Express, and Supabase client.

## Step 2: Configure Supabase

1. Your Supabase database is already set up with:
   - Comics table
   - Chapters table
   - Pages table
   - Reading progress table
   - Sample comic data

2. The database includes 6 sample comics with chapters and pages ready to view.

## Step 3: Launch the Application

The development server will start automatically. You can also run:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 4: Explore Features

### Browse Comics
- View the grid of available comics on the homepage
- Search for comics using the search bar
- Click any comic to see its details

### Read Comics
- Click on a chapter to start reading
- Use arrow buttons or page selector to navigate
- Smooth scrolling between pages
- Exit reader returns to comic details

### User Features (Optional)
1. Click "Sign In" in the navigation
2. Create an account or sign in
3. Your reading progress will be automatically saved
4. Access "My Library" to see your reading history

## Step 5: API Server (Optional)

Start the Node.js API server for comic management:

```bash
npm run server
```

Server runs at `http://localhost:3001`

Test the API:
```bash
# Get all comics
curl http://localhost:3001/api/comics

# Get platform stats
curl http://localhost:3001/api/stats
```

See `server/README.md` for complete API documentation.

## Step 6: Image Processing (Optional)

If you want to use the Python image processor:

```bash
# Install Python dependencies
pip install -r utils/requirements.txt

# Optimize an image
python utils/image_processor.py input.jpg output.jpg --width 1200 --quality 85
```

## Project Structure at a Glance

```
ComicVerse/
├── src/              # Frontend code
│   ├── main.js       # App logic
│   ├── supabase.js   # Database functions
│   └── style.css     # Styles & animations
├── server/           # API server
├── utils/            # Python utilities
└── index.html        # Main HTML
```

## Key Features

### Smooth Animations
- CSS transitions and keyframe animations
- Smooth page scrolling in reader
- Hover effects on cards
- Fade-in page transitions

### Responsive Design
- Works on desktop, tablet, and mobile
- Adapts comic grid to screen size
- Touch-friendly navigation

### Security
- Row Level Security on all tables
- Protected user data
- Secure authentication
- Safe password handling

## Next Steps

1. **Add Your Own Comics**: Use the API to add new comics
2. **Customize Styling**: Edit `src/style.css` to match your brand
3. **Extend Features**: Add ratings, comments, or social features
4. **Deploy**: Build and deploy to your hosting platform

## Building for Production

```bash
npm run build
```

Creates optimized production files in the `dist/` directory.

## Troubleshooting

### App shows "No comics found"
- Database might need a moment to populate
- Refresh the page
- Check browser console for errors

### "Sign In" not working
- Supabase auth is configured and working
- Make sure email confirmation is disabled in Supabase settings

### Images not loading
- Sample images use Pexels URLs
- Replace with your own image URLs for production

## Support

For detailed information:
- Main README: `README.md`
- API Documentation: `server/README.md`
- C++ Integration: `CPP_INTEGRATION.md`

## Sample Comics Included

The platform comes with 6 pre-loaded comics:
1. The Crimson Chronicles (2 chapters)
2. Neon City Tales (1 chapter)
3. Legends of the Storm
4. Shadow Agents
5. Stellar Odyssey
6. The Last Kingdom

Try reading "The Crimson Chronicles" to see the full reader experience!

---

Happy reading!
