# AI Event Search Frontend

React + Vite + TypeScript frontend for the VDT 2026 demo server.

## Requirements

- Node.js 20+
- Demo Spring Boot server running on `http://localhost:8080`

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend on port `8080`.

## Build

```bash
npm run build
```

## Backend Endpoints Used

- `POST /api/search`
- `GET /api/search/history?userId=soc-analyst-demo&limit=20`
- `GET /api/search/{queryId}/export.csv`
- `POST /api/events/import-file`
