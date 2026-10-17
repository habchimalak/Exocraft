import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads')
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB ?? '20', 10)

// Ensure upload directories exist
const docDir      = path.join(UPLOAD_DIR, 'documents')
const archiveDir  = path.join(UPLOAD_DIR, 'archives')
const avatarDir   = path.join(UPLOAD_DIR, 'avatars')

for (const dir of [docDir, archiveDir, avatarDir]) {
  fs.mkdirSync(dir, { recursive: true })
}

function makeStorage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(UPLOAD_DIR, subdir))
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname)
      const uniqueName = `${uuidv4()}${ext}`
      cb(null, uniqueName)
    },
  })
}

const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function docFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_DOC_MIMES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Seuls les fichiers PDF et Word sont acceptés'))
  }
}

function imageFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Seuls les fichiers image (JPEG, PNG, WebP, GIF) sont acceptés'))
  }
}

export const uploadDocument = multer({
  storage: makeStorage('documents'),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: docFilter,
})

export const uploadArchive = multer({
  storage: makeStorage('archives'),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: docFilter,
})

export const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB for avatars
  fileFilter: imageFilter,
})

/** Convert file size in bytes to human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Delete a file from disk safely */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (err) {
    console.warn('[Upload] Could not delete file:', filePath, err)
  }
}
