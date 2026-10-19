import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export const UPLOAD_DIR_PATH = path.resolve(process.env.UPLOAD_DIR ?? './uploads')

for (const dir of ['documents', 'archives', 'avatars']) {
  fs.mkdirSync(path.join(UPLOAD_DIR_PATH, dir), { recursive: true })
}

function makeStorage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_DIR_PATH, subdir)),
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  })
}

const DOC_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const uploadDocument = multer({
  storage: makeStorage('documents'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => { cb(null, DOC_MIMES.includes(file.mimetype)) },
})

export const uploadArchive = multer({
  storage: makeStorage('archives'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => { cb(null, DOC_MIMES.includes(file.mimetype)) },
})

export const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => { cb(null, file.mimetype.startsWith('image/')) },
})

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function deleteFile(filePath: string): void {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch {}
}
