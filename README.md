# 🏢 Hygeia Enterprise Digital Platform & Operations Engine
### Montero Enterprises Inc. dba Hygeia — Silicon Valley Commercial Facility Solutions
**Heritage**: 35 Years Serving Silicon Valley · **State Certifications**: CA DVBE `#2054658` · DIR `#JS-LR-100 132 4606`

---

## 📊 MVP Status & Production Maturity Report

### 🎯 Is this an MVP or not yet?
**Verdict: This platform has significantly surpassed a Minimum Viable Product (MVP).**  
It is currently a **Production-Ready Dual-Enterprise Web Platform & Real-Time Operations Suite** featuring:
1. **Dual Multi-Enterprise Frontends**: 110+ production-grade HTML5/CSS3/ES6 pages across **Hygeia Power Wash Solutions (PWS)** and **Hygeia Commercial Janitorial Services**.
2. **Live Encrypted Backend**: Production Node.js REST API running in PM2 cluster mode on a Hostinger VPS (`2.25.90.226`), reverse-proxied behind Nginx with automated Let's Encrypt TLS 1.3 SSL (`https://2.25.90.226.sslip.io/api`).
3. **Relational Database**: Embedded SQLite database (`hygeia.db`) with tables for leads, clients, work orders, route stops, invoices, and administrative credentials.
4. **Cryptographic Authentication**: PBKDF2 (`10,000 iterations`, `SHA-512`, unique `salt`) password hashing with tamper-resistant HMAC-SHA256 session tokens.
5. **Interactive Operations Dashboards**: Multi-enterprise Admin Command Center (`admin.html`) and authenticated Customer Self-Service Portals (`portal.html`) on both websites.
6. **Programmatic SEO & Content Matrix**: 33 long-form technical guides, 31 localized municipal landing pages, full Schema.org JSON-LD microdata, XML sitemaps, and `llms.txt` AI search indexes.

---

### 📋 Feature Matrix: Completed vs. Pending Roadmap

| Functional Area | Status | Implemented Capabilities | Pending / Future Roadmap Enhancements |
| :--- | :---: | :--- | :--- |
| **PWS Exterior Platform** | ✅ **Live** | 48 pages, dual B2C/B2B flows, 14 city landing pages, 21 pSEO guides, instant quote calculator, trash day countdown. | 3D WebGL / Canvas "Scroll-World" cinematic animation engine. |
| **Commercial Janitorial** | ✅ **Live** | 62 pages, 8 service verticals, 8 industry sectors, 17 city hubs, 12 B2B RFP guides, careers portal. | Integrated digital signature PDF generator for on-site facility contracts. |
| **Customer Portal** | ✅ **Live** | Real-time authentication, profile management, subscription details, before/after wash photo verification, work order intake. | Self-serve credit card updating via embedded Stripe Elements. |
| **Admin Command Center** | ✅ **Live** | Multi-enterprise overview, PWS route dispatch & driver simulator, tonight's janitorial cleaning roster, live leads stream. | One-click GPS turn-by-turn route optimization export (Mapbox / Google Fleet API). |
| **API & Database Engine** | ✅ **Live** | Express REST API, SQLite database with foreign keys, PBKDF2 authentication, seed accounts, CORS & Nginx reverse proxy. | Webhook listeners for automated CRM sync (HubSpot / Salesforce). |
| **Deployment & Security** | ✅ **Live** | Hostinger VPS (`2.25.90.226`), PM2 cluster daemon, Let's Encrypt SSL (`sslip.io`), Vercel edge proxy rewrite rules. | Automated daily S3/R2 database backup snapshot cron job. |
| **Payment Gateway** | ⏳ *Optional* | Simulated transparent billing, tiered rate cards ($35/mo vs $65 one-time), invoice generation. | Live Stripe Webhook / ACH billing connector (`stripe-node`). |
| **SMS / Push Alerts** | ⏳ *Optional* | UI event triggers for "En Route" and "Completed" status. | Live Twilio / Telnyx SMS dispatch notification webhooks. |

---

## 🌟 Multi-Enterprise Architecture

