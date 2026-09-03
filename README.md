# 🏢 Hygeia Enterprise Digital Platform
### Montero Enterprises Inc. dba Hygeia — Silicon Valley Commercial Facility Solutions

An enterprise-grade, multi-website digital platform powering both **Hygeia Power Wash Solutions** (B2C/B2B exterior pressure washing & curbside trash bin sanitization) and **Hygeia Commercial Cleaning & Janitorial Services** (B2B corporate tech campuses, medical clinics, schools, and Class A property management).

---

## 🌟 Executive Overview & Multi-Enterprise Architecture

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
│  Live URL: hygeiapwsweb.vercel.app   │                                   │  Live URL: Vercel Production         │
├──────────────────────────────────────┤                                   ├──────────────────────────────────────┤
│ • 48 High-Performance Pages         │                                   │ • 62 High-Performance Pages         │
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
                                │ 🔄 Live Multi-Enterprise Event Stream (API)  │
                                └──────────────────────────────────────────────┘
```

---

## 📂 Repository Directory Structure

```
hygeiaPWS/
├── website/                         # 🚛 HYGEIA POWER WASH SOLUTIONS (48 Pages)
│   ├── index.html                   # Dual B2C/B2B Homepage with Interactive Bin Calculator & SV Map
│   ├── commercial-pressure-washing.html # Commercial Flatwork, Garages & Dumpster Pads
│   ├── residential-pressure-washing.html # Driveways, Patios, Siding & Soft Washing
│   ├── bin-cleaning.html            # Monthly ($35/mo) vs One-Time ($65) Trash Can Sanitizing
│   ├── service-areas.html           # Service Directory Index
│   ├── service-areas/               # 14 Hyper-Local Municipal Landing Pages
│   │   ├── san-jose.html, sunnyvale.html, santa-clara.html, palo-alto.html,
│   │   ├── mountain-view.html, los-gatos.html, saratoga.html, cupertino.html,
│   │   ├── menlo-park.html, redwood-city.html, san-carlos.html, san-mateo.html,
│   │   └── milpitas.html, foster-city.html
│   ├── about.html                   # 35-Year Heritage, Andy Montero Bio & State DVBE Specs
│   ├── contact.html                 # Instant Quote Request & Commercial Dispatch
│   ├── faq.html                     # Power Washing & Bin Cleaning Knowledge Base
│   ├── portal.html                  # Client Subscription & Trash Day Schedule Dashboard
│   ├── admin.html                   # Multi-Enterprise Operations & Dispatch Center
│   ├── blog.html                    # 21 Commercial & Residential Pressure Washing Guides
│   ├── blog/                        # 21 Individual SEO/pSEO Article Pages
│   ├── assets/
│   │   ├── css/ (main.css, dashboards.css)
│   │   ├── js/  (main.js, admin.js, portal.js)
│   │   └── img/ (High-resolution imagery, vectors & icons)
│   ├── sitemap.xml                  # 49 Search Engine URLs
│   └── vercel.json                  # Edge routing & clean URLs configuration
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
│   ├── assets/
│   │   ├── img/ (janitorial-header-logo.png, janitorial-footer-logo.jpg, 10 branded uniforms)
│   │   ├── css/ (main.css, dashboards.css)
│   │   └── js/  (main.js, admin.js, portal.js)
│   ├── sitemap.xml                  # 59 Production URLs
│   └── vercel.json                  # Production Edge configuration
│
└── Hygeia_Executive_Briefing_2026.pdf # Official Executive Operations & CEO Growth Blueprint PDF
```

---

## ⚡ Unified Admin Command Center (`admin.html`)

The centralized administrative suite features **3 distinct operational dashboards** with instant tab switching and persistent local storage synchronization:

1. **🌐 View 1: All Enterprises (Combined Executive Overview)**:
   - Consolidated Monthly Recurring Revenue: **`$54,820 / mo`** (+18.4% YoY).
   - Total Active Client Accounts: **500 Total** (482 Bin Subscribers + 18 Commercial Contracts).
   - Real-Time Unified Inbound Leads Pipeline streaming from both websites.
   - Enterprise Revenue Breakdown (66.4% Janitorial vs 33.6% Power Washing).
   - One-click California State DVBE `#2054658` compliance report export.

2. **🚛 View 2: Power Wash Solutions & Fleet Dispatch**:
   - PWS MRR: **`$18,420 / mo`** across 482 active residential bin subscriptions.
   - Route Dispatch Controller with municipal cluster filtering (San Jose, South Bay, Peninsula).
   - Interactive stop checklist (`Pending` ➔ `En Route` ➔ `Completed`) with driver simulator.
   - Commercial Power Washing proposal generator with EPA wastewater recovery formulas.

3. **🏢 View 3: Commercial Janitorial Services Command**:
   - Janitorial Contract MRR: **`$36,400 / mo`** across 18 Class A facilities.
   - B2B Commercial RFP pipeline with facility size and service frequency metrics.
   - Tonight's Commercial Facility Cleaning Schedule & Supervisor Roster.
   - Live stage progression (*New Inquiry ➔ Walk Scheduled ➔ Proposal Sent ➔ Contract Active*).

---

## 👤 Client Self-Service Portal (`portal.html`)

Built for friction-free customer retention and subscription management:
- **Trash-Day Service Calendar**: Dynamic countdown timer based on municipal trash collection day.
- **Before / After Verification**: Interactive photo viewer showing proof of completed service.
- **Subscription Controls**: 1-click plan upgrades, add/remove bin quantities, auto-pay updates.
- **Instant Dispatch Messaging**: Direct communication channel with operations supervisors.

---

## 🛠️ Technology Stack & Performance

| Layer | Technologies & Design Philosophy |
| :--- | :--- |
| **Core Architecture** | Semantic HTML5, Vanilla Modern CSS, ES6+ JavaScript. |
| **Performance** | Zero heavy JavaScript framework dependencies. Lightning-fast Time to First Byte ($\text{TTFB} < 80\text{ms}$), 100/100 Google Lighthouse mobile score target. |
| **Responsive Grid** | Multi-tier breakpoint matrix (320px ultra-compact, 375px–430px modern smartphones, foldables, iPads/tablets, 1440px desktops, 4K displays). |
| **Structured Data** | Comprehensive Schema.org JSON-LD microdata (`JanitorialService`, `HomeAndConstructionBusiness`, `AggregateRating`, `GeoCoordinates`, `BlogPosting`, `FAQPage`). |
| **State Persistence** | Asynchronous local database event stream (`hygeia_unified_leads`, `hygeia_route_stops`) ready to bind to any Node, Supabase, or Firebase backend. |

---

## 🚀 Local Development & Serving

To run both applications locally:

### 1. Run Power Wash Solutions (Port 8080):
```bash
python -m http.server 8080 --directory "website"
```
Open **[http://localhost:8080](http://localhost:8080)**.

### 2. Run Janitorial Services (Port 8081):
```bash
python -m http.server 8081 --directory "jswebsite"
```
Open **[http://localhost:8081](http://localhost:8081)**.

---

## ☁️ Vercel Production Deployment Guide

Both enterprise websites live inside the same Git repository (`https://github.com/iamvazu/hygeiapws.git`) and deploy independently on Vercel:

### Deploying Power Wash Solutions:
- **Vercel Project**: `hygeiapws`
- **Root Directory**: `website`
- **Framework**: `Other`

### Deploying Commercial Janitorial Services:
- **Vercel Project**: `hygeia-janitorial-services`
- **Root Directory**: `jswebsite`
- **Framework**: `Other`

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
