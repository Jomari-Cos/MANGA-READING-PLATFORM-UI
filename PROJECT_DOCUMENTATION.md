# Manga/Manhwa Reading Platform - Complete Documentation

## Project Overview

A premium, modern manga/manhwa reading platform with a Material Design 3 aesthetic, dark-first theme, and Netflix/Crunchyroll-inspired interface. Built with React, TypeScript, and Tailwind CSS, the platform provides an immersive binge-reading experience with advanced content discovery features.

### Key Features
- **Advanced Search Capabilities**
  - Text-based search with filters (genre, status, type, rating)
  - **Reverse image search** - Upload manga covers or panels to find matches
  - **Web scraping integration** - Automatically searches external sources when local data is unavailable
- Multiple reading modes (vertical scroll, single page, double page)
- Library management with reading progress tracking
- User profiles with statistics and achievements
- Hero carousels and trending sections
- Personalized recommendations
- Responsive design (mobile, tablet, desktop)
- Glassmorphism effects and smooth animations

---

## Tech Stack

### Core Technologies
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 6.3.5** - Build tool and dev server
- **React Router 7.13.0** - Client-side routing
- **Tailwind CSS 4.1.12** - Utility-first styling

### UI & Animation Libraries
- **Motion (Framer Motion) 12.23.24** - Animations and transitions
- **Radix UI** - Accessible component primitives (40+ packages)
- **Material UI 7.3.5** (@mui/material) - Material Design components
- **Lucide React 0.487.0** - Icon library

### Additional Libraries
- **React Hook Form 7.55.0** - Form management
- **React Slick 0.31.0** - Carousel/slider
- **Recharts 2.15.2** - Charts and graphs
- **React DnD 16.0.1** - Drag and drop
- **React Responsive Masonry 2.7.1** - Masonry grid layouts
- **Sonner 2.0.3** - Toast notifications
- **date-fns 3.6.0** - Date utilities
- **class-variance-authority** - Component variants
- **tailwind-merge** - Tailwind class merging
- **clsx** - Conditional class names

### Package Manager
- **pnpm** - Fast, disk space efficient package manager

---

## Design System

### Color Palette

#### Primary Colors
- **Background**: `#0F1115` - Deep dark background
- **Surface**: `#181C24` - Card and elevated surfaces
- **Primary**: `#7C4DFF` - Purple brand color
- **Secondary**: `#00D4FF` - Cyan accent
- **Accent**: `#FF5E8A` - Pink highlight

#### Status Colors
- **Success**: `#4CAF50` - Green for completed/success states
- **Warning**: `#FFD54F` - Yellow for warnings
- **Destructive**: `#d4183d` - Red for errors/destructive actions

#### Text Colors
- **Foreground**: `#FFFFFF` - Primary text (white)
- **Text Secondary**: `#A0A8B8` - Muted/secondary text
- **Muted**: `#2A2E38` - Disabled/muted elements

#### System Colors
- **Border**: `rgba(255, 255, 255, 0.1)` - Subtle borders
- **Input Background**: `#1F2430` - Input field backgrounds
- **Switch Background**: `#2A2E38` - Toggle switches

### Typography

**Font Family**: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif

**Font Weights**:
- Normal: 400
- Medium: 600

**Base Font Size**: 16px

**Default Element Styles**:
- `h1`: text-2xl, font-medium, line-height 1.5
- `h2`: text-xl, font-medium, line-height 1.5
- `h3`: text-lg, font-medium, line-height 1.5
- `h4`: text-base, font-medium, line-height 1.5
- `label`: text-base, font-medium, line-height 1.5
- `button`: text-base, font-medium, line-height 1.5
- `input`: text-base, font-normal, line-height 1.5

### Spacing & Borders
- **Border Radius**: `1rem` (16px) base, with variants:
  - Small: `calc(1rem - 4px)`
  - Medium: `calc(1rem - 2px)`
  - Large: `1rem`
  - XL: `calc(1rem + 4px)`