```
                                  ┌─────────────────────────────────────────────────┐
                                  │           MONTERO ENTERPRISES INC.              │
                                  │      35 Years Serving Silicon Valley            │
                                  │  CA DVBE #2054658 · DIR #JS-LR-100 132 4606     │
                                  └───────────────────────┬─────────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┴────────────────────────────────────┐
                    │                                                                          │
                    ▼                                                                          ▼
┌──────────────────────────────────────┐                                   ┌──────────────────────────────────────┐
│  HYGEIA POWER WASH SOLUTIONS         │                                   │  HYGEIA JANITORIAL SERVICES          │
│  Directory: /website                 │                                   │  Directory: /jswebsite               │
│  Target: B2C Residential & B2B Comm  │                                   │  Target: B2B Commercial Facilities   │
│  Production URL: hygeiapwsweb.vercel │                                   │  Production URL: hygeiajs.vercel     │
├──────────────────────────────────────┤                                   ├──────────────────────────────────────┤
│ • 48 High-Performance Pages         │                                   │ • 62 High-Performance Pages         │
│ • Electric Cyan & Hydro Blue Theme   │                                   │ • Silicon Valley Navy & Gold Theme   │
│ • Curbside Trash Bin Subscriptions   │                                   │ • 8 Core Commercial Services         │
│ • Commercial Hot-Water Degreasing    │                                   │ • 8 Industry Sector Protocols        │
│ • 14 Municipal Trash Day Clusters    │                                   │ • 17 Bay Area City Landing Pages     │
│ • 21 Commercial & Resi Blog Guides   │                                   │ • 12 Keyword-Dense B2B Guides        │
│ • EPA Wastewater Recovery Reclaim    │                                   │ • Free Facility Site Walk RFP Engine │
└──────────────────┬───────────────────┘                                   └──────────────────┬───────────────────┘
                   │                                                                          │
                   └───────────────────────────────────┬──────────────────────────────────────┘
                                                       │
                                                       ▼
                                ┌──────────────────────────────────────────────┐
                                │     SHARED ENTERPRISE OPERATIONS SUITE       │
                                ├──────────────────────────────────────────────┤
                                │ 👤 Client Self-Service Portal (portal.html)  │
                                │ ⚡ Unified Admin Command Center (admin.html) │
                                │ 🔄 Cryptographic Auth (PBKDF2 + HMAC-SHA256) │
                                └──────────────────────┬───────────────────────┘
                                                       │
                                                       ▼
                                ┌──────────────────────────────────────────────┐
                                │   HOSTINGER VPS PRODUCTION API & DATABASE    │
                                │   IP: 2.25.90.226 (Port 5000 / PM2 Cluster)  │
                                │   SSL: https://2.25.90.226.sslip.io/api      │
                                │   Database: SQLite (hygeia.db)               │
                                └──────────────────────────────────────────────┘
```

---

## 📂 Repository Directory Structure

