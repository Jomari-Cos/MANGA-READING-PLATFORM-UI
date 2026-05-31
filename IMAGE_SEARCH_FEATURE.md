# Image Search & Web Scraping Feature

## Overview
The manga platform now includes advanced **reverse image search** capabilities with automatic **web scraping** fallback. Users can upload manga covers or panels to find matching titles, even if they're not in the local database.

## New Features

### 1. Reverse Image Search
- **Upload Interface**: Drag-and-drop or click to upload manga cover images or panels
- **Image Preview**: See uploaded image before searching
- **Dual Search System**:
  - **Local Database Search**: Searches existing manga first (fast, instant results)
  - **Web Scraping**: Automatically searches external sources if no local matches found

### 2. Search Result Display
- **Confidence Scores**: Each result shows match percentage (0-100%)
- **Source Attribution**: Clear indication of where data came from:
  - 🟢 **Local Database** - Green badge for locally stored manga
  - 🔵 **Web Sources** - Cyan badge with source name (MangaDex, MyAnimeList, etc.)
- **Side-by-side Comparison**: Results organized by source type
- **Familiar Interface**: Results displayed in same card grid as text search

### 3. Seamless Integration
- **Tab-based Interface**: Switch between text and image search modes
- **Same Filters Apply**: Genre, status, type filters work on image search results
- **Consistent UX**: Same sorting and display options as regular search

## How to Use

### For Users
1. Navigate to **Search** page
2. Click **"Image Search"** tab
3. Click the upload area or drag an image
4. Click **"Search Image"** button
5. View results with confidence scores
6. Click any manga card to see details

### Supported Image Formats
- JPG/JPEG
- PNG
- WebP
- GIF

## Technical Implementation

### New Components
1. **`ImageSearch.tsx`** - Main image search component
   - File upload with drag-and-drop
   - Image preview
   - Search button with loading state
   - Results display with confidence scores

### New Services
2. **`mangaScraper.ts`** - Web scraping service
   - `reverseImageSearch()` - Main search function
   - `searchLocalDatabase()` - Local image matching
   - `searchWebSources()` - External source querying
   - `scrapeMangaFromUrl()` - URL-specific scraping
   - `searchMultipleSources()` - Multi-source aggregation

### Updated Components
3. **`SearchPage.tsx`** - Enhanced with dual search modes
   - Added tab navigation (Text/Image)
   - Integrated ImageSearch component
   - Updated result handling for image search

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User uploads image                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │  ImageSearch.tsx     │
         │  (Frontend Component)│
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ reverseImageSearch() │
         │  (Service Layer)     │
         └──────────┬───────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│ searchLocal      │  │ searchWebSources │
│ Database()       │  │      ()          │
│                  │  │                  │
│ • Image hashing  │  │ • API queries    │
│ • Similarity     │  │ • Web scraping   │
│ • Confidence     │  │ • Deduplication  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │    Found?           │
         │    Yes              │ No
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Return local     │  │ Query external   │
│ matches with     │  │ sources:         │
│ confidence       │  │ • MangaDex       │
└──────────────────┘  │ • MyAnimeList    │
                      │ • AniList        │
                      │ • MangaUpdates   │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ Return web       │
                      │ matches with     │
                      │ source + conf.   │
                      └──────────────────┘
```

## Current Implementation (Mock)

The current implementation is a **frontend simulation** for demonstration purposes:

### What Works Now
✅ Image upload and preview  
✅ Search button with loading states  
✅ Result display with confidence scores  
✅ Source attribution (local vs web)  
✅ Integration with existing search UI  
✅ Tab-based search mode switching  

### What's Mocked
⚠️ Image similarity matching (returns random results)  
⚠️ External API calls (simulated with delays)  
⚠️ Web scraping (returns mock data)  

## Production Requirements

To make this production-ready, you'll need:

### 1. Backend API Server
```typescript
// Example endpoint
POST /api/search/image
Content-Type: multipart/form-data

Request:
{
  image: File,
  threshold?: number  // Confidence threshold (0-1)
}