### Glassmorphism Classes

```css
/* Standard glass effect */
.glass {
  background: rgba(24, 28, 36, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Light glass effect */
.glass-light {
  background: rgba(24, 28, 36, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Scrollbar Styling
- **Width/Height**: 8px
- **Track**: `#0F1115`
- **Thumb**: `#2A2E38`
- **Thumb Hover**: `#3A3E48`
- **Hide Scrollbar**: `.hide-scrollbar` utility class

---

## Project Structure

```
/workspaces/default/code/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/                    # Radix UI primitives & shadcn components
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── utils.ts
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx  # Image component with error handling
│   │   │   ├── BottomNav.tsx              # Mobile bottom navigation
│   │   │   ├── ContentRow.tsx             # Horizontal scrolling content row
│   │   │   ├── DesktopSidebar.tsx         # Desktop sidebar navigation
│   │   │   ├── HeroCarousel.tsx           # Featured content carousel
│   │   │   ├── ImageSearch.tsx            # Reverse image search component
│   │   │   ├── Layout.tsx                 # Main layout wrapper
│   │   │   ├── MangaCard.tsx              # Manga card component
│   │   │   ├── MangaCardSkeleton.tsx      # Loading skeleton
│   │   │   └── Navbar.tsx                 # Top navigation bar
│   │   ├── services/
│   │   │   └── mangaScraper.ts            # Web scraping & image search service
│   │   ├── data/
│   │   │   └── mockData.ts                # Mock data for development
│   │   ├── pages/
│   │   │   ├── HomePage.tsx               # Home/dashboard page
│   │   │   ├── LibraryPage.tsx            # User library
│   │   │   ├── MangaDetailPage.tsx        # Manga details view
│   │   │   ├── ProfilePage.tsx            # User profile
│   │   │   ├── ReaderPage.tsx             # Manga reader
│   │   │   ├── SearchPage.tsx             # Search & filters
│   │   │   └── TrendingPage.tsx           # Trending content
│   │   ├── App.tsx                        # Root component
│   │   └── routes.tsx                     # React Router configuration
│   ├── styles/
│   │   ├── globals.css                    # Global styles (import)
│   │   ├── theme.css                      # Theme variables & utilities
│   │   └── fonts.css                      # Font imports
│   └── imports/                           # Figma imports (if applicable)
├── package.json                           # Dependencies
├── default_shadcn_theme.css              # Default shadcn styles
└── PROJECT_DOCUMENTATION.md              # This file
```

---

## Data Models

### Manga Interface
```typescript
interface Manga {
  id: string;
  title: string;
  cover: string;                // Image URL
  rating: number;               // 0-10 scale
  chapters: number;             // Total chapter count
  status: 'Ongoing' | 'Completed' | 'Hiatus';
  type: 'Manga' | 'Manhwa' | 'Manhua' | 'Webtoon';
  author: string;
  genres: string[];
  synopsis: string;
  views: string;                // e.g., "1.2B"
  releaseYear: number;
  lastChapter?: string;         // Last read chapter
  progress?: number;            // Reading progress %
}
```

### Chapter Interface
```typescript
interface Chapter {
  id: string;
  number: number;
  title: string;
  releaseDate: string;
  read: boolean;
}
```

### Mock Data Collections
- `featuredManga` - Featured/hero content (4 items)
- `trendingManga` - Trending content (20+ items)
- `popularManga` - Popular content (20+ items)
- `newReleases` - Recently released (20+ items)
- `genres` - List of available genres

---

## Routing Structure

```typescript
// Main layout routes (with navigation)
{
  path: "/",
  Component: Layout,
  children: [
    { index: true, Component: HomePage },              // /
    { path: "search", Component: SearchPage },         // /search
    { path: "library", Component: LibraryPage },       // /library
    { path: "trending", Component: TrendingPage },     // /trending
    { path: "profile", Component: ProfilePage },       // /profile
    { path: "manga/:id", Component: MangaDetailPage }, // /manga/:id
  ]
}

// Standalone reader (no navigation)
{
  path: "/reader/:id/:chapter",
  Component: ReaderPage,                               // /reader/:id/:chapter
}
```