```
hygeiaPWS/
├── api/                             # 🌐 VERCEL SERVERLESS API GATEWAY PROXY
│   └── [...path].js                 # Edge rewrite proxy forwarder to Hostinger VPS
│
├── backend/                         # ⚙️ PRODUCTION NODE.JS REST API & DATABASE
│   ├── server.js                    # Express app, CORS, security middleware, routing
│   ├── db.js                        # SQLite database engine, schema migration & seed data
│   ├── deploy.sh                    # Automated VPS build and PM2 restart script
│   ├── utils/
│   │   └── auth.js                  # PBKDF2 SHA-512 hashing & HMAC-SHA256 session tokens
│   ├── routes/
│   │   ├── auth.js                  # Register, Login, Admin Login, Profile inspection
│   │   ├── leads.js                 # Unified leads intake, status updates, filtering
│   │   ├── portal.js                # Customer portal dashboard, work order requests
│   │   └── admin.js                 # Executive metrics, dispatch controller, team rosters
│   └── data/
│       └── hygeia.db                # Persistent SQLite database file
│
├── website/                         # 🚛 HYGEIA POWER WASH SOLUTIONS (48 Pages)
│   ├── index.html                   # Dual B2C/B2B Homepage with Interactive Bin Calculator
│   ├── commercial-pressure-washing.html # Commercial Flatwork, Garages & Dumpster Pads
│   ├── residential-pressure-washing.html # Driveways, Patios, Siding & Soft Washing
│   ├── bin-cleaning.html            # Monthly ($35/mo) vs One-Time ($65) Sanitizing
│   ├── service-areas.html           # Service Directory Index
│   ├── service-areas/               # 14 Hyper-Local Municipal Landing Pages
│   │   ├── san-jose.html, sunnyvale.html, santa-clara.html, palo-alto.html,
│   │   ├── mountain-view.html, los-gatos.html, saratoga.html, cupertino.html,
│   │   ├── menlo-park.html, redwood-city.html, san-carlos.html, san-mateo.html,
│   │   └── milpitas.html, foster-city.html
│   ├── about.html                   # 35-Year Heritage, Andy Montero Bio & DVBE Specs
│   ├── contact.html                 # Instant Quote Request & Commercial Dispatch
│   ├── faq.html                     # Power Washing & Bin Cleaning Knowledge Base
│   ├── portal.html                  # Authenticated Customer Subscription Dashboard (Electric Cyan Theme)
│   ├── admin.html                   # Multi-Enterprise Operations Command Center (Electric Cyan Theme)
│   ├── blog.html                    # 21 Commercial & Residential Pressure Washing Guides
│   ├── blog/                        # 21 Individual SEO/pSEO Article Pages
│   ├── assets/
│   │   ├── css/ (main.css, dashboards.css)
│   │   ├── js/  (main.js, admin.js, portal.js)
│   │   └── img/ (High-resolution photography, graphics, brand assets)
│   ├── api/                         # Local Vercel Edge API proxy fallback
│   ├── sitemap.xml                  # 49 Search Engine URLs
│   ├── robots.txt                   # Search crawler directives
│   └── vercel.json                  # Clean URLs & production routing
│
├── jswebsite/                       # 🏢 HYGEIA JANITORIAL SERVICES (62 Pages)
│   ├── index.html                   # High-Conversion B2B Commercial Cleaning Homepage
│   ├── services.html                # Commercial Janitorial Capabilities Hub
│   ├── services/                    # 8 Specialized Service Landing Pages
│   │   ├── janitorial-services.html # Nightly & Weekly Office Cleaning
│   │   ├── day-porter-services.html # Daytime Restroom & Lobby Attendants
│   │   ├── floor-care.html          # VCT Stripping, Waxing & High-Speed Buffing
│   │   ├── window-washing.html      # Interior & Exterior Architectural Glazing
│   │   ├── carpet-cleaning.html     # Commercial Hot Water Steam Extraction
│   │   ├── pressure-washing.html    # Building Exterior & Flatwork Deep Clean
│   │   ├── construction-cleanup.html# Rough, Final & Touch-Up Post-Construction Clean
│   │   └── emergency-cleaning.html  # 24/7 Flood & Hazardous Spill Rapid Response
│   ├── industries.html              # Industry Capabilities Hub
│   ├── industries/                  # 8 Industry Sector Vertical Landing Pages
│   │   ├── office-cleaning.html     # High-Growth Tech Campuses & R&D Offices
│   │   ├── healthcare-facilities.html# CDC List N & HIPAA Medical Clinics
│   │   ├── property-management.html # Class A Multi-Tenant Business Parks
│   │   ├── schools-education.html   # Non-Toxic Child-Safe Daycare & School Cleaning
│   │   ├── restaurants-bars.html    # Health Inspection Commercial Kitchen Degreasing
│   │   ├── retail-stores.html       # Showrooms & High-Traffic Retail Floors
│   │   ├── museums-galleries.html   # Security-Vetted Cultural Venue Detailing
│   │   └── construction-sites.html  # Industrial Plants & Active Development Sites
│   ├── service-areas.html           # 17 Bay Area City Hub
│   ├── service-areas/               # 17 Localized Landing Pages (Santa Clara, San Jose, etc.)
│   ├── about.html                   # Combined Heritage, Andy Montero Bio & 4 Standards
│   ├── blog.html                    # 12 Keyword-Dense Commercial Facility Guides
│   ├── blog/                        # 12 Individual High-Ranking SEO Article Pages
│   ├── contact.html                 # Free Facility Site Walk RFP Intake Form
│   ├── faqs.html                    # Commercial Janitorial B2B FAQ Center
│   ├── apply.html                   # Janitorial Tech & Floor Specialist Careers Portal
│   ├── portal.html                  # Authenticated Facility Client Dashboard (Corporate Navy & Gold Theme)
│   ├── admin.html                   # Multi-Enterprise Operations Command Center (Corporate Navy & Gold Theme)
│   ├── assets/
│   │   ├── img/ (janitorial logos, branded uniforms, facility photography)
│   │   ├── css/ (main.css, dashboards.css)
│   │   └── js/  (main.js, admin.js, portal.js)
│   ├── api/                         # Local Vercel Edge API proxy fallback
│   ├── sitemap.xml                  # 63 Production URLs
│   ├── robots.txt                   # Search crawler directives
│   └── vercel.json                  # Production Edge configuration
│
└── Hygeia_Executive_Briefing_2026.pdf # Official Executive Operations & Growth Blueprint
```

