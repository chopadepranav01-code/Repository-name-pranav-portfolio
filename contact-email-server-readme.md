# Contact Email Server (for static portfolio)

This repo contains a small Express + Nodemailer backend to receive the portfolio contact form and email it to:
- **chopadepranav01@gmail.com**

## 1) Setup

```bash
cd "c:/Users/prana/Pranav Potfolio"
npm install
```

## 2) Environment variables

Copy:
- `.env.example` → `.env`

Fill in:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

For Gmail:
- enable **2FA**
- create an **App Password** and use it as `SMTP_PASS`

## 3) Run server

```bash
node contact-email-server.js
```

By default it listens on `PORT` (3001).

## 4) Frontend endpoint

The portfolio HTML calls `fetch('/api/contact', ...)`.

- If you deploy this server separately, update the frontend fetch URL to include the host (example):
  - `http://YOUR_DOMAIN:3001/api/contact`

For local dev with same origin, it’s easiest to reverse-proxy under the same domain.

## Notes
- This server is intended for development / deployment setups where you control the backend.
- CORS is not configured here; if you serve frontend from a different origin, add CORS middleware.