---

## Component Breakdown

### Layout Components

#### `Layout.tsx`
Main layout wrapper that provides:
- Responsive sidebar (desktop) / bottom navigation (mobile)
- Top navbar
- Collapsible desktop sidebar with toggle
- Outlet for child routes

**Breakpoints**:
- Desktop (lg+): Sidebar visible, bottom nav hidden
- Mobile (<lg): Sidebar hidden, bottom nav visible

#### `Navbar.tsx`
Top navigation bar featuring:
- Logo/branding
- Search bar
- User profile menu
- Notification icon
- Glassmorphism styling

#### `DesktopSidebar.tsx`
Collapsible sidebar navigation with:
- Logo section
- Navigation links (Home, Search, Library, Trending, Profile)
- Active state highlighting
- Smooth transitions
- Glass effect background

#### `BottomNav.tsx`
Mobile bottom navigation with:
- 5 main navigation items
- Active state indicators
- Fixed positioning
- Icon-based navigation

### Content Components

#### `HeroCarousel.tsx`
Featured content carousel featuring:
- Full-width hero slides
- Auto-play functionality
- Navigation dots
- Gradient overlays
- Call-to-action buttons
- Smooth transitions using Motion

#### `ContentRow.tsx`
Horizontal scrolling content row with:
- Scrollable manga card grid
- Section titles
- "View All" links
- Hide scrollbar styling
- Responsive spacing

#### `MangaCard.tsx`
Manga card component with:
- Cover image with lazy loading
- Hover effects (scale, transform)
- Status and type badges
- Rating display (star icon)
- Bookmark button
- Genre tags
- "Read Now" button on hover
- Smooth animations

#### `MangaCardSkeleton.tsx`
Loading skeleton for manga cards with:
- Animated pulse effect
- Matching aspect ratio
- Gradient placeholders

### Page Components

#### `HomePage.tsx`
Dashboard/landing page with:
- Hero carousel (featured manga)
- Continue Reading section
- Trending Today section
- Browse by Genre (badge grid)
- Popular This Week section
- New Releases section
- Top Rated section
- Recommended For You section

#### `SearchPage.tsx`
Advanced search interface with dual search modes:

**Text Search Mode**:
- Search input with icon
- Genre multi-select filters
- Type filters (Manga, Manhwa, etc.)
- Status filters (Ongoing, Completed, Hiatus)
- Year filters
- Sort options (Rating, Views, Chapters)
- Results grid with manga cards
- Real-time filtering

**Image Search Mode** (NEW):
- Drag-and-drop or click to upload image
- Image preview with controls
- Reverse image search functionality
- Local database matching (with confidence scores)
- Web scraping integration for external sources
- Results displayed with match confidence percentages
- Source attribution (local vs web-scraped)
- Seamless transition between search modes

#### `LibraryPage.tsx`
User library management with:
- Tab navigation (Reading, Completed, Bookmarked, Plan to Read)
- Manga grid for each category
- Reading progress indicators
- Sort and filter options
- Empty state messages

#### `TrendingPage.tsx`
Trending content page with:
- Time filter (Today, This Week, This Month, All Time)
- Ranked list with numbers
- Trending score indicators
- Sort by various metrics
- Paginated results

#### `ProfilePage.tsx`
User profile dashboard with:
- Profile header (avatar, name, stats)
- Reading statistics (charts using Recharts)
- Achievement badges
- Reading history
- Favorite genres
- Activity timeline
- Settings access

#### `MangaDetailPage.tsx`
Detailed manga view with:
- Large cover image
- Title and metadata
- Rating and statistics
- Synopsis
- Genre tags
- Chapter list with reading status
- "Start Reading" / "Continue Reading" button
- "Add to Library" button
- Related recommendations