---

## 🔐 Cryptographic Authentication & Security Architecture

The platform uses an enterprise authentication engine implemented in pure Node.js `crypto` with zero external vulnerabilities:

1. **Password Hashing (PBKDF2)**:
   - Algorithm: `PBKDF2` with `SHA-512`
   - Iteration Count: `10,000 iterations`
   - Salt: Cryptographically random 16-byte hex salt per user
   - Format: `salt:derivedKeyHex`
2. **Session Token System**:
   - Format: `base64(userId:role:expiresAt).HMAC-SHA256(payload, secret)`
   - Storage: Client `localStorage` (`hygeia_client_token` & `hygeia_admin_token`)
   - Expiration: Configurable sliding 7-day session validity
3. **Authorized Production Seed Accounts**:

| Role | Account Email | Password | Initial Access & Scope |
| :--- | :--- | :--- | :--- |
| **Enterprise Superadmin** | `admin@hygeia.com` | `HygeiaAdmin2026!` | Full access to Multi-Enterprise Admin Command Center (`admin.html`), route dispatcher, leads stream, revenue metrics. |
| **PWS Client Demo** | `client@hygeiapws.com` | `Hygeia2026!` | PWS Customer Portal (`website/portal.html`): 3 Cans Monthly Subscription ($45/mo), curbside calendar, before/after photos. |
| **Janitorial Client Demo** | `client@valleyhealth.org` | `Hygeia2026!` | Janitorial Portal (`jswebsite/portal.html`): Medical Clinic Facility Contract ($4,850/mo), CDC List N compliance audits. |

---

## 📡 REST API Reference

**Base URL**: `https://2.25.90.226.sslip.io/api` (or `/api` via Vercel Edge Proxy)

### Authentication Endpoints
- `POST /api/auth/register` — Create new customer account with service address and subscription details.
- `POST /api/auth/login` — Authenticate client email/password; returns HMAC session token and user profile.
- `POST /api/auth/admin-login` — Authenticate administrative personnel for dispatch & operations access.
- `GET /api/auth/me` — Inspect authenticated session token and return live user record.

### Client Portal Endpoints
- `GET /api/portal/dashboard` — Fetch authenticated customer summary (plan details, active work orders, past invoices, next service date).
- `POST /api/portal/request-service` — Submit on-demand work order request (e.g. extra bin sanitization, emergency degreasing).
- `PUT /api/portal/profile` — Update contact phone, billing address, or service preferences.

### Admin Command Center Endpoints
- `GET /api/admin/metrics` — Aggregate financial KPI metrics (Total MRR, PWS MRR, Janitorial MRR, Active Accounts).
- `GET /api/leads` — Retrieve real-time stream of inbound leads with filter support (`?type=pws|janitorial`).
- `PATCH /api/leads/:id/status` — Advance lead stage (`new` ➔ `contacted` ➔ `proposal_sent` ➔ `closed_won`).
- `GET /api/admin/route-stops` — Live PWS truck route stops with driver simulator support.
- `PATCH /api/admin/route-stops/:id/status` — Update stop status (`pending` ➔ `en_route` ➔ `completed`).

---

## 🎨 Design Philosophy & Theming

### 1. Hygeia Power Wash Solutions (PWS)
- **Primary Aesthetic**: Electric Aqua & Hydro Blue (`#0090FF`, `#00B4D8`, `#0284C7`), Deep Slate (`#0B192C`), crisp ice-glass cards, and high-pressure water glow accents.
- **Atmosphere**: High-velocity, industrial, sanitary, energetic, California eco-clean.
- **Portal & Admin Styling**: Crisp slate headers, electric blue gradient buttons (`linear-gradient(135deg, #0090FF 0%, #00B4D8 100%)`), cyan status badges.

### 2. Hygeia Commercial Janitorial Services
- **Primary Aesthetic**: Silicon Valley Corporate Navy (`#0A2533`), Medical Grade Emerald (`#059669`), Warm Heritage Gold accents (`#D4AF37`).
- **Atmosphere**: Executive, institutional, Class A property management, trusted 35-year legacy.
- **Portal & Admin Styling**: Deep navy cards, gold emblems, structured tabular enterprise views.

---

## 🌊 Future Vision: 3D "Scroll-World" Cinematic Experience for PWS

