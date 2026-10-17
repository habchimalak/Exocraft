import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import promoRoutes from './routes/promos'
import matiereRoutes from './routes/matieres'
import archiveRoutes from './routes/archives'
import associationRoutes from './routes/associations'
import generationRoutes from './routes/generations'
import profileRoutes from './routes/profile'
import noteRoutes from './routes/notes'
import statsRoutes from './routes/stats'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

// ── Middleware ──
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR ?? './uploads')))

// ── Routes ──
app.use('/api/auth',         authRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/promos',       promoRoutes)
app.use('/api/matieres',     matiereRoutes)
app.use('/api/archives',     archiveRoutes)
app.use('/api/associations', associationRoutes)
app.use('/api/generations',  generationRoutes)
app.use('/api/profile',      profileRoutes)
app.use('/api/notes',        noteRoutes)
app.use('/api/stats',        statsRoutes)

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Global error handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`✅ ExoCraft Backend running on http://localhost:${PORT}`)
})

export default app