#### `ReaderPage.tsx`
Immersive reading experience with:
- **Reading Modes**:
  - Vertical scroll (webtoon style)
  - Single page (traditional manga)
  - Double page (spread view)
- **Controls**:
  - Auto-hiding top/bottom controls
  - Page navigation (prev/next)
  - Chapter selection
  - Settings panel (brightness, zoom, reading mode)
  - Fullscreen mode
  - Bookmark button
  - Chapter list drawer
- **Features**:
  - Progress indicator
  - Keyboard shortcuts (arrow keys)
  - Touch/swipe gestures (mobile)
  - Brightness adjustment
  - Zoom controls
  - Auto-save reading progress

---

## Image Search & Web Scraping

### Overview
The platform features advanced reverse image search capabilities with automatic web scraping fallback. Users can upload manga covers or panels to find matching titles, even if they're not in the local database.

### How It Works

#### 1. Image Upload
- **Drag-and-drop interface** - Intuitive upload area
- **File validation** - Ensures only images are accepted
- **Preview display** - Shows uploaded image before search
- **Supported formats** - JPG, PNG, WebP, GIF

#### 2. Reverse Image Search Process

**Step 1: Local Database Search**
- Image is processed locally first
- Compares against existing manga covers
- Uses image similarity algorithms (mock implementation)
- Returns results with confidence scores (0-100%)

**Step 2: Web Scraping (If No Local Matches)**
- Automatically triggered when local search yields no results
- Queries multiple external manga sources:
  - MangaDex
  - MyAnimeList
  - AniList
  - MangaUpdates
- Aggregates and deduplicates results
- Normalizes data format for consistency

#### 3. Result Display
- **Local matches** - Highlighted in green with "Local Database" badge
- **Web matches** - Highlighted in cyan with source attribution
- **Confidence scores** - Each result shows match percentage
- **Source tags** - Displays where data was found
- **Seamless integration** - Results displayed in familiar card grid

### Service Architecture

**File**: `src/app/services/mangaScraper.ts`

#### Core Functions

**`reverseImageSearch(imageFile, localManga)`**
- Main entry point for image search
- Converts image to base64
- Searches local database first
- Falls back to web sources if needed
- Returns array of `ImageSearchResult`

**`searchLocalDatabase(base64Image, localManga)`**
- Simulates image similarity matching
- In production: would use perceptual hashing or CNN features
- Returns matches with confidence scores

**`searchWebSources(base64Image)`**
- Queries external manga databases
- In production: calls backend APIs for:
  - SauceNAO (anime/manga identification)
  - Google Cloud Vision API
  - IQDB (Image Query Database)
  - Custom ML model for manga recognition

**`scrapeMangaFromUrl(url)`**
- Extracts manga data from specific URLs
- In production: uses Puppeteer/Playwright for dynamic content
- Parses HTML with Cheerio
- Implements rate limiting and retry logic

**`searchMultipleSources(query)`**
- Searches multiple manga sites in parallel
- Deduplicates results
- Ranks by relevance

**`extractMangaMetadata(html)`**
- Parses scraped HTML for manga data
- Extracts: title, author, rating, genres, synopsis, etc.

### Data Flow

```
User uploads image
    ↓
ImageSearch component
    ↓
reverseImageSearch()
    ↓
    ├─→ searchLocalDatabase() → Local matches found? → Display results
    │                                    ↓ No
    └─→ searchWebSources()
            ↓
        Query external APIs
            ↓
        Scrape manga sites
            ↓
        Extract & normalize data
            ↓
        Display results with source attribution
```

### Production Implementation Notes

**Backend Requirements**:
The current implementation is a frontend mock. For production, you'll need:

1. **Backend API Server**
   - Node.js/Express or similar
   - Handles image uploads
   - Performs reverse image search
   - Manages web scraping

