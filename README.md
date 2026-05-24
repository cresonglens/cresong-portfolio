# Song's Personal Portfolio

A zero-dependency, vanilla web portfolio showcasing photography, AIGC artwork, and creative coding projects. Built with HTML, CSS, and JavaScript — no frameworks, no build step.

## Live Demo

Open `index.html` in any browser, or serve it locally:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .

# Or just open index.html directly
```

## Features

- **Canvas light-reveal hero** — a dark overlay that clears with mouse movement, revealing the background image like a flashlight
- **3D parallax title** — heading tilts in perspective following cursor position
- **Typewriter animation** — cycles through 7 category names with a typing/deleting pattern
- **Gallery with category filtering** — 7 categories (Landscape, Portrait, Cityscape, Lifestyle, Architecture, AIGC, Vibe Coding) with smooth transitions
- **3D CSS flip cards** — resume entries flip on click to reveal details
- **Scroll-reveal animations** — IntersectionObserver-driven fade-in effects with staggered delays
- **Media modal** — click any image or video to view in a full-screen overlay
- **Responsive design** — 1-4 column grid adapts from mobile to large screens
- **Dark theme** — glassmorphism cards with gold (#EAB308) accents
- **Accessibility** — `aria` labels, keyboard navigation, `prefers-reduced-motion` support

## Project Structure

```
├── index.html          # Single-page application entry point
├── style.css           # All custom styles (~710 lines)
├── script.js           # All interactive logic (~830 lines)
├── images.json         # Auto-generated image manifest
├── generate-manifest.sh # Shell script to regenerate images.json
├── favicon.png         # Browser favicon
├── images/
│   ├── logo1.png, logo2.png, logo.svg   # Brand logos
│   ├── hero-bg/        # Hero background images
│   ├── about/          # About section photos, bio, and resume content
│   ├── landscape/      # Landscape photography
│   ├── portrait/       # Portrait photography
│   ├── cityscape/      # Cityscape photography
│   ├── lifestyle/      # Lifestyle photography
│   ├── architecture/   # Architecture projects (sub-grouped)
│   ├── aigc/           # AI-generated content (sub-grouped)
│   └── vibe-coding/    # Creative coding projects
└── .github/            # (optional) GitHub workflows
```

## Adding New Images

1. Drop images into the appropriate category folder under `images/`
2. Regenerate the manifest:

```bash
bash generate-manifest.sh
```

For categories with sub-groups (Architecture, AIGC), the script automatically detects the folder structure and creates grouped entries in `images.json`.

## Customization

- **Content**: Edit bio text in `images/about/content.js` and resume entries in `images/about/resume.js`
- **Styling**: Modify `style.css` — colors, animations, breakpoints are in a single file
- **Behavior**: `script.js` contains all interactive logic organized by section
- **Manifest**: Edit `images.json` directly or regenerate with the shell script

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3, Tailwind CSS (CDN) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Inter (Google Fonts) |
| Build | None — zero dependencies |

## Browser Support

All modern browsers (Chrome, Firefox, Safari, Edge). Requires support for IntersectionObserver, CSS Grid, CSS 3D transforms, and Canvas API.

## License

All rights reserved. Photography, artwork, and code are original works.
