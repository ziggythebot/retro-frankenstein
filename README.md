# Retro Frankenstein Tool 🧟

**Mega tool for creating retro versions of modern websites**

## What's Inside

### 1. Image Scraper (`image-scraper.js`)

Extracts all images from any website:
```bash
node image-scraper.js https://example.com/
```

Features:
- Scrapes `<img src="">` tags
- Finds background images from inline CSS
- Detects lazy-loaded images (`data-src`)
- Makes relative URLs absolute
- Exports JSON catalog

### 2. GeoCities Version (`geocities-version.html`)

Bureau Bonanza transformed into 90s GeoCities glory:
- 🌈 Rainbow gradient header with animation
- ✨ Sparkle cursor trail effect
- 📊 Visitor counter (always shows 999999)
- 📜 Scrolling marquee text
- 🎨 Comic Sans MS font
- 🔥 Under construction GIF
- 📖 Guestbook section
- 🔗 Webring navigation
- 🎪 Maximum chaos aesthetic

### 3. Neopets Version (`neopets-version.html`)

Bureau Bonanza as a Neopian guild/shop:
- 🥚 Negg pattern tile background
- 🐾 Kougra and Blumaroo mascots
- 🎨 Services as "Quest Items"
- ⚔️ Battledome weapon decorations
- 🏆 Guild frame styling
- 🎪 Shop banner announcements
- 🐣 Floating Shoyru companion
- 🌟 Gold and purple Neopets color scheme

## Usage

### View the Pages

```bash
# Open in browser
open geocities-version.html
open neopets-version.html
```

### Scrape Images from Any Site

```bash
node image-scraper.js https://bureaubonanza.com/
# Creates: bureau-bonanza-images.json

node image-scraper.js https://yoursite.com/
# Creates: scraped-images.json
```

### Customize for Other Sites

1. Run image scraper to get all assets
2. Copy `geocities-version.html` or `neopets-version.html`
3. Replace text content with scraped data
4. Add scraped images to appropriate sections
5. Adjust colors to match original brand

## Integration with Neopets Assets

Use the Neopets asset catalog from `/Users/ziggy/neopets-assets/`:

```javascript
const NeopetsAssetManager = require('../neopets-assets/asset-helpers');
const manager = new NeopetsAssetManager();

// Get assets for Neopets style page
const assets = manager.exportForRemotion('neopets', 'cute');

// Use in your Frankenstein generator
const bg = assets.background;
const pets = assets.pets;
const items = assets.items;
```

## Expansion Ideas

### More Retro Styles
- MySpace profile layout
- Space Jam 1996 aesthetic
- Windows 95 dialog boxes
- Angelfire template
- Tripod page builder style
- Early Blogger/LiveJournal

### Advanced Features
- CSS scraper (extract fonts, colors, layouts)
- Text content extractor
- Auto-categorizer (detect services/products/about sections)
- Template generator (create style based on scraped data)
- Remotion video generator (animate retro transformations)

### Automation
- CLI tool: `retro-frankenstein convert <url> --style geocities`
- Bulk converter for entire site
- Before/after comparison view
- Deploy to Netlify/Vercel

## Files

```
retro-frankenstein/
├── image-scraper.js          - Extract images from any website
├── geocities-version.html    - GeoCities style Bureau Bonanza
├── neopets-version.html      - Neopets style Bureau Bonanza
├── bureau-bonanza-images.json - Scraped image catalog
└── README.md                 - This file
```

## Examples

### Bureau Bonanza Transformations

**Original:** Clean, modern design studio portfolio
**GeoCities:** Maximum 90s chaos with rainbow gradients
**Neopets:** Neopia Central guild/shop aesthetic

### Style Characteristics

**GeoCities:**
- Under construction GIFs
- Hit counters
- Marquee text
- Comic Sans
- Guestbooks
- Webrings
- Sparkle trails
- Ridge/groove borders

**Neopets:**
- Negg pattern backgrounds
- Pet mascots
- Guild frames
- Shop banners
- Faerie magic references
- Quest/item metaphors
- Gold and purple colors
- Floating companions

## Next Steps

1. Build more style templates (MySpace, Space Jam, etc.)
2. Create CLI tool for easy conversion
3. Add Remotion templates for animated versions
4. Build web interface for live preview
5. Integrate with neopets-assets catalog
6. Add before/after comparison feature

---

**Status:** Ready to Frankenstein any website! 🧟⚡
