import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import path from 'path'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'
import { uploadDocument, formatFileSize, deleteFile } from '../utils/upload'

const router = Router()
router.use(authenticate, requireAdmin)

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads')

// Helper to shape a Matiere for the frontend
async function getMatiereById(id: number, etablissementType: string) {
  return prisma.matiere.findFirst({
    where: { id, etablissementType },
    include: {
      matierePromos: { include: { promo: true } },
      documents: { orderBy: { uploadedAt: 'desc' } },
      _count: { select: { userMatieres: true } },
    },
  })
}

// â”€â”€ GET /api/matieres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { promoId, search } = req.query as Record<string, string>
  const etablissementType = req.user!.etablissementType

  try {
    const matieres = await prisma.matiere.findMany({
      where: {
        etablissementType,
        ...(search ? { nom: { contains: search } } : {}),
        ...(promoId
          ? { matierePromos: { some: { promoId: parseInt(promoId) } } }
          : {}),
      },
      include: {
        matierePromos: { include: { promo: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        _count: { select: { userMatieres: true } },
      },
      orderBy: { nom: 'asc' },
    })

    const shaped = matieres.map((m) => ({
      id: m.id,
      nom: m.nom,
      enseignantsCount: m._count.userMatieres,
      promoIds: m.matierePromos.map((mp) => mp.promoId),
      documents: m.documents.map((d) => ({
        id: d.id,
        titre: d.titre,
        type: d.type,
        format: d.format,
        fileName: d.fileName,
        size: d.size,
        uploadedAt: d.uploadedAt.toISOString(),
        promo: d.promo,
      })),
    }))

    res.json(shaped)
  } catch (err) {
    console.error('[Matieres] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ GET /api/matieres/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const m = await getMatiereById(id, etablissementType)
    if (!m) {
      res.status(404).json({ error: 'MatiÃ¨re introuvable' })
      return
    }
    res.json({
      id: m.id,
      nom: m.nom,
      enseignantsCount: m._count.userMatieres,
      promoIds: m.matierePromos.map((mp) => mp.promoId),
      documents: m.documents.map((d) => ({
        id: d.id, titre: d.titre, type: d.type, format: d.format,
        fileName: d.fileName, size: d.size,
        uploadedAt: d.uploadedAt.toISOString(), promo: d.promo,
      })),
    })
  } catch (err) {
    console.error('[Matieres] GET/:id error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ POST /api/matieres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/',
  [
    body('nom').notEmpty().trim(),
    body('promoIds').optional().isArray(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { nom, promoIds = [] } = req.body as { nom: string; promoIds?: number[] }
    const etablissementType = req.user!.etablissementType

    try {
      const matiere = await prisma.matiere.create({
        data: {
          nom,
          etablissementType,
          matierePromos: {
            create: promoIds.map((pid) => ({ promoId: pid })),
          },
        },
        include: {
          matierePromos: true,
          _count: { select: { userMatieres: true } },
        },
      })

      res.status(201).json({
        id: matiere.id,
        nom: matiere.nom,
        enseignantsCount: 0,
        promoIds: matiere.matierePromos.map((mp) => mp.promoId),
        documents: [],
      })
    } catch (err) {
      console.error('[Matieres] POST error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ PUT /api/matieres/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put(
  '/:id',
  [
    body('nom').optional().notEmpty().trim(),
    body('promoIds').optional().isArray(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const id = parseInt(String(req.params.id))
    const etablissementType = req.user!.etablissementType

    try {
      const existing = await prisma.matiere.findFirst({ where: { id, etablissementType } })
      if (!existing) {
        res.status(404).json({ error: 'MatiÃ¨re introuvable' })
        return
      }

      const { nom, promoIds } = req.body as { nom?: string; promoIds?: number[] }

      // Update matiere (and sync promo links if provided)
      await prisma.$transaction(async (tx) => {
        if (nom) await tx.matiere.update({ where: { id }, data: { nom } })
        if (promoIds !== undefined) {
          await tx.matierePromo.deleteMany({ where: { matiereId: id } })
          if (promoIds.length > 0) {
            await tx.matierePromo.createMany({
              data: promoIds.map((pid) => ({ matiereId: id, promoId: pid })),
            })
          }
        }
      })

      const updated = await getMatiereById(id, etablissementType)
      res.json({
        id: updated!.id,
        nom: updated!.nom,
        enseignantsCount: updated!._count.userMatieres,
        promoIds: updated!.matierePromos.map((mp) => mp.promoId),
        documents: updated!.documents.map((d) => ({
          id: d.id, titre: d.titre, type: d.type, format: d.format,
          fileName: d.fileName, size: d.size,
          uploadedAt: d.uploadedAt.toISOString(), promo: d.promo,
        })),
      })
    } catch (err) {
      console.error('[Matieres] PUT error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ DELETE /api/matieres/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const matiere = await prisma.matiere.findFirst({
      where: { id, etablissementType },
      include: { documents: true },
    })
    if (!matiere) {
      res.status(404).json({ error: 'MatiÃ¨re introuvable' })
      return
    }

    // Delete associated files from disk
    for (const doc of matiere.documents) {
      deleteFile(path.join(UPLOAD_DIR, 'documents', doc.filePath))
    }

    await prisma.matiere.delete({ where: { id } })
    res.json({ message: 'MatiÃ¨re supprimÃ©e' })
  } catch (err) {
    console.error('[Matieres] DELETE error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// DOCUMENTS (nested under matiere)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ GET /api/matieres/:id/documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/:id/documents', async (req: Request, res: Response): Promise<void> => {
  const matiereId = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const matiere = await prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
    if (!matiere) {
      res.status(404).json({ error: 'MatiÃ¨re introuvable' })
      return
    }

    const docs = await prisma.document.findMany({
      where: { matiereId },
      orderBy: { uploadedAt: 'desc' },
    })

    res.json(docs.map((d) => ({
      id: d.id, titre: d.titre, type: d.type, format: d.format,
      fileName: d.fileName, size: d.size,
      uploadedAt: d.uploadedAt.toISOString(), promo: d.promo,
    })))
  } catch (err) {
    console.error('[Matieres/Docs] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ POST /api/matieres/:id/documents (multipart) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/:id/documents',
  uploadDocument.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    const matiereId = parseInt(String(req.params.id))
    const etablissementType = req.user!.etablissementType

    try {
      const matiere = await prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
      if (!matiere) {
        res.status(404).json({ error: 'MatiÃ¨re introuvable' })
        return
      }

      if (!req.file) {
        res.status(400).json({ error: 'Aucun fichier fourni' })
        return
      }

      const { titre, type, format, promo } = req.body as {
        titre: string; type: string; format: string; promo: string
      }

      if (!titre || !type || !format || !promo) {
        deleteFile(req.file.path)
        res.status(400).json({ error: 'Champs manquants : titre, type, format, promo' })
        return
      }

      const doc = await prisma.document.create({
        data: {
          matiereId,
          titre,
          type,
          format,
          fileName: req.file.originalname,
          filePath: req.file.filename, // stored filename (UUID-based)
          size: formatFileSize(req.file.size),
          promo,
        },
      })

      res.status(201).json({
        id: doc.id, titre: doc.titre, type: doc.type, format: doc.format,
        fileName: doc.fileName, size: doc.size,
        uploadedAt: doc.uploadedAt.toISOString(), promo: doc.promo,
      })
    } catch (err) {
      if (req.file) deleteFile(req.file.path)
      console.error('[Matieres/Docs] POST error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ PUT /api/matieres/:id/documents/:docId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put(
  '/:id/documents/:docId',
  uploadDocument.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    const matiereId = parseInt(String(req.params.id))
    const docId = parseInt(String(req.params.docId))
    const etablissementType = req.user!.etablissementType

    try {
      const matiere = await prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
      if (!matiere) {
        res.status(404).json({ error: 'MatiÃ¨re introuvable' })
        return
      }

      const doc = await prisma.document.findFirst({ where: { id: docId, matiereId } })
      if (!doc) {
        res.status(404).json({ error: 'Document introuvable' })
        return
      }

      const { titre, type, format, promo } = req.body as Partial<{
        titre: string; type: string; format: string; promo: string
      }>

      let updateData: Partial<{
        titre: string; type: string; format: string; promo: string
        fileName: string; filePath: string; size: string
      }> = {}

      if (titre) updateData.titre = titre
      if (type) updateData.type = type
      if (format) updateData.format = format
      if (promo) updateData.promo = promo

      // Replace file if a new one was uploaded
      if (req.file) {
        deleteFile(path.join(UPLOAD_DIR, 'documents', doc.filePath))
        updateData = {
          ...updateData,
          fileName: req.file.originalname,
          filePath: req.file.filename,
          size: formatFileSize(req.file.size),
        }
      }

      const updated = await prisma.document.update({ where: { id: docId }, data: updateData })

      res.json({
        id: updated.id, titre: updated.titre, type: updated.type, format: updated.format,
        fileName: updated.fileName, size: updated.size,
        uploadedAt: updated.uploadedAt.toISOString(), promo: updated.promo,
      })
    } catch (err) {
      if (req.file) deleteFile(req.file.path)
      console.error('[Matieres/Docs] PUT error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ DELETE /api/matieres/:id/documents/:docId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.delete('/:id/documents/:docId', async (req: Request, res: Response): Promise<void> => {
  const matiereId = parseInt(String(req.params.id))
  const docId = parseInt(String(req.params.docId))
  const etablissementType = req.user!.etablissementType

  try {
    const matiere = await prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
    if (!matiere) {
      res.status(404).json({ error: 'MatiÃ¨re introuvable' })
      return
    }

    const doc = await prisma.document.findFirst({ where: { id: docId, matiereId } })
    if (!doc) {
      res.status(404).json({ error: 'Document introuvable' })
      return
    }

    deleteFile(path.join(UPLOAD_DIR, 'documents', doc.filePath))
    await prisma.document.delete({ where: { id: docId } })
    res.json({ message: 'Document supprimÃ©' })
  } catch (err) {
    console.error('[Matieres/Docs] DELETE error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ GET /api/matieres/:id/documents/:docId/download â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/:id/documents/:docId/download', async (req: Request, res: Response): Promise<void> => {
  const matiereId = parseInt(String(req.params.id))
  const docId = parseInt(String(req.params.docId))
  const etablissementType = req.user!.etablissementType

  try {
    const matiere = await prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
    if (!matiere) {
      res.status(404).json({ error: 'MatiÃ¨re introuvable' })
      return
    }

    const doc = await prisma.document.findFirst({ where: { id: docId, matiereId } })
    if (!doc) {
      res.status(404).json({ error: 'Document introuvable' })
      return
    }

    const filePath = path.join(UPLOAD_DIR, 'documents', doc.filePath)
    res.download(filePath, doc.fileName)
  } catch (err) {
    console.error('[Matieres/Docs] Download error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

