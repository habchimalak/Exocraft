import { Router, Request, Response } from 'express'
import path from 'path'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'
import { uploadArchive, formatFileSize, deleteFile } from '../utils/upload'

const router = Router()
router.use(authenticate, requireAdmin)

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads')

// â”€â”€ GET /api/archives â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { type, matiere, promo, search } = req.query as Record<string, string>
  const etablissementType = req.user!.etablissementType

  try {
    const archives = await prisma.archive.findMany({
      where: {
        etablissementType,
        ...(type ? { type } : {}),
        ...(matiere ? { matiere: { contains: matiere } } : {}),
        ...(promo ? { promo: { contains: promo } } : {}),
        ...(search
          ? {
              OR: [
                { titre: { contains: search } },
                { matiere: { contains: search } },
                { promo: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(archives.map((a) => ({
      id: a.id,
      titre: a.titre,
      type: a.type,
      format: a.format,
      fichier: a.fileName,
      size: a.size,
      matiere: a.matiere,
      promo: a.promo,
      uploadedBy: a.uploadedBy,
      created_at: a.createdAt.toISOString(),
    })))
  } catch (err) {
    console.error('[Archives] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ POST /api/archives (multipart) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/',
  uploadArchive.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    const etablissementType = req.user!.etablissementType

    if (!req.file) {
      res.status(400).json({ error: 'Aucun fichier fourni' })
      return
    }

    const { titre, type, format, matiere, promo } = req.body as {
      titre: string; type: string; format: string; matiere: string; promo: string
    }

    if (!titre || !type || !format || !matiere || !promo) {
      deleteFile(req.file.path)
      res.status(400).json({ error: 'Champs manquants : titre, type, format, matiere, promo' })
      return
    }

    if (!['cours', 'examen'].includes(type)) {
      deleteFile(req.file.path)
      res.status(400).json({ error: 'Type invalide â€” valeurs acceptÃ©es : cours, examen' })
      return
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
      const uploadedBy = user ? `${user.prenom} ${user.nom}` : 'Administrateur'

      const archive = await prisma.archive.create({
        data: {
          titre,
          type,
          format,
          fileName: req.file.originalname,
          filePath: req.file.filename,
          size: formatFileSize(req.file.size),
          matiere,
          promo,
          uploadedBy,
          uploadedById: req.user!.userId,
          etablissementType,
        },
      })

      res.status(201).json({
        id: archive.id,
        titre: archive.titre,
        type: archive.type,
        format: archive.format,
        fichier: archive.fileName,
        size: archive.size,
        matiere: archive.matiere,
        promo: archive.promo,
        uploadedBy: archive.uploadedBy,
        created_at: archive.createdAt.toISOString(),
      })
    } catch (err) {
      if (req.file) deleteFile(req.file.path)
      console.error('[Archives] POST error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ DELETE /api/archives/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const archive = await prisma.archive.findFirst({ where: { id, etablissementType } })
    if (!archive) {
      res.status(404).json({ error: 'Archive introuvable' })
      return
    }

    deleteFile(path.join(UPLOAD_DIR, 'archives', archive.filePath))
    await prisma.archive.delete({ where: { id } })
    res.json({ message: 'Archive supprimÃ©e' })
  } catch (err) {
    console.error('[Archives] DELETE error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ GET /api/archives/:id/download â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/:id/download', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const archive = await prisma.archive.findFirst({ where: { id, etablissementType } })
    if (!archive) {
      res.status(404).json({ error: 'Archive introuvable' })
      return
    }

    const filePath = path.join(UPLOAD_DIR, 'archives', archive.filePath)
    res.download(filePath, archive.fileName)
  } catch (err) {
    console.error('[Archives] Download error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

