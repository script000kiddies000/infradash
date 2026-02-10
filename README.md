# Dashboard Infra

A modern, beautiful homelab dashboard for managing services with IP/port tracking, URL auto-generation, and secure icon uploads.

![Dashboard Preview](preview.png)

## Features

- 🏠 **Dashboard View** - Services grouped by IP/Host with clickable cards
- ⚙️ **Service Management** - Add, edit, delete services with form validation
- 🎯 **Port Generator** - Auto-generate unique ports to prevent duplicates
- 🔗 **URL Auto-Gen** - Automatically build service URLs from Host IP + Port + Protocol
- 📤 **Icon Upload** - Securely upload custom icons (PNG, JPG, WebP, SVG) with validation
- 🎨 **Dark/Light Theme** - Beautiful glassmorphism design
- 🔒 **Authentication** - Simple setup flow with admin account creation
- 🐳 **Docker Ready** - Easy deployment with Docker Compose and persistent data volumes

## Quick Start

### Using Docker (Recommended)

1. Clone the project.
2. Create a `.env` file from `.env.example`.
3. Start with Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. Access at `http://localhost:3000`

### Manual Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

## First Run

1. Navigate to `http://localhost:3000`.
2. The system will initialize with an **Example Host** (Home Router).
3. You'll be redirected to the setup page to create your first admin account.
4. Start managing your infra!

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | JSON database path | `file:./data/db.json` |
| `NEXTAUTH_SECRET` | Session encryption key | (required) |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `UPLOAD_DIR` | Directory for uploads | `/app/data/uploads` |

## Project Structure

```
├── app/                 # Next.js pages and API routes
├── components/          # React components
├── lib/                 # Utilities (JSON DB, auth, port-generator)
├── data/                # Persistent data (db.json, uploads/)
├── public/              # Static public assets
├── Dockerfile           # Docker build configuration
└── docker-compose.yml   # Docker Compose configuration
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Custom JSON DB (No heavy DB engine required)
- **Authentication**: NextAuth.js
- **Styling**: Vanilla CSS (Modern CSS Variables)
- **Icons**: Lucide React
- **Deployment**: Docker Standalone

## License

MIT