2. **Image Recognition Services**
   - **Google Cloud Vision API** - General image recognition
   - **SauceNAO API** - Anime/manga-specific search
   - **Custom ML Model** - Trained on manga covers (TensorFlow/PyTorch)

3. **Web Scraping Infrastructure**
   - **Puppeteer/Playwright** - Headless browser for dynamic content
   - **Cheerio** - Fast HTML parsing
   - **Proxy rotation** - Avoid IP blocks
   - **Rate limiting** - Respect site limits
   - **Caching** - Store scraped data to reduce requests

4. **Database**
   - Store scraped manga data
   - Cache image search results
   - Index for fast lookups

5. **Security Considerations**
   - Input validation (file size, type)
   - Rate limiting on search endpoints
   - CORS configuration
   - API key management
   - Bot detection avoidance

### Example Production Architecture

```typescript
// Backend API endpoint
POST /api/search/image
  - Receives image file
  - Converts to multiple formats/sizes
  - Queries image recognition APIs
  - Scrapes external sources if needed
  - Returns unified results

// Service layer
class MangaScraperService {
  async reverseImageSearch(imageBuffer: Buffer): Promise<SearchResult[]> {
    // 1. Search local database
    const localResults = await this.searchLocal(imageBuffer);
    if (localResults.length > 0) return localResults;

    // 2. Use image recognition APIs
    const visionResults = await this.googleVision(imageBuffer);
    const sauceResults = await this.sauceNAO(imageBuffer);

    // 3. Scrape based on identified titles
    const scrapedData = await this.scrapeMultipleSources(
      [...visionResults, ...sauceResults]
    );

    return scrapedData;
  }

  async scrapeMultipleSources(sources: string[]): Promise<Manga[]> {
    const scrapers = [
      this.scrapeMangaDex,
      this.scrapeMAL,
      this.scrapeAniList,
    ];

    const results = await Promise.allSettled(
      scrapers.map(scraper => scraper(sources))
    );

    return this.deduplicateAndNormalize(results);
  }
}
```

### Legal & Ethical Considerations

**Web Scraping Compliance**:
- Respect `robots.txt` files
- Implement rate limiting
- Cache data to minimize requests
- Attribute sources properly
- Consider API usage where available
- Monitor for terms of service changes

**Data Usage**:
- Don't redistribute scraped content
- Use for search/discovery only
- Link back to original sources
- Respect copyright and licensing

---

## UI Component Library

### Radix UI Components (shadcn/ui style)
All UI components are built on Radix UI primitives with custom styling:

- **Accordion** - Expandable sections
- **Alert Dialog** - Modal confirmations
- **Avatar** - User profile pictures
- **Badge** - Labels and tags
- **Button** - Interactive buttons with variants
- **Card** - Content containers
- **Carousel** - Image/content sliders (Embla Carousel)
- **Checkbox** - Form checkboxes
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Contextual menus
- **Form** - Form components (React Hook Form)
- **Input** - Text inputs
- **Label** - Form labels
- **Popover** - Floating content
- **Progress** - Progress bars
- **Scroll Area** - Custom scrollable regions
- **Select** - Dropdown selections
- **Separator** - Visual dividers
- **Sheet** - Slide-out panels
- **Sidebar** - Navigation sidebars
- **Skeleton** - Loading placeholders
- **Slider** - Range inputs
- **Sonner** - Toast notifications
- **Switch** - Toggle switches
- **Tabs** - Tabbed interfaces
- **Table** - Data tables
- **Textarea** - Multi-line text inputs
- **Toggle** - Toggle buttons
- **Toggle Group** - Button groups
- **Tooltip** - Hover tooltips

### Component Utilities
- `cn()` function from `utils.ts` - Merges Tailwind classes using tailwind-merge and clsx
- Responsive hooks (e.g., `useMobile()`)

---

## Animation Strategy

### Motion (Framer Motion) Usage

