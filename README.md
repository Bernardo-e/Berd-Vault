# 🚀 NoteVault — Student Notes Sharing Platform

> **"Share Knowledge. Ace Everything."**
> A production-ready platform where engineering students upload, share, and download study notes.

---

## 🎨 Brand

| | |
|---|---|
| **Name** | NoteVault |
| **Primary** | `#6C63FF` Electric Indigo |
| **Accent** | `#00D4AA` Emerald Teal |
| **Font** | Inter (UI) · Outfit (Display) |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand + SWR |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Storage | Cloudinary (or local in dev) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 🗂️ Project Structure

```
NoteVault/
├── client/                     ← Next.js 14 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        ← Landing Page
│   │   │   ├── auth/           ← Login / Register
│   │   │   ├── dashboard/      ← User Dashboard
│   │   │   ├── browse/         ← Browse & Filter Notes
│   │   │   ├── upload/         ← Upload Notes
│   │   │   ├── notes/[id]/     ← Note Detail
│   │   │   ├── profile/[id]/   ← User Profile
│   │   │   └── admin/          ← Admin Panel
│   │   ├── components/
│   │   │   ├── layout/         ← Navbar, Footer
│   │   │   └── ui/             ← NoteCard, etc.
│   │   └── lib/
│   │       ├── api.ts           ← Axios + all API helpers
│   │       ├── store.ts         ← Zustand auth + theme
│   │       └── utils.ts         ← Helpers
│   └── .env.local
│
└── server/                     ← Express Backend
    ├── models/
    │   ├── User.js
    │   └── Note.js
    ├── routes/
    │   ├── auth.js
    │   ├── notes.js
    │   └── users.js
    ├── middleware/
    │   ├── auth.js              ← JWT middleware
    │   └── upload.js            ← Cloudinary/local upload
    ├── index.js                 ← Entry point
    └── .env
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **MongoDB** → [mongodb.com/try/download/community](https://mongodb.com/try/download/community) OR use Atlas
- **Git** (optional)

---

### Step 1 — Clone / Open in VS Code

```bash
# The project is already at D:\New folder\NoteVault
# Open VS Code in that folder
```

---

### Step 2 — Start MongoDB Locally

**Option A: MongoDB Community (already installed)**
```powershell
# Start MongoDB service (Windows)
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud — free)**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free account → **Create Cluster** (M0 free tier)
3. Click **Connect → Drivers** → copy connection string
4. Replace `server/.env` `MONGO_URI` with your string

---

### Step 3 — Configure Server

The `server/.env` is already pre-filled for local development:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/notevault
JWT_SECRET=notevault_dev_secret_2024
```

> ⚠️ **For production**, change `JWT_SECRET` to a long random string!

---

### Step 4 — Start the Backend

```powershell
cd "D:\New folder\NoteVault\server"
npm install        # if not already done
npm run dev        # starts on http://localhost:5000
```

You should see:
```
✅  MongoDB connected
🚀  NoteVault API running on http://localhost:5000
```

---

### Step 5 — Start the Frontend

Open a **new** terminal window:

```powershell
cd "D:\New folder\NoteVault\client"
npm run dev        # starts on http://localhost:3000
```

Open **http://localhost:3000** in your browser 🎉

---

## 🔑 Creating an Admin Account

1. Register a normal account at `/auth`
2. Open MongoDB Compass or run:

```javascript
// In MongoDB shell / Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

3. Log out and log back in — you'll see the **Admin Panel** link

---

## ☁️ Setting Up Cloudinary (File Storage)

> By default, files are saved locally to `server/uploads/` in development.
> For production, Cloudinary gives you 25GB free.

1. Go to [cloudinary.com](https://cloudinary.com) → **Sign Up Free**
2. Dashboard → copy **Cloud Name, API Key, API Secret**
3. Add to `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🌐 Deployment Guide

### Frontend → Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Set **Root Directory** to `client`
5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-render-url.onrender.com/api
   ```
6. Click **Deploy** ✅

### Backend → Render (Free)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect GitHub repo → set **Root Directory** to `server`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all environment variables from `.env`
6. Click **Deploy** ✅

### Database → MongoDB Atlas (Free)

1. Create M0 free cluster
2. **Network Access** → Add IP `0.0.0.0/0` (allow all for Render)
3. Copy connection string → set as `MONGO_URI` on Render

---

## 📡 API Reference

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Current user |

### Notes
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/notes` | ❌ | Browse (filter + search + paginate) |
| GET | `/api/notes/trending` | ❌ | Top 8 trending |
| GET | `/api/notes/recent` | ❌ | Last 30 days |
| GET | `/api/notes/:id` | ❌ | Note detail |
| POST | `/api/notes` | ✅ | Upload note (multipart) |
| DELETE | `/api/notes/:id` | ✅ | Delete (owner/admin) |
| POST | `/api/notes/:id/rate` | ✅ | Rate 1-5 stars |
| POST | `/api/notes/:id/comment` | ✅ | Add comment |
| POST | `/api/notes/:id/download` | ✅ | Get download URL |

### Users
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/users/:id` | ❌ | Public profile |
| PUT | `/api/users/me` | ✅ | Update profile |
| POST | `/api/users/bookmark/:noteId` | ✅ | Toggle bookmark |
| GET | `/api/users/me/notifications` | ✅ | Get notifications |

---

## 🗄️ Database Schema

### User
```js
{ name, email, password(hashed), avatar, bio,
  college, department, year, role,
  bookmarks[], notifications[], uploadCount, downloadCount }
```

### Note
```js
{ title, description, subject, department, college,
  year, semester, tags[],
  fileUrl, fileType, fileSize, filePublicId,
  uploader(ref), ratings[{user,score}], avgRating,
  comments[{user,text}], downloads, views, isApproved }
```

---

## 🔐 Security Features

- ✅ bcrypt password hashing (12 salt rounds)
- ✅ JWT authentication (7-day expiry)
- ✅ Helmet.js HTTP security headers
- ✅ CORS protection
- ✅ Rate limiting (200 req/15min global, 20 auth attempts)
- ✅ File type validation (MIME + extension)
- ✅ File size limit (20MB)
- ✅ Input validation (express-validator)
- ✅ Admin-only routes protected

---

## 🎯 Features Checklist

### ✅ MVP Features
- [x] User authentication (register / login / logout)
- [x] Upload notes (PDF, DOC, DOCX, PPT, PPTX)
- [x] Browse by College / Department / Year / Semester / Subject
- [x] Full-text search
- [x] Download notes
- [x] User profiles with uploaded notes
- [x] 5-star rating system
- [x] Admin panel (approve/delete notes, view users)

### ✅ Advanced Features
- [x] Bookmark / Favorites system
- [x] Comments on notes
- [x] Trending notes section
- [x] Recently added section
- [x] Notifications (basic)
- [x] Dark mode + Light mode
- [x] Mobile-first responsive design
- [x] Glassmorphism UI with animations

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss what you'd like to change.

---

*Built with ❤️ for students, by Bernardo.*
