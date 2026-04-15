# One DSD Consultant Operating System v5.1

**Minnesota DHS — Disability Services Division**  
Equity and Inclusion Operations Platform for ~150-180 DSD staff

---

## Overview

The One DSD COS is a full-stack DEIA operations platform supporting Gary Banks (Equity and Inclusion Operations Consultant) and the One DSD Equity team. It provides:

- **Staff Portal** — Equity reviews, training, resource library, consultations, ODET hub
- **Equity Lead Console** — Operations dashboard, KPI tracking, AI-powered tools, COS agent system
- **Claude AI Integration** — Equity Assist, Goal Decomposition, Quarterly Reports, COS atom execution
- **9-Cluster Consultant OS** — 59 function atoms covering all equity consulting duties

---

## Quick Start

### Option 1: Local (Node.js)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY for AI features

# 3. Start server
npm start
# → http://localhost:3000
```

### Option 2: Docker

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your secrets

# 2. Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## Login Credentials

| Username | Password     | Role         |
|----------|-------------|--------------|
| `gbanks` | `equity2026!` | equity_lead  |
| `staff1` | `password123` | staff        |
| `staff2` | `password123` | staff        |

> **Important:** Change all passwords before any deployment beyond local development.

---

## AI Features

Set `ANTHROPIC_API_KEY` in your `.env` file to enable:

| Feature | Route | Role |
|---------|-------|------|
| Equity Assist chatbot | `POST /api/equity-assist` | all |
| Goal Decomposition | `POST /api/goal-decompose` | equity_lead |
| Quarterly Report Generator | `POST /api/reports/quarterly/generate` | equity_lead |
| COS Atom Execution | `POST /api/cos/execute/:atomId` | equity_lead |
| Auto Consultation Triage | `POST /api/consultations` | all |

Get your API key at: https://console.anthropic.com

---

## Architecture

```
one-dsd-cos/
├── server/
│   ├── index.js          # Express app entry point
│   ├── db/
│   │   └── index.js      # sql.js database (SQLite, 866 lines, full seed data)
│   ├── routes/
│   │   ├── auth.js       # Login / logout / me
│   │   └── api.js        # All 50+ API endpoints
│   ├── ai/
│   │   └── claude.js     # Anthropic SDK integration
│   └── middleware/
│       └── auth.js       # JWT verification
├── public/               # Built React frontend (index.html + assets)
│   ├── index.html
│   └── assets/
├── data/                 # SQLite database (auto-created)
├── uploads/              # User file uploads
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

**Stack:**
- Runtime: Node.js 20
- Framework: Express 4
- Database: sql.js (SQLite via WebAssembly — no native deps)
- Auth: JWT (jsonwebtoken + bcryptjs)
- AI: Anthropic SDK (@anthropic-ai/sdk)
- Frontend: Pre-built React/Vite bundle

---

## API Reference

### Auth
```
POST /api/auth/login      { username, password } → { token, user }
GET  /api/auth/me         (Bearer token) → { user }
POST /api/auth/logout     (Bearer token) → { message }
```

### Core Data
```
GET/POST /api/equity-reviews
GET/POST /api/action-items
GET/POST /api/consultations
GET/POST /api/resources
GET/PATCH /api/community-profiles/:id
GET/POST  /api/reflections
GET       /api/training-courses
GET/POST  /api/training-progress
```

### Operations (equity_lead)
```
GET/POST/PATCH /api/operational-goals/:id
GET            /api/agent-definitions
GET            /api/learning-loop-proposals
POST           /api/learning-loop-proposals/:id/decide
GET            /api/approval-queue
POST           /api/approval-queue/:id/decide
GET/POST       /api/consultant-documents
GET            /api/audit-log
```

### COS (equity_lead)
```
GET  /api/cos/stats
GET  /api/cos/clusters
GET  /api/cos/atoms?clusterId=
PATCH /api/cos/atoms/:id/toggle
POST  /api/cos/execute/:atomId      (requires ANTHROPIC_API_KEY)
GET  /api/cos/approvals
POST /api/cos/approvals/:id/decide
GET  /api/cos/outputs
```

### ODET Hub
```
GET      /api/working-groups
GET      /api/odet-records
GET      /api/equity-team
GET/POST /api/community-feedback
GET      /api/calendar-events
GET      /api/team-activities
```

### AI (requires ANTHROPIC_API_KEY)
```
POST /api/equity-assist                { question, context, pageContext }
POST /api/goal-decompose               { goal, timeline, resources }
POST /api/reports/quarterly/generate   { quarter, year }
```

### Downloads (equity_lead)
```
GET /api/download/consultations
GET /api/download/action-items
GET /api/download/audit-log
GET /api/download/community-profiles
```

---

## Production Deployment

### Environment Variables (required for production)

```bash
NODE_ENV=production
JWT_SECRET=<64-char random hex>    # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
ANTHROPIC_API_KEY=<your key>
PORT=3000
ALLOWED_ORIGINS=https://your-domain.mn.gov
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Replit Deployment
1. Upload project to Replit
2. Set environment variables in Replit Secrets
3. Set run command: `npm start`
4. Port 3000 is auto-exposed

### Azure App Service (MN DHS)
```bash
# Build Docker image
docker build -t one-dsd-cos .

# Tag and push to Azure Container Registry
docker tag one-dsd-cos <registry>.azurecr.io/one-dsd-cos:latest
docker push <registry>.azurecr.io/one-dsd-cos:latest
```

---

## Database

SQLite database auto-initializes at `./data/one-dsd.db` on first run with:

- 28 tables (full schema)
- Seed data: 3 users, 6 goals, 8 resources, 6 community profiles, 9 COS clusters, 59 function atoms, and more
- Auto-saves on all write operations and graceful shutdown

**Backup:**
```bash
cp data/one-dsd.db data/one-dsd.db.backup-$(date +%Y%m%d)
```

---

## COS Clusters

| Code | Cluster | Atoms |
|------|---------|-------|
| D | Diagnostic & Assessment | D.01–D.06 |
| C | Consultation & Advisory | C.01–C.06 |
| O | Operational Management | O.01–O.08 |
| L | Learning & Development | L.01–L.05 |
| W | Workforce Engagement | W.01–W.05 |
| E | External Partnership | E.01–E.06 |
| S | Systems & Data | S.01–S.05 |
| A | Accountability & Reporting | A.01–A.06 |
| X | Strategic & Crosscutting | X.01–X.07 |

---

## Health Check

```
GET /health
→ { status: "ok", version: "5.1.0", dbReady: true, timestamp: "..." }
```

---

## One DSD Program Context

This platform serves the Minnesota Department of Human Services Disability Services Division (DSD), operating within the Aging and Disability Services Administration (ADSA). The One DSD Equity Program serves **all ethnic and cultural communities in Minnesota universally**, with targeted outreach to DHS priority populations: Somali, Hmong, Indigenous nations, Latino/a/x, and people with personal circumstances.

Programs supported: HCBS waivers, PCA/CFSS, MnCHOICES, housing, crisis response, employment supports.

Frameworks: GARE, IDI, CLAS Standards, UDL, ADA/Section 504, disability justice principles.

---

*Built for Gary Banks, Equity and Inclusion Operations Consultant, MN DHS DSD*  
*Northpoint Consulting Group — One DSD Equity Program*
