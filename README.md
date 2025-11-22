# Flow8 - Sports Science PWA

A production-grade Progressive Web App for sports science, built with modern web technologies.

## 🚀 Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Routing**: React Router v6
- **Testing**: Vitest + Testing Library
- **PWA**: vite-plugin-pwa with Workbox

## 📋 Prerequisites

- **Node.js**: >= 20.11.0 (see `.nvmrc`)
- **Package Manager**: pnpm (v8+)

To use the correct Node version:
```bash
nvm use
```

## 🛠️ Development

### Install dependencies
```bash
pnpm install
```

### Start development server
```bash
pnpm dev
```

### Build for production
```bash
pnpm build
```

### Preview production build
```bash
pnpm preview
```

### Run tests
```bash
pnpm test
```

### Type checking
```bash
pnpm typecheck
```

### Linting & Formatting
```bash
pnpm lint
pnpm format
```

## 🏗️ Project Structure

```
src/
├── app/
│   └── providers/         # Context providers (Theme, etc.)
├── components/
│   ├── ui/               # shadcn/ui components
│   └── common/           # Shared components (Header, Footer, etc.)
├── pages/                # Route pages
├── routes/               # Routing configuration
├── lib/                  # Utilities and clients
├── styles/               # Global styles
└── tests/                # Test files
```

## 🏥 Health Checks

### Runtime Health Check
Navigate to `/health` to see application status and version:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2025-10-04T..."
}
```

### Static Health Check
The build process generates `public/health.json` with:
- Application status
- Version from package.json
- Build timestamp

This file can be used by monitoring systems and load balancers.

## ♿ Accessibility

- **Skip Link**: Jump directly to main content
- **Focus Management**: Visible focus rings for keyboard navigation
- **ARIA Landmarks**: Semantic HTML with proper roles
- **Theme Preferences**: Respects system color scheme

## 📱 Progressive Web App

### Features
- **Installable**: Add to home screen
- **Offline Ready**: Service worker with app shell caching
- **Fast**: Optimized bundle with code splitting
- **Responsive**: Perfect rendering from 360px to 4K

### PWA Configuration
- Manifest: `public/manifest.json`
- Icons: 192x192 and 512x512 (maskable)
- Service Worker: Auto-updates on new versions

## 🧪 Testing

Run the full test suite:
```bash
pnpm test
```

Tests include:
- Component rendering
- Accessibility features
- Routing behavior
- Build-time asset verification

## 📊 Lighthouse Scores

Target scores (mobile):
- **Performance**: >= 95
- **Accessibility**: >= 95
- **Best Practices**: >= 95
- **SEO**: >= 90
- **PWA**: Passing

Run Lighthouse audit:
```bash
pnpm build && pnpm preview
# Open Chrome DevTools > Lighthouse > Generate Report
```

## 🔐 Security

- TypeScript strict mode with `noUncheckedIndexedAccess`
- ESLint with security best practices
- Environment variables for sensitive data
- RLS-ready architecture (Step 2)

## 🔮 Roadmap

### Step 1: Foundation ✅
- Project scaffolding
- PWA setup
- Design system
- Testing infrastructure

### Step 2: Backend Integration (Next)
- Supabase connection
- Row Level Security (RLS) policies
- Authentication system
- Database schema

### Future Steps
- User profiles
- Data visualization
- Real-time features
- Advanced analytics

## 🤝 Contributing

This project uses:
- **ESLint** for code quality
- **Prettier** for formatting
- **Husky** for pre-commit hooks
- **GitHub Actions** for CI/CD

## 📄 License

Copyright © 2025 Flow8. All rights reserved.

---

**Next Step**: Ready to connect Supabase with Row Level Security? See Step 2 documentation.