**Card Animations**:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
```

**Hover Animations**:
```typescript
<motion.div
  whileHover={{ y: -8, scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

**Page Transitions**:
```typescript
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
```

**Staggered Animations**:
- Genre badges: `delay: index * 0.03`
- Manga cards: `delay: index * 0.05`
- List items: Progressive reveal

---

## Responsive Design

### Breakpoints (Tailwind defaults)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Layout Behavior

**Desktop (lg+)**:
- Sidebar visible (collapsible, 256px / 80px)
- Bottom navigation hidden
- Content offset by sidebar width
- Larger cards and spacing

**Tablet (md-lg)**:
- Bottom navigation visible
- No sidebar
- Medium-sized cards
- Optimized touch targets

**Mobile (<md)**:
- Bottom navigation visible
- Smaller cards
- Single column layouts
- Touch-optimized controls
- Reduced padding

### Component Responsiveness
- Cards: Responsive grid (1-6 columns)
- Typography: Fluid sizing
- Navigation: Transforms based on screen size
- Reader: Adapts controls for touch
- Spacing: Scales with screen size (`px-4 sm:px-6 lg:px-8`)

---

## Development Guidelines

### File Organization
- **Components**: Small, focused, reusable
- **Pages**: Composed of multiple components
- **Data**: Centralized in `mockData.ts`
- **Styles**: Theme in `theme.css`, component styles inline with Tailwind

### Naming Conventions
- **Components**: PascalCase (e.g., `MangaCard.tsx`)
- **Files**: Match component name
- **Props**: Descriptive, typed interfaces
- **CSS Classes**: Tailwind utilities, custom classes in `theme.css`

### Component Patterns

**Standard Component Structure**:
```typescript
import { ComponentProps } from "react";
import { motion } from "motion/react";

interface MyComponentProps {
  // Props here
}

export function MyComponent({ ...props }: MyComponentProps) {
  return (
    // JSX here
  );
}
```

**Conditional Styling**:
```typescript
className={cn(
  "base-classes",
  condition && "conditional-classes",
  props.className
)}
```

**Motion Animations**:
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
```

### State Management
Currently using React's built-in state management:
- `useState` for local state
- `useEffect` for side effects
- Props for data flow
- React Router for navigation state

**Future consideration**: Context API or Zustand for global state (user preferences, library data, reading progress)

### API Integration (Future)
When connecting to a real backend:

1. **Create API service layer**:
   - `src/services/api.ts` - API client
   - `src/services/manga.ts` - Manga endpoints
   - `src/services/user.ts` - User endpoints

2. **Use React Query (TanStack Query)**:
   - Data fetching and caching
   - Automatic refetching
   - Optimistic updates

3. **Authentication**:
   - JWT tokens
   - Protected routes
   - User context

4. **Replace mock data**:
   - Migrate from `mockData.ts` to API calls
   - Add loading states
   - Error handling

### Image Handling

**Current Approach** (Mock):
- Using Unsplash placeholder images
- Direct `<img>` tags with `onLoad` handlers
- Manual loading states

**Production Approach**:
- CDN-hosted images
- Multiple sizes/formats (WebP, AVIF)
- Lazy loading with Intersection Observer
- `ImageWithFallback` component for error states
- Blur-up placeholder technique

### Performance Optimization

**Current Optimizations**:
- Lazy loading images
- CSS-based animations (smooth)
- Efficient re-renders (React keys)
- Hide scrollbars for performance
- Debounced search inputs

**Future Optimizations**:
- Code splitting (React.lazy)
- Virtual scrolling for long lists
- Image optimization (next/image equivalent)
- Service worker caching
- Memoization (useMemo, useCallback)

---

## Build & Deployment

### Development
```bash
# Install dependencies
pnpm install

# Start dev server (already running in this environment)
# Vite dev server runs automatically
```

### Build (Not Applicable)
**Note**: This project uses a custom Figma Make environment. Standard Vite build commands are not used:
- Do NOT run `vite build` or `pnpm build`
- Do NOT create `index.html`
- Entrypoint is auto-generated at runtime (`__figma__entrypoint__.ts`)

### Environment Variables
Currently no environment variables required. For production:
- `VITE_API_URL` - Backend API URL
- `VITE_CDN_URL` - Image CDN URL
- `VITE_AUTH_DOMAIN` - Authentication domain

---

## Feature Roadmap

### Phase 1: Core Features (Completed ✓)
- [x] Basic routing and navigation
- [x] Home page with featured content
- [x] Search page with filters
- [x] **Reverse image search** (upload manga covers/panels to find matches)
- [x] **Web scraping integration** (automatic external source search)
- [x] Library management
- [x] Manga detail view
- [x] Reader with multiple modes
- [x] Profile page
- [x] Trending page
- [x] Responsive design
- [x] Dark theme with custom colors
- [x] Glassmorphism effects
- [x] Smooth animations

### Phase 2: Enhanced Features (Next)
- [ ] User authentication (sign up, login, logout)
- [ ] **Backend API for image search** (replace mock with real ML models)
- [ ] **Production web scraping service** (Puppeteer, proxy rotation, caching)
- [ ] **Image recognition APIs** (Google Vision, SauceNAO integration)
- [ ] Real backend integration (REST/GraphQL API)
- [ ] Reading progress sync across devices
- [ ] Advanced text search (full-text search, fuzzy matching)
- [ ] Comments and ratings
- [ ] Social features (follow users, share)
- [ ] Notifications (new chapters, updates)
- [ ] Offline reading (PWA)
- [ ] Bookmarks and notes
- [ ] Reading lists and collections

### Phase 3: Advanced Features (Future)
- [ ] Recommendation engine (ML-based)
- [ ] User achievements and badges
- [ ] Leaderboards and rankings
- [ ] Community forums
- [ ] Author/publisher profiles
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Content moderation tools

### Phase 4: Platform Features (Long-term)
- [ ] Mobile apps (React Native)
- [ ] Desktop app (Electron)
- [ ] Browser extension
- [ ] API for third-party integrations
- [ ] Subscription/payment system
- [ ] Content creator tools
- [ ] Advanced analytics
- [ ] A/B testing framework

---

## Testing Strategy (To Be Implemented)

### Unit Tests
- Component testing with Vitest + React Testing Library
- Test utilities and hooks
- Mock data generators

### Integration Tests
- Page-level testing
- User flow testing (search → detail → read)
- Navigation testing

### E2E Tests
- Playwright for critical user journeys
- Cross-browser testing
- Mobile testing

### Visual Regression Tests
- Chromatic or Percy
- Component snapshots
- Theme consistency

---

## Accessibility Considerations

### Current Implementation
- Semantic HTML elements
- Keyboard navigation (arrow keys in reader)
- Focus states on interactive elements
- Aria labels where appropriate (Radix UI default)
- Color contrast meets WCAG AA standards

### Future Improvements
- Screen reader optimization
- Keyboard shortcuts documentation
- Skip navigation links
- Reduced motion support (`prefers-reduced-motion`)
- High contrast mode
- Font size controls
- ARIA live regions for dynamic content
- Focus trap in modals

---

## SEO & Meta Tags (Future)

When deploying to production:

```typescript
// Each page should have:
<Helmet>
  <title>Page Title | MangaStream</title>
  <meta name="description" content="Page description" />
  <meta property="og:title" content="Page Title" />
  <meta property="og:image" content="Cover image URL" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>
```

- Dynamic meta tags per page
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Sitemap generation
- robots.txt configuration

---

## Browser Support

### Target Browsers
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Polyfills & Fallbacks
- CSS backdrop-filter (glassmorphism) - graceful degradation
- IntersectionObserver (lazy loading) - polyfill if needed
- CSS Grid - modern browsers only
- Flexbox - full support

---

## Known Limitations

### Current Limitations
1. **No Backend**: All data is mocked
2. **No Authentication**: User features are simulated
3. **No Real Images**: Using placeholder images
4. **No Data Persistence**: State lost on refresh
5. **Text Search is Client-Side Only**: No full-text search engine
6. **Image Search is Mocked**: Reverse image search simulates API calls; needs real ML backend
7. **Web Scraping is Simulated**: Returns mock data; needs production scraping infrastructure
8. **Limited Chapter Data**: Reader uses generated mock pages

### Technical Debt
- Add proper error boundaries
- Implement proper loading states
- Add retry logic for failed image loads
- Optimize bundle size (code splitting)
- Add unit tests
- Add E2E tests
- Document component APIs (Storybook)

---

## Code Examples

### Adding a New Page

1. **Create page component**:
```typescript
// src/app/pages/NewPage.tsx
export function NewPage() {
  return (
    <div className="container py-8">
      <h1>New Page</h1>
      {/* Content */}
    </div>
  );
}
```

2. **Add route**:
```typescript
// src/app/routes.tsx
import { NewPage } from "./pages/NewPage";

// Add to Layout children:
{ path: "new-page", Component: NewPage }
```

3. **Add navigation link**:
```typescript
// Add to DesktopSidebar.tsx and/or BottomNav.tsx
<Link to="/new-page">New Page</Link>
```

### Creating a Reusable Component

```typescript
// src/app/components/MyComponent.tsx
import { motion } from "motion/react";
import { cn } from "./ui/utils";

interface MyComponentProps {
  title: string;
  description?: string;
  className?: string;
  onAction?: () => void;
}

export function MyComponent({ 
  title, 
  description, 
  className,
  onAction 
}: MyComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-2xl bg-card p-6 glass",
        className
      )}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
      {onAction && (
        <Button onClick={onAction} className="mt-4">
          Action
        </Button>
      )}
    </motion.div>
  );
}
```

### Using the Component

```typescript
import { MyComponent } from "./components/MyComponent";

