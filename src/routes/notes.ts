import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()
router.use(authenticate, requireAdmin)

function shapeNote(n: {
  id: number; content: string; pinned: boolean; tag: string
  createdAt: Date; updatedAt: Date
  author: { id: number; nom: string; prenom: string }
}) {
  return {
    id: n.id,
    content: n.content,
    pinned: n.pinned,
    tag: n.tag,
    author: `${n.author.prenom} ${n.author.nom}`,
    authorId: n.author.id,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }
}

// â”€â”€ GET /api/notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const etablissementType = req.user!.etablissementType

  try {
    const notes = await prisma.adminNote.findMany({
      where: { etablissementType },
      include: { author: { select: { id: true, nom: true, prenom: true } } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    res.json(notes.map(shapeNote))
  } catch (err) {
    console.error('[Notes] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ POST /api/notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/',
  [
    body('content').notEmpty().trim(),
    body('tag').optional().isIn(['info', 'urgent', 'todo', 'done']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { content, tag = 'info' } = req.body as { content: string; tag?: string }
    const etablissementType = req.user!.etablissementType

    try {
      const note = await prisma.adminNote.create({
        data: {
          content,
          tag,
          authorId: req.user!.userId,
          etablissementType,
        },
        include: { author: { select: { id: true, nom: true, prenom: true } } },
      })
      res.status(201).json(shapeNote(note))
    } catch (err) {
      console.error('[Notes] POST error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ PATCH /api/notes/:id/pin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.patch('/:id/pin', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const note = await prisma.adminNote.findFirst({ where: { id, etablissementType } })
    if (!note) {
      res.status(404).json({ error: 'Note introuvable' })
      return
    }

    const updated = await prisma.adminNote.update({
      where: { id },
      data: { pinned: !note.pinned },
      include: { author: { select: { id: true, nom: true, prenom: true } } },
    })
    res.json(shapeNote(updated))
  } catch (err) {
    console.error('[Notes] PATCH pin error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ DELETE /api/notes/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const note = await prisma.adminNote.findFirst({ where: { id, etablissementType } })
    if (!note) {
      res.status(404).json({ error: 'Note introuvable' })
      return
    }

    await prisma.adminNote.delete({ where: { id } })
    res.json({ message: 'Note supprimÃ©e' })
  } catch (err) {
    console.error('[Notes] DELETE error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

