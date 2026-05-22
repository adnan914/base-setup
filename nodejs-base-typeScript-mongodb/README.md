# VoiceOwl Transcription Backend

A RESTful API backend for audio transcription and user authentication, built with Node.js, Express, TypeScript, and MongoDB. Handles user registration, login, password reset, JWT authentication, and audio transcription endpoints.

---

## Tech Stack
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- Joi (validation)
- JWT (authentication)
- Nodemailer (email)
- dotenv

---

## Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB** (local or cloud instance)

---

## Installation
```bash
# Clone the repository (if not already)
git clone <repo-url>
cd backend

# Install dependencies
npm install
```

---

## Environment Variables
Create a `.env.development` and/or `.env.production` file in the backend root with the following variables:

```env
PORT=3001
DB_URL=mongodb://localhost:27017/voiceowl
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRATION=7d
JWT_FORGOT_PASSWORD_SECRET=your_jwt_forgot_secret
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

---

## Running the Project

### Development
```bash
npm run start:dev
```
- Uses `nodemon` and auto-reloads on changes.
- Loads `.env.development` by default.

### Production
```bash
npm run start:prod
```
- Builds TypeScript, then runs the compiled code.
- Loads `.env.production` by default.

---

## API Overview
Base URL: `http://localhost:3001/api/v1/`

### **Auth Routes**
- `POST /signup` — Register a new user
- `POST /login` — Login and receive JWT tokens
- `POST /logout` — Logout user (requires auth)
- `POST /refreshToken` — Refresh JWT tokens (requires refresh token)
- `POST /forgotPassword` — Request password reset email
- `POST /verifyResetToken` — Verify password reset token
- `POST /resetPassword` — Reset password

### **Transcription Routes**
- `POST /transcription` — Submit audio URL for transcription (requires auth)
  - Body: `{ audioUrl: string }`
- `GET /transcriptionList` — List user’s transcriptions (requires auth)
  - Query: `limit`, `page`, `search`

---

## Common Issues & Troubleshooting
- **MongoDB connection errors:** Ensure `DB_URL` is correct and MongoDB is running.
- **Missing environment variables:** Double-check your `.env` file.
- **Email not sending:** Check SMTP credentials and allow less secure apps if using Gmail.
- **Port in use:** Change `PORT` in `.env` or stop the conflicting process.

---

## Scripts
- `npm run start:dev` — Start in development mode
- `npm run start:prod` — Build and start in production mode
- `npm run build` — Compile TypeScript

---

## End-to-End (E2E) Testing

This project uses **Jest** and **supertest** for E2E API testing.

### Running E2E Tests

1. **Set up a test database** (recommended: use a separate MongoDB database for testing, e.g., `voiceowl_test`).
2. **Create a `.env.test` file** in the backend root with the same variables as your development `.env`, but point `DB_URL` to your test database.

Example `.env.test`:
```env
PORT=3001
DB_URL=mongodb://localhost:27017/voiceowl_test
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRATION=7d
JWT_FORGOT_PASSWORD_SECRET=your_jwt_forgot_secret
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

3. **Run the tests:**
```bash
npm run test:e2e
```

### Test Structure
- E2E tests are located in the `test/` directory (e.g., `test/auth.e2e-spec.ts`).
- Tests cover main API flows such as signup and login.
- Uses an isolated test database to avoid polluting development data.

---