<MyComponent
  title="Example"
  description="This is a description"
  onAction={() => console.log("Clicked!")}
  className="max-w-md"
/>
```

---

## Troubleshooting

### Common Issues

**Issue**: Animations not working
- **Solution**: Check Motion import: `import { motion } from "motion/react"`

**Issue**: Tailwind classes not applying
- **Solution**: Ensure `theme.css` is imported and Tailwind is configured

**Issue**: Images not loading
- **Solution**: Check image URLs, add error handling with `ImageWithFallback`

**Issue**: Routing not working
- **Solution**: Ensure routes are defined in `routes.tsx` and `<Link>` is used for navigation

**Issue**: Mobile navigation not showing
- **Solution**: Check breakpoint classes (`lg:hidden` for mobile, `hidden lg:block` for desktop)

---

## Contributing Guidelines (For Team)

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Test locally
4. Create pull request
5. Code review
6. Merge to `main`

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(reader): add double page reading mode`
- `fix(search): correct filter logic for genres`
- `docs(readme): update installation instructions`

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Components are properly typed
- [ ] No console.log statements
- [ ] Responsive design tested
- [ ] Animations are smooth
- [ ] Accessibility considered
- [ ] Performance impact minimal

---

## Resources & References

### Official Documentation
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Motion (Framer Motion)](https://motion.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Material UI](https://mui.com/)

### Design Inspiration
- Netflix UI/UX
- Crunchyroll interface
- Material Design 3
- Modern streaming platforms

### Community
- React Discord
- Tailwind Discord
- GitHub Discussions

---

## License

[Specify your license here]

---

## Contact & Support

For questions, issues, or contributions:
- **Project Repository**: [Your repo URL]
- **Issue Tracker**: [Your issues URL]
- **Email**: [Your email]

---

**Last Updated**: 2026-05-31  
**Version**: 1.1.0  
**Status**: Development/MVP Complete + Image Search Feature  

## Quick Links
- 🖼️ **[Image Search Feature Documentation](./IMAGE_SEARCH_FEATURE.md)** - Detailed guide on reverse image search and web scraping
