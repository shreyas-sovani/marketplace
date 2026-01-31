# Getting Started with Redesigned Frontend

## Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
```

This will install all required packages including:
- `lucide-react` - Icon library
- `@radix-ui/react-slot` - UI component utilities
- `class-variance-authority` - Component variants
- `clsx` and `tailwind-merge` - Utility helpers

### 2. Start Development Server
```bash
npm run dev
```

The dev server will start at `http://localhost:5173` (or another port if 5173 is in use).

### 3. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

---

## Project Structure

```
client/
├── src/
│   ├── App.tsx                 # Main app with landing page + routing
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles (updated)
│   ├── components/
│   │   └── MarketTicker.tsx    # Redesigned market ticker
│   ├── pages/
│   │   └── SellerDashboard.tsx # Redesigned seller dashboard
│   └── types/
│       └── marketplace.ts      # Type definitions
├── public/
│   └── index.html
├── tailwind.config.js          # Updated with design system
├── package.json                # Updated dependencies
├── tsconfig.json
├── vite.config.ts
└── postcss.config.js
```

---

## Key Files Modified

### 1. `tailwind.config.js`
Added design system configuration:
- Custom color palette (primary-bg, secondary-bg, accent, etc.)
- Typography fonts (Space Grotesk, Playfair Display, Inter, Share Tech)
- Extended spacing and border radius
- Custom animations

### 2. `src/index.css`
Added:
- Google Fonts imports for all typography fonts
- Base layer styles for semantic HTML
- Component layer utilities (.card, .btn-primary, etc.)
- Global animations and transitions

### 3. `package.json`
Added dependencies:
```json
{
  "lucide-react": "^0.263.0",
  "@radix-ui/react-slot": "^2.0.2",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0"
}
```

### 4. `src/App.tsx`
Complete redesign with:
- Landing page (hero, features, editorial, CTA, footer)
- Navigation component
- Agent terminal page
- Routing setup

### 5. `src/components/MarketTicker.tsx`
Modernized with:
- Design system colors
- Lucide icons
- Better typography
- Improved layout

### 6. `src/pages/SellerDashboard.tsx`
Complete redesign with:
- Modern form layout
- Live earnings animation
- Product management
- Dashboard stats

---

## Environment Setup

### Requirements
- Node.js 16+ 
- npm 7+ or yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### .env Files (if needed)
The app uses existing backend at `/api/*` endpoints. No additional env vars needed for frontend.

---

## Architecture Overview

### Pages / Routes

```
/                    Landing Page
├── Hero Section
├── Features Section
├── Editorial Section
├── CTA Section
└── Footer

/terminal            Agent Terminal
├── Navigation
├── Header with budget
├── 3-column layout
│   ├── Query input & results
│   ├── Neural log (live)
│   └── Market ticker (bottom)

/sell                Seller Dashboard
├── Navigation
├── 3-column layout
│   ├── Publish form
│   ├── Live earnings
│   ├── My products
│   ├── Stats
│   └── Seller tips
```

### Component Hierarchy

```
App
├── Navigation (shared)
├── Routes
│   ├── LandingPage
│   │   ├── HeroSection
│   │   ├── FeaturesSection
│   │   ├── EditorialSection
│   │   ├── CTASection
│   │   └── Footer
│   ├── AgentTerminal
│   │   ├── BudgetDisplay
│   │   ├── LogEntryComponent
│   │   ├── TransactionComponent
│   │   └── MarketTicker
│   └── SellerDashboard
│       ├── PriceSlider
│       ├── LiveEarningsCard
│       ├── MyProductsList
│       └── (various UI components)
└── MarketTicker (fixed bottom)
```

---

## Styling Conventions

