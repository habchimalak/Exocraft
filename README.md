# ExoCraft Backend API

Node.js + Express + TypeScript + Prisma (SQLite) backend for the ExoCraft admin panel.

## Stack

| Layer     | Technology |
|-----------|------------|
| Runtime   | Node.js ≥ 18 |
| Framework | Express 4 |
| Language  | TypeScript 5 |
| ORM       | Prisma 5 (SQLite for dev, swap to PostgreSQL/MySQL for prod) |
| Auth      | JWT (jsonwebtoken) + bcryptjs |
| Uploads   | multer (disk storage) |
| Validation | express-validator |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Run migrations (creates dev.db)
npm run db:migrate

# 4. Seed default admins + promos
npm run db:seed

# 5. Start dev server (hot reload)
npm run dev
```

Server starts on **http://localhost:3001**

---

## Default Credentials (after seed)

| Établissement | Email              | Password     |
|---------------|--------------------|--------------|
| Cycle Ingénieur | admin@tekup.tn   | Admin@1234   |
| Licence/Master  | admin@faculte.tn | Admin@1234   |

---

## Environment Variables (`.env`)

| Variable          | Default                        | Description |
|-------------------|--------------------------------|-------------|
| `DATABASE_URL`    | `file:./dev.db`                | SQLite DB path |
| `JWT_SECRET`      | *(change in production)*       | JWT signing secret |
| `JWT_EXPIRES_IN`  | `7d`                           | Token TTL |
| `PORT`            | `3001`                         | HTTP port |
| `UPLOAD_DIR`      | `./uploads`                    | File storage root |
| `MAX_FILE_SIZE_MB`| `20`                           | Max upload size |
| `CORS_ORIGIN`     | `http://localhost:5173`        | Frontend URL |

---

## API Endpoints

### Auth
| Method | Path                   | Description |
|--------|------------------------|-------------|
| POST   | `/api/auth/login`      | Login (returns JWT) |
| GET    | `/api/auth/me`         | Get current user |
| POST   | `/api/auth/logout`     | Logout (stateless) |
| PATCH  | `/api/auth/password`   | Change password |

### Users
| Method | Path                        | Description |
|--------|-----------------------------|-------------|
| GET    | `/api/users`                | List users (filterable) |
| POST   | `/api/users`                | Create user |
| PUT    | `/api/users/:id`            | Update user |
| DELETE | `/api/users/:id`            | Delete user |
| PATCH  | `/api/users/:id/status`     | Toggle actif/inactif |
| PATCH  | `/api/users/:id/promote`    | Promote to admin |

### Promos
| Method | Path             | Description |
|--------|------------------|-------------|
| GET    | `/api/promos`    | List promos |
| GET    | `/api/promos/:id`| Get promo |
| POST   | `/api/promos`    | Create promo |
| PUT    | `/api/promos/:id`| Update promo |
| DELETE | `/api/promos/:id`| Delete promo |

### Matieres
| Method | Path                                       | Description |
|--------|--------------------------------------------|-------------|
| GET    | `/api/matieres`                            | List matieres |
| GET    | `/api/matieres/:id`                        | Get matiere |
| POST   | `/api/matieres`                            | Create matiere |
| PUT    | `/api/matieres/:id`                        | Update matiere |
| DELETE | `/api/matieres/:id`                        | Delete matiere |
| GET    | `/api/matieres/:id/documents`              | List documents |
| POST   | `/api/matieres/:id/documents`              | Upload document |
| PUT    | `/api/matieres/:id/documents/:docId`       | Update document |
| DELETE | `/api/matieres/:id/documents/:docId`       | Delete document |
| GET    | `/api/matieres/:id/documents/:docId/download` | Download file |

### Archives
| Method | Path                        | Description |
|--------|-----------------------------|-------------|
| GET    | `/api/archives`             | List archives |
| POST   | `/api/archives`             | Upload archive |
| DELETE | `/api/archives/:id`         | Delete archive |
| GET    | `/api/archives/:id/download`| Download archive |

### Associations
| Method | Path                        | Description |
|--------|-----------------------------|-------------|
| GET    | `/api/associations`         | List teacher associations |
| PUT    | `/api/associations/:userId` | Save associations |

### AI Generations
| Method | Path                      | Description |
|--------|---------------------------|-------------|
| GET    | `/api/generations`        | List (paginated) |
| GET    | `/api/generations/stats`  | Stats per type |
| POST   | `/api/generations`        | Record new generation |
| GET    | `/api/generations/stream` | SSE real-time feed |

### Profile
| Method | Path                   | Description |
|--------|------------------------|-------------|
| GET    | `/api/profile`         | Get admin profile |
| PUT    | `/api/profile`         | Update profile |
| POST   | `/api/profile/avatar`  | Upload avatar |

### Notes
| Method | Path                   | Description |
|--------|------------------------|-------------|
| GET    | `/api/notes`           | List notes |
| POST   | `/api/notes`           | Create note |
| PATCH  | `/api/notes/:id/pin`   | Toggle pin |
| DELETE | `/api/notes/:id`       | Delete note |

### Stats
| Method | Path          | Description |
|--------|---------------|-------------|
| GET    | `/api/stats`  | Dashboard statistics |

---

## Authentication

All routes except `POST /api/auth/login` require:

```
Authorization: Bearer <token>
```

The `etablissementType` (`licence` or `cycle_ing`) is embedded in the JWT and used to scope every query — no cross-tenant data leakage is possible.

---

## File Uploads

- Documents (matieres): `multipart/form-data` with field name `file` + `titre`, `type`, `format`, `promo`
- Archives: same fields + `matiere`
- Avatar: `multipart/form-data` with field name `avatar`
- Files are stored in `./uploads/{documents,archives,avatars}/`
- Served statically at `/uploads/...`

---

## Production Notes

1. Replace SQLite with PostgreSQL: change `provider = "sqlite"` → `"postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`
2. Use a strong random `JWT_SECRET` (≥ 64 chars)
3. Store uploads in object storage (S3/MinIO) instead of disk
4. Add rate limiting (`express-rate-limit`) on auth routes
5. Add HTTPS / reverse proxy (nginx)
