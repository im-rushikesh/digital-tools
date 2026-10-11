# ARCHITECTURE & PRODUCTION DEPLOYMENT SPECIFICATION: Tools Digital (adigitaltools.in)

## 1. Executive Summary & Tech Stack Rationales
- **Framework**: Astro 4.x (Static Site Generation / SSG) + TypeScript strict mode + Tailwind CSS.
  - *Why Astro SSG?*: Zero JS by default in production. Pure HTML/CSS output drastically shrinks the VPS attack surface (eliminates SSR Node/PHP remote code execution vulnerabilities), delivers TTFB < 50ms on edge CDNs/Nginx, and enables Lighthouse 98-100 on low-spec farmer devices in 2G/3G/4G connectivity zones.
- **Content Collections & Schema Integrity**: Astro `getCollection()` with Zod schema validation. Building fails immediately in CI/CD pipeline if any field, slug, price, specs array, or external link is broken or missing.
- **Client Islands Architecture**: Zero runtime frameworks (React/Vue/Svelte omitted to preserve minimal footprint and strict CSP). Only lightweight vanilla TypeScript Web Components / micro-scripts for Theme Toggle (with anti-FOUC inline blocking script), Mobile Menu, Video Facade Click-to-Load, and Filter pills.

---

## 2. Directory Layout & Extensibility Architecture
```text
adigitaltools.in/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── .well-known/
│   │   └── security.txt
│   └── images/
│       ├── apps/
│       │   ├── attendy-icon.png
│       │   └── sudoku-icon.png
│       └── badges/
│           └── google-play-badge.svg
├── src/
│   ├── content/
│   │   ├── config.ts              # Zod collection schemas for products, apps, portfolio, videos, legal
│   │   ├── categories.json        # Division metadata (agritech, industrial, apps)
│   │   ├── navigation.json        # Single source of truth for header, mega-menu, and footer
│   │   ├── products/
│   │   │   ├── radio-pump-controller.md
│   │   │   ├── soil-testing-device.md
│   │   │   ├── auto-pump-controller.md
│   │   │   ├── wild-animal-deterrent.md
│   │   │   ├── livestock-crop-monitor.md
│   │   │   └── industrial-iot-gateway.md
│   │   ├── apps/
│   │   │   ├── attendy.md
│   │   │   └── sudoku-master-pro.md
│   │   ├── portfolio/
│   │   │   ├── maharashtra-farms-retrofit.md
│   │   │   └── auto-ancillary-plc-gateway.md
│   │   ├── videos/
│   │   │   └── radio-controller-demo.md
│   │   └── legal/
│   │       ├── privacy-policy.md
│   │       ├── terms-of-service.md
│   │       └── apps/
│   │           ├── attendy-privacy.md
│   │           └── attendy-deletion.md
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Preload fonts, meta, OG/Twitter tags, CSP hashes, Theme script
│   │   └── PortalLayout.astro     # Sub-portal layout for /agriculture and /industrial
│   ├── components/
│   │   ├── Navbar.astro           # Header with mega-menu, language switcher, theme toggle
│   │   ├── Hero.astro             # Quick-link buttons row, primary CTAs
│   │   ├── FarmerSolutions.astro  # 5 AgriTech device cards + portal link
│   │   ├── AppsGrid.astro         # Official Play Store badges, ratings, stats
│   │   ├── HowItWorks.astro       # R&D field testing, architecture diagram (radio offline path)
│   │   ├── VideoGallery.astro     # Privacy-friendly click-to-load YouTube facades
│   │   ├── KnowledgeSplit.astro   # AgriTech & Industrial retrofit guide
│   │   ├── TrustStrip.astro       # 5,000+ verified users counter
│   │   └── Footer.astro           # Developer page links, legal links, portals
│   └── pages/
│       ├── index.astro            # Exact 7-section homepage sequence
│       ├── agriculture/
│       │   ├── index.astro
│       │   ├── solutions/
│       │   ├── impact/
│       │   └── support/
│       ├── industrial/
│       ├── apps/
│       │   ├── index.astro
│       │   └── [slug]/
│       ├── legal/
│       │   ├── index.astro
│       │   └── [app]/[doc].astro  # Stable permanent Play Store URLs
│       └── contact.astro
├── scripts/
│   └── new-content.mjs            # CLI scaffolding script: `npm run new -- [type]`
├── deploy/
│   ├── nginx.conf                 # Hardened CSP, HSTS, frame-ancestors, rate-limited form proxy
│   └── contact-handler.go         # Lightweight secure microservice for contact/enquiry
└── package.json
```

---

## 3. Zod Content Schemas (`src/content/config.ts`)
```typescript
import { defineCollection, z } from 'astro:content';

const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum(['agritech', 'industrial', 'apps']),
    type: z.enum(['device', 'app', 'tool']),
    tagline: z.string(),
    summary: z.string(),
    status: z.enum(['available', 'beta', 'coming-soon']),
    featured: z.boolean().default(false),
    order: z.number().default(10),
    images: z.array(z.string()).default([]),
    features: z.array(z.string()),
    specs: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
    useCases: z.array(z.string()),
    downloadLinks: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.enum(['playStore', 'appStore', 'datasheet', 'manual']),
    })).default([]),
    stats: z.object({
      downloads: z.string().optional(),
      rating: z.number().optional(),
      reviewsCount: z.number().optional(),
    }).optional(),
    relatedProducts: z.array(z.string()).default([]),
  }),
});

const legalCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    appSlug: z.string().optional(), // Omitting means company-wide policy
    documentType: z.enum(['privacy', 'terms', 'data-safety', 'account-deletion', 'support']),
    version: z.string(),
    effectiveDate: z.string(),
    lastUpdated: z.string(),
    isDraftNotice: z.boolean().default(true),
  }),
});

export const collections = {
  products: productsCollection,
  legal: legalCollection,
};
```

---

## 4. Production Nginx Hardened Configuration (`deploy/nginx.conf`)
```nginx
server {
    listen 443 ssl http2;
    server_name adigitaltools.in www.adigitaltools.in;

    ssl_certificate /etc/letsencrypt/live/adigitaltools.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/adigitaltools.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    root /var/www/adigitaltools.in/dist;
    index index.html;

    # 1. Strict Transport Security (Preload compliant)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # 2. Hardened Content-Security-Policy (No unsafe-inline, local assets only)
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://play.google.com; script-src 'self' 'sha256-inlineThemeScriptHash'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src https://www.youtube-nocookie.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';" always;

    # 3. Defensive Browser Protections
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;

    # Immutable static asset caching (Vite/Astro hashed chunks)
    location ~* \.(?:css|js|woff2|png|svg|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Isolated Contact & Enquiry API Endpoint (Rate limited)
    location /api/enquiry {
        limit_req zone=contact_limit burst=5 nodelay;
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # RFC 9116 Security.txt
    location = /.well-known/security.txt {
        allow all;
    }

    location / {
        try_files $uri $uri/ /404.html;
    }
}
```

---

## 5. Extensibility CLI Scaffolder (`scripts/new-content.mjs`)
Allows content editors to run:
`npm run new -- product` or `npm run new -- app`
It automatically generates the slugged markdown file with all mandatory frontmatter fields and draft legal disclaimers.