### Color Usage
- **Accent (#7F5A83)** - CTAs, buttons, highlights, hover states
- **Primary BG (#020202)** - Main page background
- **Secondary BG (#081A28)** - Section backgrounds (used for card surfaces as `secondary-bg`)
- **Card BG (#081A28)** - Card and elevated surfaces (mapped to `secondary-bg`)
- **Border (#464668)** - Borders, dividers, subtle elements
- **Text (#A188A6)** - Secondary content
- **Muted Text (#9DA2AB)** - Tertiary content

### Typography Usage
- **Space Grotesk** - All headings, titles, buttons, labels
- **Inter** - Body text, UI text, descriptions
- **Playfair Display/EB Garamond** - Editorial, long-form content
- **Share Tech** - Technical content, IDs, prices

### Spacing
Use Tailwind's built-in spacing (p-, m-, gap-, etc.) with values:
- `xs` (1.5rem), `sm` (2rem), `md` (2.5rem), `lg` (3rem), `xl` (4rem)

### Border Radius
- Cards: `rounded-lg` (0.75rem)
- Buttons: `rounded-lg` (0.75rem)
- Small elements: `rounded-md` (0.625rem)

---

## Common Tasks

### Add a New Page
```tsx
// 1. Create new file in src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div className="min-h-screen bg-primary-bg pt-20">
      <Navigation />
      {/* Your content */}
    </div>
  )
}

// 2. Add route to App.tsx
<Route path="/new-page" element={<NewPage />} />
```

### Add a New Component
```tsx
// src/components/NewComponent.tsx
export function NewComponent() {
  return (
    <div className="card p-6">
      <h3 className="font-space-grotesk font-bold text-white">Title</h3>
      {/* Content */}
    </div>
  )
}
```

### Use Design System Colors
```tsx
// Backgrounds
className="bg-primary-bg"    // Main background
className="bg-secondary-bg"  // Section background
className="bg-secondary-bg"  // Card background (use secondary-bg)

// Borders
className="border border-border"       // Standard border
className="border border-border/20"    // Subtle border
className="border border-accent/30"    // Accent border

// Text
className="text-white"           // Headings
className="text-secondary-text"  // Secondary text
className="text-muted-text"      // Muted text

// Accent (for highlights, buttons, CTAs)
className="bg-accent hover:bg-accent-hover"
className="text-accent"
className="border-accent"
```

### Use Lucide Icons
```tsx
import { Icon, ArrowRight, Zap, Brain } from 'lucide-react'

// Small icon
<Icon className="w-4 h-4 text-accent" />

// Medium icon
<Icon className="w-5 h-5 text-white" />

// Large icon
<Icon className="w-6 h-6 text-accent" />

// With text
<button className="flex items-center gap-2">
  <ArrowRight className="w-4 h-4" />
  Click Me
</button>
```

### Create a Card Component
```tsx
<div className="card p-6 space-y-4">
  <h3 className="font-space-grotesk font-bold text-white flex items-center gap-2">
    <Icon className="w-5 h-5 text-accent" />
    Title
  </h3>
  <p className="text-secondary-text">Content</p>
</div>
```

### Create a Button
```tsx
// Primary Button
<button className="btn-primary">
  Click Me
</button>

// Secondary Button
<button className="btn-secondary">
  Click Me
</button>

// With icon
<button className="btn-primary flex items-center gap-2">
  <Icon className="w-4 h-4" />
  Click Me
</button>
```

---

## Testing & Validation

### Browser DevTools
- Chrome DevTools: F12
- Firefox DevTools: F12
- Safari DevTools: Cmd+Option+I

### Responsive Testing
```
Mobile:   iPhone 12 (390x844)
Tablet:   iPad Pro (1024x1366)
Desktop:  1920x1080
```

### Performance
- Lighthouse score target: 90+
- Core Web Vitals: Good
- Bundle size: < 500KB gzipped

### Type Checking
```bash
npm run build  # TypeScript check included
```

### Linting (if configured)
```bash
npm run lint  # Run linter
```

---

## Troubleshooting

### Lucide Icons Not Loading
- Make sure `npm install` was run
- Check `node_modules/lucide-react` exists
- Restart dev server (`npm run dev`)

### Tailwind Classes Not Working
- Ensure `tailwind.config.js` has correct content paths
- Check that classes use correct format (e.g., `bg-accent` not `bg-[#7F5A83]`)
- Restart dev server

### Fonts Not Loading
- Check Google Fonts import in `index.css`
- Verify font names match in `tailwind.config.js`
- Check browser network tab for font requests

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check TypeScript errors: `npm run build`

---

## Performance Tips

### Optimize Images
- Use WebP format where possible
- Lazy load images: `<img loading="lazy" />`
- Optimize SVGs with SVGO

### Code Splitting
- Routes are automatically code-split by React Router
- Dynamic imports for large components

### CSS Optimization
- Tailwind CSS is tree-shaken in production
- Only used classes are included in final CSS
- Production CSS is typically 20-30KB gzipped

---

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

### Environment Setup
- No environment variables needed for frontend
- Backend API calls use `/api/*` paths (must be configured in reverse proxy)

---

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari 14+, Chrome Android)

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/
- **React**: https://react.dev/
- **React Router**: https://reactrouter.com/

---

## Support

For issues or questions:
1. Check the DESIGN_REFERENCE.md for component patterns
2. Review the DESIGN_IMPLEMENTATION.md for system overview
3. Check browser console for errors
4. Review TypeScript errors: `npm run build`

---

*Happy coding! 🚀*
