# Zlogg — Modern Decoupled Blog Platform (PHP + Next.js)

Zlogg is a lightweight, secure JAMstack blog platform with a PHP + SQLite backend and a Next.js frontend styled with Tailwind CSS. It includes a fully authenticated admin panel for managing posts.

## Features

- **Public Blog**: Responsive, Markdown-rendered posts with dark mode
- **Admin Panel**: Token-based login, full post CRUD, Markdown editor
- **Backend**: PHP 8+ REST API, SQLite (no setup), 24h token expiry
- **Dev-Friendly**: Next.js App Router, Tailwind, simple scripts
- **Optional**: Cloudflare Tunnel for instant public access

## Project Structure

```text
backend/      PHP API + SQLite
frontend/     Next.js frontend
scripts/      Install / start / stop / tunnel
logs/         Server logs
```

## Requirements

- Node.js ≥ 18
- PHP ≥ 8 with sqlite3
- pnpm ≥ 8
- cloudflared (optional)

## Quick Start

```bash
git clone github.com/zatreby/zlogg
cd zlogg
chmod +x scripts/*.sh
./scripts/install.sh
./scripts/start.sh
```

Services:

- Backend → [http://localhost:8000](http://localhost:8000)
- Frontend → [http://localhost:3000](http://localhost:3000)
- Admin Panel → [http://localhost:3000/admin](http://localhost:3000/admin)

## Usage

### Admin Panel

1. Open `/admin`
2. Log in using the password set during install
3. Create/edit/delete posts (Markdown supported, `Ctrl+S` to save)

### API Endpoints

#### Public

```text
GET /api/posts
GET /api/posts/{id}
```

#### Admin

```text
POST /api/admin/login      {password}
GET  /api/admin/verify
POST /api/admin/logout
POST   /api/posts
PATCH  /api/posts/{id}
DELETE /api/posts/{id}
```

## Development

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Backend

```bash
php -S localhost:8000 backend.php
```

## Cloudflare Tunnel (Optional)

Temporary:

```bash
./scripts/tunnel.sh   # Option 1
```

Permanent:

```bash
./scripts/tunnel.sh   # Option 2
```

Set the frontend API URL:

```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

## Management Scripts

```bash
./scripts/start.sh    Start servers
./scripts/dev.sh      Quick start
./scripts/stop.sh     Stop servers
./scripts/tunnel.sh   Public URL via Cloudflare
```

## Security Notes

- Password stored in `backend/.env`
- Tokens expire in 24 hours
- Use HTTPS in production
- Back up `backend/blog.db`

## Database Schema

### posts

```sql
id TEXT PRIMARY KEY
title TEXT
content TEXT
created_at DATETIME
last_modified DATETIME
```

### admin_tokens

```sql
token TEXT PRIMARY KEY
created_at DATETIME
expires_at DATETIME
```
