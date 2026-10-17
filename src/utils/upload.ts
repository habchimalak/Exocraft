import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads')

for (const dir of ['documents', 'archives', 'avatars']) {
  fs.mkdirSync(path.join(UPLOAD_DIR, dir), { recursive: true })
}

function makeStorage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_DIR, subdir)),
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  })
}

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB ?? '20', 10) * 1024 * 1024
const DOC_MIME = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export const documentMulter = multer({ storage: makeStorage('documents'), limits: { fileSize: MAX_SIZE }, fileFilter: (_req, file, cb) => { cb(null, DOC_MIME.includes(file.mimetype)) } })
export const archiveMulter  = multer({ storage: makeStorage('archives'),  limits: { fileSize: MAX_SIZE }, fileFilter: (_req, file, cb) => { cb(null, DOC_MIME.includes(file.mimetype)) } })
export const avatarMulter   = multer({ storage: makeStorage('avatars'),   limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => { cb(null, file.mimetype.startsWith('image/')) } })

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function deleteFile(filePath: string): void {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch {}
}

export const UPLOAD_DIR_PATH = UPLOAD_DIR