Response:
{
  results: [
    {
      manga: Manga,
      confidence: number,
      source: 'local' | 'web',
      sourceUrl?: string
    }
  ],
  searchTime: number
}
```

### 2. Image Recognition Services

**Option A: Google Cloud Vision API**
```typescript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();
const [result] = await client.webDetection(imageBuffer);
```

**Option B: SauceNAO API (Anime/Manga Specific)**
```typescript
const response = await fetch('https://sauceNAO.com/search.php', {
  method: 'POST',
  body: formData,
  headers: { 'api-key': API_KEY }
});
```

**Option C: Custom ML Model**
```python
# TensorFlow/PyTorch model trained on manga covers
model = load_model('manga_recognition.h5')
features = model.predict(preprocess_image(image))
matches = search_similar(features, database)
```

### 3. Web Scraping Infrastructure

**Puppeteer/Playwright for Dynamic Content**
```typescript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
const data = await page.evaluate(() => {
  return {
    title: document.querySelector('.manga-title').textContent,
    rating: document.querySelector('.rating').textContent,
    // ... extract more data
  };
});
```

**Cheerio for HTML Parsing**
```typescript
import cheerio from 'cheerio';
import axios from 'axios';

const { data } = await axios.get(url);
const $ = cheerio.load(data);

const manga = {
  title: $('h1.manga-title').text(),
  author: $('.author').text(),
  rating: parseFloat($('.rating').text()),
  // ...
};
```

### 4. Database & Caching
- **Store scraped manga data** to avoid repeated scraping
- **Cache image search results** (expire after 24h)
- **Index manga covers** for fast similarity search
- **Use Redis** for result caching

### 5. Security & Performance
- **Rate limiting**: Max 10 image searches per minute per user
- **File size limit**: Max 10MB per image
- **Image validation**: Check file type and format
- **Proxy rotation**: For web scraping to avoid IP blocks
- **CDN**: Store and serve images efficiently

## API Examples

### Search Manga by Image
```typescript
// Frontend
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/search/image', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { results } = await response.json();
```

### Get Manga Details from URL
```typescript
const response = await fetch('/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://mangadex.org/title/...' })
});

const manga = await response.json();
```

## Future Enhancements

### Phase 1 (Next)
- [ ] Real image recognition backend
- [ ] Production web scraping service
- [ ] Rate limiting and authentication
- [ ] Image caching and optimization

### Phase 2
- [ ] OCR for manga text recognition
- [ ] Multi-image search (upload multiple panels)
- [ ] Reverse search from URL (paste image URL)
- [ ] Search history and saved searches

### Phase 3
- [ ] ML model specifically trained on manga covers
- [ ] Character recognition (search by character)
- [ ] Style-based search (find similar art styles)
- [ ] Automatic manga metadata enrichment

## Performance Metrics (Target)

When production-ready:
- **Local search**: < 100ms
- **Image recognition API**: < 2 seconds
- **Web scraping**: < 5 seconds
- **Total end-to-end**: < 6 seconds average

## Legal Compliance

**Important**: When implementing production web scraping:

1. ✅ Respect `robots.txt` of target websites
2. ✅ Implement rate limiting (1-2 requests per second max)
3. ✅ Cache scraped data to minimize requests
4. ✅ Provide source attribution for all scraped content
5. ✅ Use official APIs where available
6. ✅ Don't redistribute copyrighted content
7. ✅ Link back to original sources
8. ✅ Monitor for terms of service changes

## Testing

### Manual Testing Checklist
- [ ] Upload various image formats (JPG, PNG, WebP)
- [ ] Test with manga covers
- [ ] Test with manga panels (interior pages)
- [ ] Test with non-manga images (should fail gracefully)
- [ ] Test file size limits
- [ ] Test network error handling
- [ ] Verify confidence scores are displayed
- [ ] Verify source attribution is shown
- [ ] Test on mobile devices
- [ ] Test drag-and-drop functionality

### Automated Testing
```typescript
describe('ImageSearch', () => {
  it('accepts valid image files', () => {});
  it('rejects non-image files', () => {});
  it('displays uploaded image preview', () => {});
  it('shows loading state during search', () => {});
  it('displays results with confidence scores', () => {});
  it('handles search errors gracefully', () => {});
});
```

## Support & Documentation

- **Main docs**: `PROJECT_DOCUMENTATION.md` - Section "Image Search & Web Scraping"
- **Service code**: `src/app/services/mangaScraper.ts`
- **Component code**: `src/app/components/ImageSearch.tsx`
- **Page integration**: `src/app/pages/SearchPage.tsx`

## Credits

**Built with**:
- React 18.3.1
- TypeScript
- Motion (Framer Motion) for animations
- Radix UI components
- Tailwind CSS for styling

**Inspired by**:
- SauceNAO (anime/manga reverse image search)
- Google Images reverse search
- TinEye image recognition

---

**Last Updated**: 2026-05-31  
**Feature Status**: ✅ Frontend Complete | ⏳ Backend Pending  
**Version**: 1.0.0