To establish Hygeia PWS as the most visually captivating exterior cleaning brand in the nation, we have architected a **3D WebGL / Canvas Scroll-Driven Experience** inspired by `https://github.com/oso95/scroll-world`:

### Conceptual Blueprint: "The Hydro-Blaster Journey"
1. **The Scroll Camera**: As the visitor scrolls down `website/index.html`, the camera glides through a stylized, isometric 3D Silicon Valley commercial plaza and residential street.
2. **Interactive Pressure Washing Mechanics**:
   - **Scroll Position 0% – 25% (Hero / Curbside)**: The Hygeia 200° hot-water wash truck pulls up. As you scroll, 3D water jets spray at 4000 PSI, stripping away grease and bacteria from curbside trash bins with real-time particle steam and water splash effects.
   - **Scroll Position 25% – 50% (Commercial Flatwork & Dumpster Pad)**: Camera flies over a grease-stained tech campus dumpster pad. Scrolling drives a rotary surface cleaner forward, dynamically erasing oil stains using a dual-texture shader blend (*Dirty Texture ➔ Clean Concrete Texture*).
   - **Scroll Position 50% – 75% (Building Soft-Wash & Glazing)**: Camera pans up a 3-story modern facade. A gentle soft-wash foam cascades down the walls, washing away algae and mold to reveal sparkling clean architectural panels.
   - **Scroll Position 75% – 100% (EPA Reclaim & Booking)**: Water vacuum recovery suction rings demonstrate 100% wastewater reclaim into the onboard filtration tank, leading directly into the interactive Instant Quote & Booking module.
3. **Technical Stack for Implementation**:
   - `Three.js` / `@react-three/fiber` or lightweight `Canvas 2D + WebGL Shaders`.
   - `GSAP ScrollTrigger` for buttery 60fps scroll scrubbing.
   - Dual-pass texture mask shaders for real-time before/after surface peeling.
   - Instanced particle systems for water droplets, mist, and 200° thermal steam.

---

## 🚀 Local Development & Serving

### 1. Run Power Wash Solutions Frontend (Port 8080):
```bash
python -m http.server 8080 --directory "website"
```
Open **[http://localhost:8080](http://localhost:8080)**.

### 2. Run Commercial Janitorial Frontend (Port 8081):
```bash
python -m http.server 8081 --directory "jswebsite"
```
Open **[http://localhost:8081](http://localhost:8081)**.

### 3. Run Backend API Locally (Port 5000):
```bash
cd backend
npm install
npm run dev
```
Open **[http://localhost:5000/api/health](http://localhost:5000/api/health)**.

---

## ☁️ Production VPS & Vercel Deployment

### Hostinger VPS Server Details
- **Server IP**: `2.25.90.226`
- **SSH User**: `root`
- **Backend Directory**: `/var/www/hygeia/backend`
- **PM2 Process**: `hygeia-backend` (Port 5000)
- **Nginx Reverse Proxy**: Ports 80 & 443 with Let's Encrypt TLS 1.3 for `2.25.90.226.sslip.io`
- **Other Co-Hosted Services**: `burngrid` (`burnmap.lol`) on Port 3000 (preserved and untouched).

### Deploying Updates to VPS:
```bash
ssh root@2.25.90.226 "cd /var/www/hygeia/backend && git pull origin main && npm install && pm2 restart hygeia-backend"
```

### Vercel Production Deployments:
- **Power Wash Solutions**: Root Directory: `website` | Domain: `hygeiapwsweb.vercel.app`
- **Commercial Janitorial**: Root Directory: `jswebsite` | Domain: `hygeiajs.vercel.app`

---

## 🎖️ Corporate Credentials & Compliance

- **Legal Entity**: Montero Enterprises Inc. dba Hygeia
- **Founding Heritage**: 35 Years Serving Silicon Valley (Founded by Andy Montero)
- **State Certifications**:
  - State of California DVBE Certified: **`#2054658`**
  - Small Business (Micro) Certified
  - California Department of Industrial Relations (DIR) Public Works: **`#JS-LR-100 132 4606`**
- **Environmental Compliance**: Cal/EPA Stormwater BMP Compliance, 100% Green Seal Certified Non-Toxic Chemicals, EPA List N Hospital Grade Disinfectants.
- **Headquarters**: 1105 Benton St, Suite A, Santa Clara, CA 95050
- **24/7 Operations Dispatch**: (650) 933-3823 | `aloha@hygeiaservices.com`
