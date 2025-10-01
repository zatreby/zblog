# JAMstack Headless CMS with PHP & Next.js

A modern, decoupled web application using a JAMstack architecture, featuring a PHP backend with SQLite and a Next.js frontend styled with Tailwind CSS.

## Project Structure
- **backend/**: PHP REST API with SQLite database (`backend.php`, `blog.db`).
- **frontend/**: Next.js app with dynamic routing for blog posts, using Tailwind CSS for styling.
- **devops/**: Scripts for starting, stopping, and installing the app (`start.sh`, `stop.sh`, `install.sh`).
- **docs/**: Presentation slides (`slides.html`) explaining the architecture.

## Features
- Create, read, update, and delete (CRUD) blog posts via a RESTful API.
- Responsive, modern UI with Tailwind CSS.
- Dynamic routing for viewing and editing posts.
- Headless CMS approach for flexible content delivery.

## Prerequisites
- Node.js (v18 or higher)
- PHP (v8.0 or higher)
- pnpm (v8 or higher, for frontend)
- SQLite3 (for backend database)

## Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```
2. Run the installation script:
   ```bash
   ./devops/install.sh
   ```
3. Start the app:
   ```bash
   ./devops/start.sh
   ```
   - Backend runs at `http://localhost:8000`.
   - Frontend runs at `http://localhost:3000`.

## Usage
- Visit `http://localhost:3000` to access the blog.
- Create/edit posts via the UI or interact directly with the API at `http://localhost:8000/api/posts`.

## Development
- Frontend: `cd frontend && pnpm dev`
- Backend: Ensure PHP server is running (handled by `start.sh`).
- Modify `backend/backend.php` for API changes or `frontend/app/` for UI updates.

## Deployment
- Frontend: Build with `cd frontend && pnpm build` for static export or server-side rendering.
- Backend: Deploy `backend.php` and `blog.db` to a PHP-compatible server with SQLite support.